import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

interface OrderRow {
  id: string;
  order_code: string;
  status: string;
  payment_label: string;
  total: number;
  placed_at: string;
  customer: { name?: string; email?: string; phone?: string } | null;
}

const STATUSES = ["confirmed", "crafting", "packed", "shipped", "delivered", "cancelled"] as const;

function AdminOrders() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("id, order_code, status, payment_label, total, placed_at, customer")
      .order("placed_at", { ascending: false })
      .limit(200);
    setLoading(false);
    if (error) {
      toast.error("Couldn't load orders", { description: error.message });
      return;
    }
    setRows((data ?? []) as unknown as OrderRow[]);
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      `${r.order_code} ${r.customer?.name ?? ""} ${r.customer?.email ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [rows, query]);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      toast.error("Update failed", { description: error.message });
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success(`Order marked ${status}`);
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search order code, name or email…"
          className="max-w-sm"
          aria-label="Search orders"
        />
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{rows.length} orders</span>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-sm border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Placed</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  Loading orders…
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No orders yet.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.order_code}</TableCell>
                  <TableCell className="text-sm">
                    <div>{r.customer?.name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{r.customer?.email ?? ""}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(r.placed_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-sm">
                    <Badge variant="secondary">{r.payment_label}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{formatINR(r.total)}</TableCell>
                  <TableCell>
                    <Select value={r.status} onValueChange={(v) => void setStatus(r.id, v)}>
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
