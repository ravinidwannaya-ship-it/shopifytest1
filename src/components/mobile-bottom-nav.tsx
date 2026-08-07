import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Home, LayoutGrid, ShoppingBag } from "lucide-react";
import { useStore } from "@/context/store-context";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const { itemCount, setCartOpen, wishlist } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const itemCls = (active: boolean) =>
    cn(
      "flex min-h-11 flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium tracking-wide",
      active ? "text-primary" : "text-muted-foreground",
    );

  const shopActive = pathname.startsWith("/collections");
  const savedActive = pathname === "/wishlist";
  const homeActive = pathname === "/";

  return (
    <nav
      aria-label="Primary"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden"
    >
      <div className="mx-auto flex max-w-lg items-stretch">
        <Link to="/" aria-current={homeActive ? "page" : undefined} className={itemCls(homeActive)}>
          <Home className="h-5 w-5" aria-hidden="true" />
          Home
        </Link>
        <Link
          to="/collections/$slug"
          params={{ slug: "gold-coated-silver" }}
          aria-current={shopActive ? "page" : undefined}
          className={itemCls(shopActive)}
        >
          <LayoutGrid className="h-5 w-5" aria-hidden="true" />
          Shop
        </Link>
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
          className={itemCls(false)}
        >
          <span className="relative">
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            {itemCount > 0 ? (
              <span
                aria-hidden="true"
                className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] text-primary-foreground"
              >
                {itemCount}
              </span>
            ) : null}
          </span>
          Cart
        </button>
        <Link
          to="/wishlist"
          aria-current={savedActive ? "page" : undefined}
          className={itemCls(savedActive)}
        >
          <span className="relative">
            <Heart className="h-5 w-5" aria-hidden="true" />
            {wishlist.length > 0 ? (
              <span
                aria-hidden="true"
                className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] text-primary-foreground"
              >
                {wishlist.length}
              </span>
            ) : null}
          </span>
          Saved
        </Link>
      </div>
    </nav>
  );
}
