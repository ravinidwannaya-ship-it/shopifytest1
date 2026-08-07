import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/page-hero";
import { ProcessSteps } from "@/components/process-steps";
import { Reveal, Section, SectionHeading } from "@/components/section";
import { StoreLocator } from "@/components/store-locator";
import { TrustBar } from "@/components/trust-bar";
import { IMAGES } from "@/data/catalog-data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Kyathi Sculptures" },
      {
        name: "description",
        content:
          "Kyathi works with fourth-generation silversmiths at our Puttur studio to cast, chase and gold-coat every idol and framed relief by hand.",
      },
      { property: "og:title", content: "Our Story — Kyathi Sculptures" },
      {
        property: "og:description",
        content: "A heritage silversmithing practice, brought to modern homes and institutions.",
      },
    ],
  }),
  component: AboutPage,
});

const CRAFT = [
  {
    title: "Wax study",
    copy: "The silversmith sculpts the deity in beeswax, following Shilpa Shastra proportion tables.",
  },
  {
    title: "Silver casting",
    copy: "999 silver is poured into the investment mould at 1000°C — one mould, one idol, never reused.",
  },
  {
    title: "Hand chasing",
    copy: "Every crown, garland and fold of drape is cut in by hand with chisels before the piece is polished.",
  },
  {
    title: "24K gold coating",
    copy: "Selective 24K gold electroplating, then an anti-tarnish seal and a final purity inspection.",
  },
];

const NUMBERS = [
  { value: "1954", label: "Atelier established" },
  { value: "40+", label: "Master artisans" },
  { value: "12,000+", label: "Idols & frames delivered" },
  { value: "18", label: "Countries shipped to" },
];

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Since 1954"
        title="Three generations at the furnace"
        copy="Kyathi began as a family silversmithy casting temple idols. Today the same hands make gold-coated silver idols and framed deity reliefs for homes and boardrooms across the world."
        image={IMAGES.heroIdols}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="min-w-0">
            <SectionHeading eyebrow="Our story" title="Heritage, not nostalgia" />
            <div className="grid gap-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                Our grandfather cast his first silver Ganesha for a village temple in 1954, using
                the lost-wax method described in the Shilpa Shastras. Nothing about that process has
                been shortened since — no machine casting, no thin flash plating, no imported dies.
              </p>
              <p>
                What has changed is who they are for. A gold-coated silver Ganesha now sits on a
                startup founder's desk in Bengaluru. A framed Lakshmi hangs above a shop counter in
                Surat. Forty engraved frames went out as long-service awards in Gurugram.
              </p>
              <p>
                Kyathi exists to keep that continuity honest: heritage technique, contemporary
                sensibility, and a price you can see the reasoning behind.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120} className="overflow-hidden rounded-sm bg-secondary">
            <img
              src={IMAGES.gcsDurga}
              alt="A gold-coated silver Durga idol being finished by hand"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </Reveal>
        </div>
      </Section>

      <Section muted>
        <SectionHeading
          eyebrow="Craftsmanship"
          title="How a sculpture is born"
          copy="Every piece passes through four stages and at least six pairs of hands."
        />
        <ProcessSteps steps={CRAFT} />
      </Section>

      <Section>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {NUMBERS.map((n, i) => (
            <Reveal key={n.label} delay={i * 80} className="text-center">
              <p className="font-serif text-5xl text-accent">{n.value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {n.label}
              </p>
            </Reveal>
          ))}
        </div>
      </Section>

      <TrustBar />

      <Section muted>
        <SectionHeading
          eyebrow="Visit us"
          title="Our Experience Studios"
          copy="See the weight, patina and finish in person before you commit."
        />
        <StoreLocator />
      </Section>
    </>
  );
}
