import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { HeroCarousel } from "@/components/hero-carousel";
import { ProductGrid, ProductRail } from "@/components/product-card";
import { Reveal, Section, SectionHeading } from "@/components/section";
import { StoreLocator } from "@/components/store-locator";
import { TestimonialCarousel } from "@/components/testimonial-carousel";
import { TrustBar } from "@/components/trust-bar";
import { NewsletterForm } from "@/components/newsletter-form";
import { Button } from "@/components/ui/button";
import { listCollections, listProducts } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kyathi — Gold Coated Silver Idols & Photo Frame Idols" },
      {
        name: "description",
        content:
          "Hand-finished 999 silver idols coated in 24K gold, and gold-coated deity reliefs framed in teak and rosewood. Made in India, shipped nationwide.",
      },
      { property: "og:title", content: "Kyathi — Gold Coated Silver Idols & Photo Frame Idols" },
      {
        property: "og:description",
        content:
          "Hand-finished 999 silver idols coated in 24K gold, and gold-coated deity reliefs framed in teak and rosewood. Made in India, shipped nationwide.",
      },
      {
        property: "og:image",
        content:
          "https://kyathi.lovable.app/__l5e/assets-v1/2342f4aa-7756-4bd4-a603-961fbb4dfe84/kyathi-og.jpg",
      },
      {
        name: "twitter:image",
        content:
          "https://kyathi.lovable.app/__l5e/assets-v1/2342f4aa-7756-4bd4-a603-961fbb4dfe84/kyathi-og.jpg",
      },
    ],
  }),

  component: Home,
});

function Home() {
  useCatalog();
  const trending = listProducts({ tag: "trending" });
  const mostGifted = listProducts({ tag: "most-gifted" }).slice(0, 4);
  const newLaunches = listProducts({ tag: "new" }).slice(0, 4);
  const bestSellers = listProducts({ tag: "best-seller" }).slice(0, 4);
  const collections = listCollections().slice(0, 4);

  return (
    <>
      <HeroCarousel />

      <Section>
        <SectionHeading
          eyebrow="Moving fast this week"
          title="Trending Products"
          copy="What our customers are ordering right now, across idols and photo frames."
          action={
            <Button asChild variant="ghost" className="gap-2">
              <Link to="/collections/$slug" params={{ slug: "gold-coated-silver" }}>
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          }
        />
        <Reveal>
          <ProductRail products={trending} />
        </Reveal>
      </Section>

      <Section muted>
        <SectionHeading
          eyebrow="Given most often"
          title="Most Gifted"
          copy="Housewarmings, retirements, Diwali — the pieces that keep leaving our workshop in gift crates."
        />
        <Reveal>
          <ProductGrid products={mostGifted} />
        </Reveal>
      </Section>

      <TrustBar />

      <Section>
        <SectionHeading
          eyebrow="Fresh from the atelier"
          title="New Launches"
          action={
            <Button asChild variant="ghost" className="gap-2">
              <Link to="/collections/$slug" params={{ slug: "new-launches" }}>
                See all new <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          }
        />
        <Reveal>
          <ProductGrid products={newLaunches} />
        </Reveal>
      </Section>

      <Section muted>
        <SectionHeading eyebrow="Perennials" title="Best-Selling Favorites" />
        <Reveal>
          <ProductGrid products={bestSellers} />
        </Reveal>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Find your piece"
          title="Explore Our Collections"
          align="center"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          {collections.map((c, i) => (
            <Reveal key={c.slug} delay={i * 80}>
              <Link
                to="/collections/$slug"
                params={{ slug: c.slug }}
                className="group relative block overflow-hidden rounded-sm"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-96"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="eyebrow text-accent">{c.tagline}</p>
                  <h3 className="mt-2 font-serif text-3xl text-cream">{c.name}</h3>
                  <span className="mt-3 inline-flex items-center gap-2 text-sm text-cream/85">
                    Explore <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section muted>
        <SectionHeading eyebrow="In their words" title="What collectors say" />
        <TestimonialCarousel />
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Come see them in person"
          title="Visit a Kyathi store"
          copy="Weight, patina and scale are hard to judge on a screen. Our stores keep the full range on display."
        />
        <StoreLocator />
      </Section>

      <section className="border-t border-border bg-primary text-primary-foreground">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-8">
          <div className="min-w-0">
            <h2 className="font-serif text-3xl sm:text-4xl">Join Kyathi Insider</h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-primary-foreground/80">
              First access to limited castings, artisan stories from Swamimalai, and offers we
              don't run publicly.
            </p>
          </div>
          <div className="shrink-0">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
