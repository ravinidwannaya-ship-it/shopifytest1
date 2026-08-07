import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { PriceTag } from "@/components/price-tag";
import { RatingStars } from "@/components/rating-stars";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@/context/store-context";
import type { Product } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const { addToCart, setCartOpen, toggleWishlist, isWishlisted } = useStore();
  const wishlisted = isWishlisted(product.slug);
  const primary = product.images[0] ?? "";
  const secondary = product.images[1] ?? primary;
  const firstSize = product.sizes[0]?.label ?? "";
  const firstFinish = product.finishes[0] ?? "";

  const quickAdd = () => {
    addToCart({ productSlug: product.slug, size: firstSize, finish: firstFinish, quantity: 1 });
    setCartOpen(true);
    toast.success("Added to cart", { description: `${product.name} · ${firstSize}` });
  };

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className="relative overflow-hidden rounded-sm bg-secondary/50">
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="block aspect-4/5 w-full"
          aria-label={product.name}
        >
          <img
            src={primary}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-0"
          />
          <img
            src={secondary}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-all duration-700 group-hover:opacity-100"
          />
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.tags.includes("new") ? (
            <span className="rounded-xs bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
              New
            </span>
          ) : null}
          {product.stock <= 3 ? (
            <span className="rounded-xs bg-terracotta px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-terracotta-foreground">
              Only {product.stock} left
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => {
            toggleWishlist(product.slug);
            toast(wishlisted ? "Removed from wishlist" : "Saved to wishlist");
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/85 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
        >
          <Heart className={cn("h-4 w-4", wishlisted && "fill-primary text-primary")} />
        </button>

        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-within:translate-y-0 focus-within:opacity-100">
          <Button size="sm" className="w-full gap-2" onClick={quickAdd}>
            <ShoppingBag className="h-4 w-4" />
            Quick add
          </Button>
        </div>
      </div>

      <div className="mt-3.5 flex min-w-0 flex-col gap-1.5">
        <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
        <h3 className="text-lg leading-snug">
          <Link
            to="/products/$slug"
            params={{ slug: product.slug }}
            className="transition-colors hover:text-primary"
          >
            {product.name}
          </Link>
        </h3>
        <p className="text-xs text-muted-foreground">
          {product.material} · {product.sizes.map((s) => s.label).join(" / ")}
        </p>
        <PriceTag price={product.price} compareAt={product.compareAtPrice} className="mt-0.5" />
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-4/5 w-full rounded-sm" />
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function ProductGrid({
  products,
  loading = false,
  columns = 4,
  skeletonCount = 8,
}: {
  products: Product[];
  loading?: boolean;
  columns?: 3 | 4;
  skeletonCount?: number;
}) {
  const gridCls = cn(
    "grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6",
    columns === 4 ? "lg:grid-cols-4 md:grid-cols-3" : "lg:grid-cols-3 md:grid-cols-3",
  );

  if (loading) {
    return (
      <div className={gridCls}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-sm border border-dashed border-border px-6 py-16 text-center">
        <p className="text-lg">No sculptures match these filters</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try widening the price range or clearing a material filter.
        </p>
      </div>
    );
  }

  return (
    <div className={gridCls}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export function ProductRail({ products }: { products: Product[] }) {
  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          className="w-[68vw] shrink-0 snap-start sm:w-[45vw] md:w-[30vw] lg:w-[22rem]"
        />
      ))}
    </div>
  );
}
