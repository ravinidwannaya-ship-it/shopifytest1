import { createFileRoute } from "@tanstack/react-router";
import { Award, Boxes, Building2, PenTool, Timer, Truck } from "lucide-react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import { sendWithStudioCopy } from "@/lib/emailjs";
import { PageHero } from "@/components/page-hero";
import { ProductRail } from "@/components/product-card";
import { Reveal, Section, SectionHeading } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IMAGES } from "@/data/catalog-data";
import { listProducts } from "@/lib/catalog";

export const Route = createFileRoute("/corporate-gifting")({
  head: () => ({
    meta: [
      { title: "Corporate Gifting — Kyathi" },
      {
        name: "description",
        content:
          "Bulk sculpture gifting for milestones, felicitations and delegations — custom engraving, GST invoicing and pan-India delivery.",
      },
      { property: "og:title", content: "Corporate Gifting — Kyathi" },
      {
        property: "og:description",
        content: "Engraved gold-coated silver idols and framed reliefs for teams, clients and dignitaries.",
      },
    ],
  }),
  component: CorporateGiftingPage,
});

const BENEFITS = [
  { icon: PenTool, title: "Custom engraving", copy: "Logos, citations and names engraved or cast into the base." },
  { icon: Boxes, title: "Volume pricing", copy: "Tiered rates from 25 units, with sample dispatch before you commit." },
  { icon: Building2, title: "GST invoicing", copy: "Compliant B2B billing, PO handling and vendor onboarding support." },
  { icon: Timer, title: "Deadline delivery", copy: "Event-locked timelines with weekly production updates." },
  { icon: Truck, title: "Split shipping", copy: "Ship to multiple addresses from one order, individually gift-boxed." },
  { icon: Award, title: "Presentation ready", copy: "Velvet-lined boxes, certificate of authenticity and gift notes." },
];

function CorporateGiftingPage() {
  const gifting = listProducts({ tag: "most-gifted" }).slice(0, 8);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const v = (n: string) => String(form.get(n) ?? "").trim();
    const body = `Company: ${v("company")}\nContact: ${v("cname")}\nEmail: ${v("cemail")}\nPhone: ${v("cphone")}\nQuantity: ${v("qty")}\nDeadline: ${v("deadline") || "—"}\n\n${v("details")}`;
    void sendWithStudioCopy(
      {
        to: v("cemail"),
        toName: v("cname"),
        subject: "Your Kyathi corporate gifting enquiry",
        message: `Namaste ${v("cname")},\n\nThank you for your corporate gifting enquiry. Our desk will send a quote within one working day.\n\nYour brief:\n${body}\n\n— Kyathi Heritage, Puttur`,
        replyTo: v("cemail"),
      },
      `Corporate gifting enquiry — ${v("company")}`,
    );
    e.currentTarget.reset();
    toast.success("Enquiry received", {
      description: "Our corporate desk will send a quote within one working day.",
    });
  };

  return (
    <>
      <PageHero
        eyebrow="For teams & institutions"
        title="Gifts that carry weight"
        copy="Engraved silver frames and desk idols for boardrooms, conferences, Deepavali hampers and long-service awards."
        image={IMAGES.heroFrames}
      />

      <Section>
        <SectionHeading
          eyebrow="Why brands choose Kyathi"
          title="Built for bulk, finished by hand"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <Reveal
              key={b.title}
              delay={i * 70}
              className="rounded-sm border border-border bg-card p-6"
            >
              <b.icon className="h-6 w-6 text-accent" />
              <h3 className="mt-4 text-xl">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.copy}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {gifting.length > 0 ? (
        <Section muted>
          <SectionHeading eyebrow="Popular in bulk" title="Most Gifted Pieces" />
          <ProductRail products={gifting} />
        </Section>
      ) : null}

      <Section>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <div className="min-w-0">
            <SectionHeading
              eyebrow="Request a quote"
              title="Tell us about your requirement"
              copy="Minimum order 25 units. Samples dispatched within 5 working days of a confirmed brief."
            />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Trusted by manufacturing groups, banks, temple trusts and state institutions for
              felicitation and Diwali gifting programmes.
            </p>
          </div>

          <form
            onSubmit={submit}
            className="grid gap-4 rounded-sm border border-border bg-card p-6 sm:grid-cols-2 sm:p-8"
          >
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cname">Contact person</Label>
              <Input id="cname" name="cname" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cemail">Work email</Label>
              <Input id="cemail" name="cemail" type="email" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cphone">Phone</Label>
              <Input id="cphone" name="cphone" type="tel" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="qty">Quantity</Label>
              <Input id="qty" name="qty" inputMode="numeric" placeholder="e.g. 150" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deadline">Required by</Label>
              <Input id="deadline" name="deadline" type="date" />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="details">Requirement details</Label>
              <Textarea
                id="details"
                name="details"
                rows={5}
                placeholder="Occasion, budget per unit, engraving text, packaging preference…"
                required
              />
            </div>
            <Button type="submit" size="lg" className="sm:col-span-2">
              Request quote
            </Button>
          </form>
        </div>
      </Section>
    </>
  );
}
