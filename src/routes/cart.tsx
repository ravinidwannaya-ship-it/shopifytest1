import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartReminder } from "@/components/cart-reminder";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { FREE_SHIPPING_THRESHOLD, useStore } from "@/context/store-context";
import { formatINR } from "@/lib/catalog";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Kyathi" },
      { name: "description", content: "Review the sculptures in your Kyathi cart before checkout." },
      { property: "og:title", content: "Your Cart — Kyathi" },
      { property: "og:description", content: "Review your handcrafted sculpture selection." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, subtotal, shipping, total, setQuantity, removeLine } = useStore();

  return (
    <>
      <PageHero eyebrow="Step 1 of 2" title="Your cart" />

      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {lines.length === 0 ? (
          <div className="rounded-sm border border-dashed border-border px-6 py-20 text-center">
            <p className="font-serif text-2xl">Your cart is empty</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Start with the Divine Series or browse this season's new castings.
            </p>
            <Button asChild className="mt-6">
              <Link to="/collections/$slug" params={{ slug: "gold-coated-silver" }}>
                Browse sculptures
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="grid gap-8">
              <CartReminder />
              <ul className="grid gap-6">
              {lines.map((line) => (
                <li
                  key={line.key}
                  className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 border-b border-border pb-6 sm:grid-cols-[128px_minmax(0,1fr)_auto]"
                >
                  <Link
                    to="/products/$slug"
                    params={{ slug: line.product.slug }}
                    className="overflow-hidden rounded-sm bg-secondary"
                  >
                    <img
                      src={line.product.images[0]}
                      alt={line.product.name}
                      loading="lazy"
                      className="h-32 w-full object-cover"
                    />
                  </Link>
                  <div className="min-w-0">
                    <Link
                      to="/products/$slug"
                      params={{ slug: line.product.slug }}
                      className="font-serif text-xl leading-snug hover:text-primary"
                    >
                      {line.product.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {line.size} · {line.finish} · {line.product.material}
                    </p>
                    <p className="mt-2 text-sm font-semibold">{formatINR(line.unitPrice)}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center rounded-xs border border-border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          className="grid h-8 w-8 place-items-center text-muted-foreground hover:text-foreground"
                          onClick={() => setQuantity(line.key, line.quantity - 1)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          className="grid h-8 w-8 place-items-center text-muted-foreground hover:text-foreground"
                          onClick={() => setQuantity(line.key, line.quantity + 1)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLine(line.key)}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                  <p className="hidden shrink-0 text-right font-semibold sm:block">
                    {formatINR(line.lineTotal)}
                  </p>
                </li>
              ))}
              </ul>
            </div>

            <aside className="h-fit rounded-sm border border-border bg-card p-6 lg:sticky lg:top-28">
              <h2 className="font-serif text-xl">Order summary</h2>
              <dl className="mt-5 grid gap-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{formatINR(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd>{shipping === 0 ? "Free" : formatINR(shipping)}</dd>
                </div>
                <div className="mt-2 flex justify-between border-t border-border pt-3 text-base font-semibold">
                  <dt>Total</dt>
                  <dd>{formatINR(total)}</dd>
                </div>
              </dl>
              {subtotal < FREE_SHIPPING_THRESHOLD ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Add {formatINR(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping.
                </p>
              ) : null}
              <Button asChild size="lg" className="mt-6 w-full">
                <Link to="/checkout">Proceed to checkout</Link>
              </Button>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
