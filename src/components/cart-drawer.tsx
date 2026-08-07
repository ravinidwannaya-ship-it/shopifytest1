import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FREE_SHIPPING_THRESHOLD, useStore } from "@/context/store-context";
import { formatINR } from "@/lib/catalog";

export function CartDrawer() {
  const { cartOpen, setCartOpen, lines, subtotal, setQuantity, removeLine } = useStore();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="font-serif text-xl">Your cart</SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-lg">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">
              Every piece is cast to order — start with the Divine Series.
            </p>
            <Button asChild onClick={() => setCartOpen(false)}>
              <Link to="/collections/$slug" params={{ slug: "gold-coated-silver" }}>
                Browse sculptures
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="border-b border-border bg-secondary/50 px-5 py-2.5 text-center text-xs text-muted-foreground">
              {remaining > 0
                ? `Add ${formatINR(remaining)} more for free shipping`
                : "Free shipping unlocked"}
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="grid gap-5">
                {lines.map((line) => (
                  <li key={line.key} className="grid grid-cols-[80px_minmax(0,1fr)] gap-3.5">
                    <Link
                      to="/products/$slug"
                      params={{ slug: line.product.slug }}
                      onClick={() => setCartOpen(false)}
                      className="overflow-hidden rounded-sm bg-secondary"
                    >
                      <img
                        src={line.product.images[0]}
                        alt={line.product.name}
                        loading="lazy"
                        className="h-24 w-20 object-cover"
                      />
                    </Link>
                    <div className="min-w-0">
                      <p className="truncate font-serif text-base">{line.product.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {line.size} · {line.finish}
                      </p>
                      <p className="mt-1 text-sm font-semibold">{formatINR(line.unitPrice)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center rounded-xs border border-border">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-foreground"
                            onClick={() => setQuantity(line.key, line.quantity - 1)}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-7 text-center text-sm">{line.quantity}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-foreground"
                            onClick={() => setQuantity(line.key, line.quantity + 1)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLine(line.key)}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                          aria-label={`Remove ${line.product.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border px-5 py-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-lg font-semibold">{formatINR(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Taxes included. Shipping calculated at checkout.
              </p>
              <div className="mt-4 grid gap-2">
                <Button asChild size="lg" onClick={() => setCartOpen(false)}>
                  <Link to="/checkout">Checkout</Link>
                </Button>
                <Button asChild variant="outline" onClick={() => setCartOpen(false)}>
                  <Link to="/cart">View cart</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
