import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  copy,
  image,
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  copy?: string;
  image?: string;
  compact?: boolean;
}) {
  if (!image) {
    return (
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
          <h1 className="max-w-3xl text-4xl leading-tight sm:text-5xl">{title}</h1>
          <div className="gold-rule mt-5" />
          {copy ? (
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {copy}
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className={cn("relative w-full overflow-hidden bg-ink", compact ? "h-64" : "h-[52svh] min-h-80")}>
      <img
        src={image}
        alt=""
        aria-hidden="true"
        decoding="async"
        fetchPriority="high"
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/60 to-ink/25" />
      <div className="absolute inset-0">
        <div className="mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            {eyebrow ? <p className="eyebrow text-accent">{eyebrow}</p> : null}
            <h1 className="mt-3 font-serif text-4xl leading-tight text-cream sm:text-5xl">
              {title}
            </h1>
            {copy ? (
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-cream/80 sm:text-base">
                {copy}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
