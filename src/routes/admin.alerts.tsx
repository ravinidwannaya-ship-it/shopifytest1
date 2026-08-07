import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BellRing, Mail, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { sendEmail } from "@/lib/emailjs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-store";

export const Route = createFileRoute("/admin/alerts")({
  component: AdminAlerts,
});

interface AlertRow {
  id: string;
  product_slug: string;
  product_name: string;
  email: string;
  notified_at: string | null;
  created_at: string;
}

interface CartRow {
  id: string;
  email: string;
  subtotal: number;
  items: unknown;
  reminder_sent_at: string | null;
  recovered_at: string | null;
  updated_at: string;
}

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

function AdminAlerts() {
  const { products } = useCatalog();
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [carts, setCarts] = useState<CartRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [a, c] = await Promise.all([
      supabase
        .from("back_in_stock_requests")
        .select("id, product_slug, product_name, email, notified_at, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("abandoned_carts")
        .select("id, email, subtotal, items, reminder_sent_at, recovered_at, updated_at")
        .order("updated_at", { ascending: false })
        .limit(200),
    ]);
    setLoading(false);
    if (a.error) toast.error("Couldn't load stock alerts", { description: a.error.message });
    if (c.error) toast.error("Couldn't load carts", { description: c.error.message });
    setAlerts((a.data ?? []) as AlertRow[]);
    setCarts((c.data ?? []) as CartRow[]);
  };

  useEffect(() => {
    void load();
  }, []);

  const stockBySlug = useMemo(
    () => Object.fromEntries(products.map((p) => [p.slug, p.stock])),
    [products],
  );

  const markNotified = async (id: string) => {
    const row = alerts.find((a) => a.id === id);
    if (row?.email) {
      await sendEmail({
        to: row.email,
        subject: `${row.product_name} is back in stock — Kyathi`,
        message: `Namaste,\n\nGood news — ${row.product_name} is available again. It's limited, so we've written to you first.\n\nOrder it here: https://kyathi.lovable.app/products/${row.product_slug}\n\n— Kyathi Heritage, Puttur`,
      });
    }
    const { error } = await supabase
      .from("back_in_stock_requests")
      .update({ notified_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error("Update failed", { description: error.message });
      return;
    }
    setAlerts((p) => p.map((r) => (r.id === id ? { ...r, notified_at: new Date().toISOString() } : r)));
    toast.success("Marked as notified");
  };

  const removeAlert = async (id: string) => {
    const { error } = await supabase.from("back_in_stock_requests").delete().eq("id", id);
    if (error) {
      toast.error("Delete failed", { description: error.message });
      return;
    }
    setAlerts((p) => p.filter((r) => r.id !== id));
  };

  const itemCount = (items: unknown) => (Array.isArray(items) ? items.length : 0);

  return (
    <div className="grid gap-12">
      <section className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-serif text-2xl">
              <BellRing className="h-5 w-5 text-accent" /> Back-in-stock alerts
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Customers waiting on sold-out pieces. Rows marked <strong>Ready</strong> now have
              stock again and are queued for an automatic reminder email.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>

        <div className="overflow-x-auto rounded-sm border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Customer email</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>State</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : alerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No one is waiting on a sold-out piece right now.
                  </TableCell>
                </TableRow>
              ) : (
                alerts.map((r) => {
                  const back = (stockBySlug[r.product_slug] ?? 0) > 0;
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        {r.product_name || r.product_slug}
                      </TableCell>
                      <TableCell className="text-sm">{r.email}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {when(r.created_at)}
                      </TableCell>
                      <TableCell>
                        {r.notified_at ? (
                          <Badge variant="secondary">Notified</Badge>
                        ) : back ? (
                          <Badge>Ready</Badge>
                        ) : (
                          <Badge variant="outline">Waiting</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {!r.notified_at ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => void markNotified(r.id)}
                            >
                              <Mail className="mr-2 h-4 w-4" /> Mark notified
                            </Button>
                          ) : null}
                          <Button size="sm" variant="ghost" onClick={() => void removeAlert(r.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="font-serif text-2xl">Abandoned carts</h2>
        <p className="-mt-2 text-sm text-muted-foreground">
          Carts are held for 3 hours. Once that lapses, the reminder job flags the cart and the
          shopper gets a "you left something behind" email.
        </p>
        <div className="overflow-x-auto rounded-sm border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead>Last updated</TableHead>
                <TableHead>Reminder</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {carts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No saved carts yet.
                  </TableCell>
                </TableRow>
              ) : (
                carts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-sm">{c.email}</TableCell>
                    <TableCell className="text-sm">{itemCount(c.items)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatINR(c.subtotal)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {when(c.updated_at)}
                    </TableCell>
                    <TableCell>
                      {c.recovered_at ? (
                        <Badge variant="secondary">Recovered</Badge>
                      ) : c.reminder_sent_at ? (
                        <Badge>Sent</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
