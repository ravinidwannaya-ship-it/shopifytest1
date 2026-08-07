import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, Download, MapPin, MessageCircle, Package } from "lucide-react";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/catalog";
import {
  currentStage,
  formatOrderDate,
  ORDER_STAGES,
  useOrders,
  type Order,
} from "@/lib/orders";
import { cn } from "@/lib/utils";
import { customerConfirmationLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/order/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Order ${params.id} — Kyathi` },
      { name: "description", content: "Your Kyathi order confirmation and delivery timeline." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Order confirmation — Kyathi" },
      { property: "og:description", content: "Your Kyathi order confirmation." },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const orders = useOrders();
  const order = orders.find((o) => o.id.toLowerCase() === id.toLowerCase());

  if (!order) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-24 text-center sm:px-6">
        <Package className="mx-auto h-10 w-10 text-muted-foreground/60" />
        <h1 className="mt-6 font-serif text-3xl">Order {id} not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Orders are saved on the device they were placed from. Try the tracking page, or write to
          care@kyathi.in with your order ID.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/track-order">Track an order</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Continue shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <CheckCircle2 className="h-10 w-10 text-accent" />
          <h1 className="mt-4 text-4xl leading-tight">Thank you, {order.customer.fullName.split(" ")[0]}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Order <span className="font-semibold text-foreground">{order.id}</span> was placed on{" "}
            {formatOrderDate(order.placedAt)}. Your confirmation is on its way to{" "}
            {order.customer.email} and {order.customer.phone} on WhatsApp, and your pieces are being
            prepared for dispatch.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/track-order" search={{ id: order.id }}>
                Track this order
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a href={customerConfirmationLink(order)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" /> Confirmation on WhatsApp
              </a>
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="mr-2 h-4 w-4" /> Print receipt
            </Button>
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 grid gap-10">
            <Timeline order={order} />

            <div>
              <h2 className="font-serif text-2xl">Items</h2>
              <ul className="mt-5 grid gap-4">
                {order.lines.map((l) => (
                  <li
                    key={`${l.productSlug}-${l.size}-${l.finish}`}
                    className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-4 border-b border-border pb-4 last:border-0"
                  >
                    <img src={l.image} alt="" className="h-20 w-16 rounded-xs object-cover" />
                    <div className="min-w-0">
                      <Link
                        to="/products/$slug"
                        params={{ slug: l.productSlug }}
                        className="block truncate text-sm font-medium hover:text-primary"
                      >
                        {l.name}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {l.size} · {l.finish} · Qty {l.quantity}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm">{formatINR(l.lineTotal)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="h-fit grid gap-6">
            <div className="rounded-sm border border-border bg-card p-6">
              <h2 className="font-serif text-xl">Payment summary</h2>
              <dl className="mt-5 grid gap-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{formatINR(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd>{order.shipping === 0 ? "Free" : formatINR(order.shipping)}</dd>
                </div>
                <div className="mt-2 flex justify-between border-t border-border pt-3 text-base font-semibold">
                  <dt>Total</dt>
                  <dd>{formatINR(order.total)}</dd>
                </div>
                <div className="flex justify-between pt-1 text-xs text-muted-foreground">
                  <dt>Paid by</dt>
                  <dd>{order.paymentLabel}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-sm border border-border p-6 text-sm">
              <h2 className="flex items-center gap-2 font-serif text-xl">
                <MapPin className="h-4 w-4 text-accent" /> Delivery
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {order.customer.fullName}
                <br />
                {order.customer.address}
                <br />
                {order.customer.city}, {order.customer.state} {order.customer.pincode}
                <br />
                {order.customer.phone}
              </p>
              <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
                Estimated delivery by{" "}
                <span className="font-medium text-foreground">{order.delivery.etaLabel}</span> ·{" "}
                {order.delivery.zone}
              </p>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}

function Timeline({ order }: { order: Order }) {
  const stage = Math.max(order.status, currentStage(order));
  return (
    <div>
      <h2 className="font-serif text-2xl">Order status</h2>
      <ol className="mt-5 grid gap-6">
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
    </div>
  );
}
