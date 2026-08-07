import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { ProductCard } from "@/components/product-card";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { useStore } from "@/context/store-context";
import { getProduct } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-store";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Your Wishlist — Kyathi" },
      {
        name: "description",
        content: "The gold-coated silver idols and photo frames you have saved at Kyathi.",
      },
      { property: "og:title", content: "Your Wishlist — Kyathi" },
      { property: "og:description", content: "Saved idols and framed deity reliefs." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  useCatalog();
  const { wishlist, toggleWishlist } = useStore();
  const items = wishlist.flatMap((slug) => {
    const product = getProduct(slug);
    return product ? [product] : [];
  });

  return (
    <>
      <PageHero
        eyebrow="Saved for later"
        title="Your wishlist"
        copy="Saved on this device — your pieces stay here when you come back."
      />

      <Section>
        {items.length === 0 ? (
          <div className="mx-auto max-w-md py-10 text-center">
            <Heart className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <h2 className="mt-5 font-serif text-2xl">Nothing saved yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tap the heart on any idol or frame and it will wait for you here.
            </p>
            <Button asChild className="mt-6">
              <Link to="/collections/$slug" params={{ slug: "gold-coated-silver" }}>
                Browse the collection
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {items.length} saved {items.length === 1 ? "piece" : "pieces"}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => items.forEach((p) => toggleWishlist(p.slug))}
              >
                Clear wishlist
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </Section>
    </>
  );
}
