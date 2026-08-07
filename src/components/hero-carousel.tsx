import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/lib/site-settings";
import { cn } from "@/lib/utils";

export function HeroCarousel() {
  const heroSlides = useSiteSettings().hero;
  const [index, setIndex] = useState(0);
  const count = heroSlides.length;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), 6500);
    return () => window.clearInterval(id);
  }, [count]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="relative h-[70svh] min-h-[480px] w-full overflow-hidden bg-ink"
    >
      {heroSlides.map((slide, i) => (
        <div
          key={slide.id}
          aria-hidden={i !== index}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            i === index ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <img
            src={slide.image}
            alt=""
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "low"}
            decoding="async"
            className="h-full w-full object-cover"
          />
          <div
            className={cn(
              "absolute inset-0",
              slide.align === "left"
                ? "bg-gradient-to-r from-ink/85 via-ink/55 to-transparent"
                : "bg-gradient-to-l from-ink/85 via-ink/55 to-transparent",
            )}
          />
          <div className="absolute inset-0">
            <div className="mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
              <div
                className={cn(
                  "max-w-xl",
                  slide.align === "right" && "ml-auto text-right",
                )}
              >
                <p className="eyebrow text-accent">{slide.eyebrow}</p>
                <h1 className="mt-4 font-serif text-4xl leading-[1.08] text-cream sm:text-5xl lg:text-6xl">
                  {slide.title}
                </h1>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/80 sm:text-base">
                  {slide.copy}
                </p>
                <div className={cn("mt-8 flex", slide.align === "right" && "justify-end")}>
                  <Button asChild size="lg" variant="secondary">
                    {slide.ctaSlug ? (
                      <Link to="/collections/$slug" params={{ slug: slide.ctaSlug }}>
                        {slide.ctaLabel}
                      </Link>
                    ) : (
                      <Link to={slide.ctaTo ?? "/corporate-gifting"}>{slide.ctaLabel}</Link>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute inset-x-0 bottom-6 z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1">
            {heroSlides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => go(i)}
                className="grid h-11 w-11 place-items-center"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "block h-0.5 w-8 transition-colors",
                    i === index ? "bg-accent" : "bg-cream/35",
                  )}
                />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => go(index - 1)}
              className="grid h-11 w-11 place-items-center rounded-full border border-cream/30 text-cream transition-colors hover:bg-cream/10"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => go(index + 1)}
              className="grid h-11 w-11 place-items-center rounded-full border border-cream/30 text-cream transition-colors hover:bg-cream/10"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
