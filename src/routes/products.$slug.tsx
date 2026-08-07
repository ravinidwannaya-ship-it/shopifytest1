import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Heart, Minus, Plus } from "lucide-react";
import { BackInStockForm } from "@/components/back-in-stock-form";
import { ShareButton } from "@/components/share-button";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PincodeCheck } from "@/components/pincode-check";
import { PriceTag } from "@/components/price-tag";
import { ProductRail } from "@/components/product-card";
import { RatingStars } from "@/components/rating-stars";
import { Reveal, Section, SectionHeading } from "@/components/section";
import { ProductTrustRow } from "@/components/trust-bar";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/context/store-context";
import type { Product } from "@/lib/catalog";
import {
  compareAtForSize,
  getProduct,
  listReviews,
  priceForSize,
  relatedProducts,
} from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }): { product: Product } => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Sculpture unavailable — Kyathi" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    const title = `${product.name} — Kyathi`;
    return {
      meta: [
        { title },
        { name: "description", content: product.shortDescription },
        { property: "og:title", content: title },
        { property: "og:description", content: product.shortDescription },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product: loadedProduct } = Route.useLoaderData() as { product: Product };
  const { products } = useCatalog();
  const product =
    products.find((p) => p.slug === loadedProduct.slug) ?? loadedProduct;
  const navigate = useNavigate();
  const { addToCart, setCartOpen, toggleWishlist, isWishlisted } = useStore();

  const [size, setSize] = useState(product.sizes[0]?.label ?? "");
  const [finish, setFinish] = useState(product.finishes[0] ?? "");
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const buyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSize(product.sizes[0]?.label ?? "");
    setFinish(product.finishes[0] ?? "");
    setQty(1);
    setActiveImage(0);
  }, [product.slug]);

  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!!entry && !entry.isIntersecting),
      { rootMargin: "-120px 0px 0px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [product]);

  // Keep floating UI (notice, WhatsApp, toasts) clear of the sticky buy bar.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--bottom-bar-h", showStickyBar ? "4.25rem" : "0px");
    return () => root.style.setProperty("--bottom-bar-h", "0px");
  }, [showStickyBar]);

  const price = priceForSize(product, size);
  const compareAt = compareAtForSize(product, size);
  const reviews = listReviews(product.slug);
  const related = useMemo(() => relatedProducts(product), [product]);
  const wishlisted = isWishlisted(product.slug);
  const image = product.images[activeImage] ?? product.images[0] ?? "";

  const add = (buyNow = false) => {
    addToCart({ productSlug: product.slug, size, finish, quantity: qty });
    if (buyNow) {
      navigate({ to: "/checkout" });
      return;
    }
    setCartOpen(true);
    toast.success("Added to cart", { description: `${product.name} · ${size} · ${finish}` });
  };

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 pb-4 pt-6 text-xs text-muted-foreground sm:px-6 lg:px-8">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <span className="px-1.5">/</span>
        <Link
          to="/collections/$slug"
          params={{ slug: product.collection }}
          className="hover:text-primary"
        >
          {product.collection.replace(/-/g, " ")}
        </Link>
        <span className="px-1.5">/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-14 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
        <div className="grid gap-3 lg:sticky lg:top-28 lg:self-start">
          <div className="group relative overflow-hidden rounded-sm bg-secondary">
            <img
              src={image}
              alt={product.name}
              className="aspect-4/5 w-full object-cover transition-transform duration-700 group-hover:scale-125"
            />
          </div>
          <div className="no-scrollbar flex gap-3 overflow-x-auto">
            {product.images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(i)}
                aria-label={`View image ${i + 1}`}
                className={cn(
                  "h-20 w-16 shrink-0 overflow-hidden rounded-xs border-2 transition-colors",
                  i === activeImage ? "border-accent" : "border-transparent opacity-70",
                )}
              >
                <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <p className="eyebrow">{product.material} · {product.figure}</p>
          <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">{product.name}</h1>
          <div className="mt-3">
            <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="md" />
          </div>
          <PriceTag price={price} compareAt={compareAt} size="lg" className="mt-5" />
          <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>

          {product.stock === 0 ? (
            <p className="mt-4 inline-block rounded-xs bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              Sold out — currently being recast
            </p>
          ) : product.stock <= 3 ? (
            <p className="mt-4 inline-block rounded-xs bg-terracotta px-2.5 py-1 text-xs font-semibold text-terracotta-foreground">
              Only {product.stock} left in this finish
            </p>
          ) : null}

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            {product.shortDescription}
          </p>

          <div className="mt-7">
            <p className="eyebrow mb-2.5">Height</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setSize(s.label)}
                  className={cn(
                    "rounded-xs border px-4 py-2 text-sm transition-colors",
                    size === s.label
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-accent",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="eyebrow mb-2.5">Finish</p>
            <div className="flex flex-wrap gap-2">
              {product.finishes.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFinish(f)}
                  className={cn(
                    "rounded-xs border px-4 py-2 text-sm transition-colors",
                    finish === f
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-accent",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div ref={buyRef} className="mt-7 grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)]">
            <div className="flex h-11 items-center justify-between rounded-xs border border-border sm:w-32">
              <button
                type="button"
                aria-label="Decrease quantity"
                className="grid h-11 w-10 place-items-center text-muted-foreground hover:text-foreground"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium">{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                className="grid h-11 w-10 place-items-center text-muted-foreground hover:text-foreground"
                onClick={() => setQty((q) => q + 1)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button size="lg" variant="outline" onClick={() => add(false)}>
              Add to cart
            </Button>
            <Button size="lg" onClick={() => add(true)}>
              Buy now
            </Button>
          </div>

          <button
            type="button"
            onClick={() => toggleWishlist(product.slug)}
            className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <Heart className={cn("h-4 w-4", wishlisted && "fill-primary text-primary")} />
            {wishlisted ? "Saved to wishlist" : "Add to wishlist"}
          </button>

          <div className="mt-3">
            <ShareButton
              title={product.name}
              text={product.shortDescription}
              path={`/products/${product.slug}`}
              label="Share this piece"
            />
          </div>

          {product.stock === 0 ? (
            <BackInStockForm
              productSlug={product.slug}
              productName={product.name}
              className="mt-6"
            />
          ) : null}

          <div className="mt-6">
            <ProductTrustRow />
          </div>

          <PincodeCheck className="mt-6" />

          <Tabs defaultValue="description" className="mt-9">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="shipping">Shipping &amp; Returns</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="pt-4 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </TabsContent>
            <TabsContent value="specs" className="pt-4">
              <dl className="grid gap-0 text-sm">
                <div className="grid grid-cols-2 gap-3 border-b border-border py-2.5">
                  <dt className="text-muted-foreground">Available heights</dt>
                  <dd>{product.sizes.map((s) => s.label).join(", ")}</dd>
                </div>
                <div className="grid grid-cols-2 gap-3 border-b border-border py-2.5">
                  <dt className="text-muted-foreground">Finishes</dt>
                  <dd>{product.finishes.join(", ")}</dd>
                </div>
                {product.specs.map((s) => (
                  <div key={s.label} className="grid grid-cols-2 gap-3 border-b border-border py-2.5">
                    <dt className="text-muted-foreground">{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
            </TabsContent>
            <TabsContent value="shipping" className="pt-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                Every sculpture is crated with foam moulding and shipped insured. Orders above
                ₹999 ship free across India; below that a flat ₹149 applies.
              </p>
              <p className="mt-3">
                Returns are accepted within 10 days of delivery for manufacturing defects or
                transit damage. Custom commissions and engraved corporate orders are not
                returnable.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Section muted>
        <SectionHeading eyebrow={`${product.reviewCount} reviews`} title="Customer Reviews" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <Reveal key={r.id} className="rounded-sm border border-border bg-card p-5">
              <RatingStars rating={r.rating} />
              <h3 className="mt-3 text-lg leading-snug">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
              {r.photo ? (
                <img
                  src={r.photo}
                  alt=""
                  loading="lazy"
                  className="mt-4 h-24 w-20 rounded-xs object-cover"
                />
              ) : null}
              <p className="mt-4 text-xs text-muted-foreground">
                {r.author} · {r.city} · {r.date}
              </p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Pairs well with" title="You May Also Like" />
        <ProductRail products={related} />
      </Section>

      <WhatsAppButton message={`Hi Kyathi, I'd like to know more about the ${product.name}.`} />

      <div
        className={cn(
          "bottom-stack-0 fixed inset-x-0 z-30 border-t border-border bg-background/97 backdrop-blur transition-transform duration-300",
          showStickyBar ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={product.images[0]}
              alt=""
              className="hidden h-11 w-9 shrink-0 rounded-xs object-cover sm:block"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{product.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {size} · {finish}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <PriceTag price={price} className="hidden sm:flex" />
            <Button onClick={() => add(false)}>Add to cart</Button>
          </div>
        </div>
      </div>
    </>
  );
}
