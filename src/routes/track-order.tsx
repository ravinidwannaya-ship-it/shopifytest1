import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Circle, PackageSearch } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/catalog";
import {
  currentStage,
  formatOrderDate,
  ORDER_STAGES,
  useOrders,
  type Order,
} from "@/lib/orders";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/track-order")({
  validateSearch: (search: Record<string, unknown>): { id?: string } =>
    typeof search["id"] === "string" && search["id"] ? { id: search["id"] } : {},
  head: () => ({
    meta: [
      { title: "Track Your Order — Kyathi" },
      {
        name: "description",
        content: "Enter your Kyathi order ID to see finishing, dispatch and delivery status.",
      },
      { property: "og:title", content: "Track Your Order — Kyathi" },
      { property: "og:description", content: "Live status for your idol or frame shipment." },
    ],
  }),
  component: TrackOrderPage,
});

function TrackOrderPage() {
  const { id: searchId } = Route.useSearch();
  const navigate = useNavigate();
  const orders = useOrders();
  const [query, setQuery] = useState(searchId ?? "");
  const [submitted, setSubmitted] = useState(searchId ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (searchId) {
      setQuery(searchId);
      setSubmitted(searchId);
    }
  }, [searchId]);

  const order = submitted
    ? orders.find((o) => o.id.toLowerCase() === submitted.trim().toLowerCase())
    : undefined;

  const track = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const id = query.trim().toUpperCase();
    if (!/^KY\d{6}$/.test(id)) {
      setError("Order IDs look like KY123456. Check your confirmation email.");
      setSubmitted("");
      return;
    }
    setError("");
    setSubmitted(id);
    navigate({ to: "/track-order", search: { id }, replace: true });
  };

  return (
    <>
      <PageHero
        eyebrow="Order status"
        title="Track your order"
        copy="Your order ID is in the confirmation email and looks like KY123456."
      />

      <Section>
        <div className="mx-auto grid w-full max-w-2xl gap-8">
          <form
            onSubmit={track}
            className="grid gap-4 rounded-sm border border-border bg-card p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-8"
          >
            <div className="grid gap-2">
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                name="orderId"
                placeholder="KY123456"
                value={query}
                onChange={(e) => setQuery(e.target.value.toUpperCase())}
                required
              />
            </div>
            <Button type="submit" size="lg">
              Track
            </Button>
            {error ? <p className="text-sm text-destructive sm:col-span-2">{error}</p> : null}
          </form>

          {submitted && !order ? (
            <p className="rounded-sm border border-border p-6 text-sm text-muted-foreground">
              We can't find <span className="font-medium text-foreground">{submitted}</span> on this
              device. Orders are stored with the browser they were placed from — write to
              care@kyathi.in and we'll look it up for you.
            </p>
          ) : null}

          {order ? <OrderStatus order={order} /> : null}

          {orders.length > 0 ? (
            <div>
              <h2 className="font-serif text-xl">Your recent orders</h2>
              <ul className="mt-4 grid gap-2">
                {orders.slice(0, 5).map((o) => (
                  <li key={o.id}>
                    <Link
                      to="/order/$id"
                      params={{ id: o.id }}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-border p-4 text-sm transition-colors hover:border-accent"
                    >
                      <span className="font-medium">{o.id}</span>
                      <span className="text-muted-foreground">
                        {formatOrderDate(o.placedAt)} · {o.lines.length} item
                        {o.lines.length === 1 ? "" : "s"} · {formatINR(o.total)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Section>
    </>
  );
}

function OrderStatus({ order }: { order: Order }) {
  const stage = Math.max(order.status, currentStage(order));
  return (
    <div className="rounded-sm border border-border p-6 sm:p-8">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <PackageSearch className="h-5 w-5 shrink-0 text-accent" />
        <div className="min-w-0">
          <p className="font-serif text-2xl">{order.id}</p>
          <p className="text-sm text-muted-foreground">
            {stage === ORDER_STAGES.length - 1
              ? "Delivered"
              : `Estimated delivery by ${order.delivery.etaLabel}`}
          </p>
        </div>
      </div>

      <ol className="mt-7 grid gap-6">
        {ORDER_STAGES.map((s, i) => {
          const done = i <= stage;
          return (
            <li key={s.title} className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
              <div className="grid justify-items-center">
                {done ? (
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/50" />
                )}
                {i < ORDER_STAGES.length - 1 ? (
                  <span className={cn("mt-1 h-8 w-px bg-border", done && "bg-accent/60")} />
                ) : null}
              </div>
              <div className="min-w-0 pb-1">
                <p className={cn("text-sm font-medium", !done && "text-muted-foreground")}>
                  {s.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.copy}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-7 border-t border-border pt-5">
        <Button asChild variant="outline" size="sm">
          <Link to="/order/$id" params={{ id: order.id }}>
            View full order
          </Link>
        </Button>
      </div>
    </div>
  );
}
