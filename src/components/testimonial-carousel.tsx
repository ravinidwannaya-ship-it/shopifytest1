import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { useState } from "react";
import { RatingStars } from "@/components/rating-stars";
import { listTestimonials } from "@/lib/catalog";

export function TestimonialCarousel() {
  const items = listTestimonials();
  const [index, setIndex] = useState(0);
  const active = items[index] ?? items[0];
  if (!active) return null;

  const move = (delta: number) =>
    setIndex((i) => (i + delta + items.length) % items.length);

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] md:items-center">
      <div className="overflow-hidden rounded-sm bg-secondary">
        <img
          src={active.photo}
          alt={active.product}
          loading="lazy"
          className="aspect-4/5 w-full object-cover"
        />
      </div>
      <div className="min-w-0">
        <Quote className="h-8 w-8 text-accent" />
        <blockquote className="mt-5 font-serif text-2xl leading-snug sm:text-3xl">
          “{active.quote}”
        </blockquote>
        <div className="mt-6">
          <RatingStars rating={active.rating} size="md" />
          <p className="mt-3 text-sm font-semibold">
            {active.name} · <span className="font-normal text-muted-foreground">{active.city}</span>
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {active.product}
          </p>
        </div>
        <div className="mt-8 flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous testimonial"
            onClick={() => move(-1)}
            className="grid h-10 w-10 place-items-center rounded-full border border-border transition-colors hover:border-accent hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next testimonial"
            onClick={() => move(1)}
            className="grid h-10 w-10 place-items-center rounded-full border border-border transition-colors hover:border-accent hover:text-accent"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
          <span className="ml-2 text-xs text-muted-foreground">
            {index + 1} / {items.length}
          </span>
        </div>
      </div>
    </div>
  );
}
