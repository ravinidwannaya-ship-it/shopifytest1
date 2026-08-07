import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Kyathi Sculptures" },
      {
        name: "description",
        content:
          "Answers on materials, sizing, shipping, damage protection, custom commissions and corporate orders.",
      },
      { property: "og:title", content: "FAQ — Kyathi Sculptures" },
      { property: "og:description", content: "Everything buyers ask before ordering a sculpture." },
    ],
  }),
  component: FaqPage,
});

const GROUPS: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: "Products & finishes",
    items: [
      {
        q: "What exactly is a gold coated silver idol?",
        a: "The idol is cast in 999 fine silver (or 925 sterling, stated on each product page), hand-chased, then electroplated with 24K gold and sealed with an anti-tarnish coat. Dual tone means only the crown, jewellery and drape borders are gold-coated, leaving the body in silver.",
      },
      {
        q: "How do I choose the right height?",
        a: "For a pooja shelf, a 4–6 inch idol or an 8×10 inch frame sits well. For a console or a mandir cabinet, 8–12 inch idols and 11×14 inch frames read best. Send us a photo of the space and our team will advise.",
      },
      {
        q: "Will the gold coating wear off?",
        a: "Not with normal shelf use. The 24K coating is sealed, so a dry microfibre wipe is all it needs. Never use metal polish, tamarind, ash or acidic cleaners — those strip the plating.",
      },
    ],
  },
  {
    title: "Orders & shipping",
    items: [
      {
        q: "How long will my order take?",
        a: "In-stock pieces dispatch within 2 working days and reach most Indian pincodes in 4–8 days. Custom and engraved orders carry the lead time confirmed on your enquiry.",
      },
      {
        q: "What does shipping cost?",
        a: "Free across India on orders above ₹999; a flat ₹149 applies below that. Every piece ships insured and double-boxed. International shipping is quoted per destination.",
      },
      {
        q: "What if the sculpture arrives damaged?",
        a: "Every consignment is insured. Send us unboxing photos within 48 hours of delivery and we replace or repair the piece at no cost to you.",
      },
    ],
  },
  {
    title: "Custom & corporate",
    items: [
      {
        q: "Can you sculpt a likeness from photographs?",
        a: "Yes. Send three to five clear reference images of the deity form you want. You approve wax photographs before we cast in silver.",
      },
      {
        q: "Do you take bulk corporate orders?",
        a: "We do, from 25 units, with engraving, gift boxing and GST invoicing. Start on the corporate gifting page and our desk will send tiered pricing.",
      },
      {
        q: "Are custom pieces returnable?",
        a: "Commissions and engraved corporate orders are non-returnable, since they cannot be resold. Manufacturing defects are always covered.",
      },
    ],
  },
];

function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="Support"
        title="Frequently asked questions"
        copy="Can't find your answer? Write to care@kyathi.in and a human will reply within a day."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
          <nav className="h-fit lg:sticky lg:top-28">
            <p className="eyebrow mb-3">Topics</p>
            <ul className="grid gap-2 text-sm">
              {GROUPS.map((g) => (
                <li key={g.title}>
                  <a href={`#${slug(g.title)}`} className="text-muted-foreground hover:text-primary">
                    {g.title}
                  </a>
                </li>
              ))}
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary">
                  Still stuck? Contact us
                </Link>
              </li>
            </ul>
          </nav>

          <div className="min-w-0 grid gap-10">
            {GROUPS.map((g) => (
              <section key={g.title} id={slug(g.title)} className="scroll-mt-28">
                <h2 className="text-2xl">{g.title}</h2>
                <div className="gold-rule mt-3" />
                <Accordion type="single" collapsible className="mt-4">
                  {g.items.map((item) => (
                    <AccordionItem key={item.q} value={item.q}>
                      <AccordionTrigger className="text-left text-base">{item.q}</AccordionTrigger>
                      <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z]+/g, "-");
}
