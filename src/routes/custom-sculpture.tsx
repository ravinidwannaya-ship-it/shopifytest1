import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { sendWithStudioCopy } from "@/lib/emailjs";
import { PageHero } from "@/components/page-hero";
import { ProcessSteps } from "@/components/process-steps";
import { Section, SectionHeading } from "@/components/section";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { IMAGES } from "@/data/catalog-data";

export const Route = createFileRoute("/custom-sculpture")({
  head: () => ({
    meta: [
      { title: "Custom Sculpture Commissions — Kyathi" },
      {
        name: "description",
        content:
          "Commission a bespoke gold-coated silver idol or a framed deity relief — your deity, your size, your finish, approved before we plate.",
      },
      { property: "og:title", content: "Custom Sculpture Commissions — Kyathi" },
      {
        property: "og:description",
        content: "Share your brief and our master sculptors will craft a one-of-a-kind piece.",
      },
    ],
  }),
  component: CustomSculpturePage,
});

const STEPS = [
  {
    title: "Share your brief",
    copy: "Tell us the deity, the height or frame size, the finish and the occasion. Reference photos help our silversmiths get the form right.",
  },
  {
    title: "Wax approval",
    copy: "We sculpt the form in wax and share photographs from every angle for your approval before any silver is poured.",
  },
  {
    title: "Casting & gold coating",
    copy: "Lost-wax casting in 999 silver, weeks of hand chasing, then selective 24K gold coating and an anti-tarnish seal.",
  },
  {
    title: "White-glove delivery",
    copy: "Double-boxed, insured and delivered anywhere in India with your purity certificate and care card.",
  },
];

function CustomSculpturePage() {
  const [material, setMaterial] = useState("Gold Coated Silver");
  const [height, setHeight] = useState("2–4 ft");

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const v = (n: string) => String(form.get(n) ?? "").trim();
    const body = `Name: ${v("name")}\nPhone: ${v("phone")}\nEmail: ${v("email")}\nSubject / deity: ${v("subject")}\nMaterial: ${material}\nHeight: ${height}\nBudget: ${v("budget") || "—"}\n\n${v("brief")}`;
    void sendWithStudioCopy(
      {
        to: v("email"),
        toName: v("name"),
        subject: "Your Kyathi commission enquiry",
        message: `Namaste ${v("name")},\n\nThank you for your commission enquiry. A commissions lead will call you within one working day.\n\nYour brief:\n${body}\n\n— Kyathi Heritage, Puttur`,
        replyTo: v("email"),
      },
      `Custom sculpture enquiry — ${v("name")}`,
    );
    e.currentTarget.reset();
    toast.success("Enquiry received", {
      description: "A commissions lead will call you within one working day.",
    });
  };

  return (
    <>
      <PageHero
        eyebrow="Bespoke commissions"
        title="Sculpted to your brief"
        copy="From a four-inch silver Ganesha to a wall of engraved framed reliefs — our silversmiths have delivered over 400 commissions for homes, temples and institutions."
        image={IMAGES.heroIdols}
      />

      <Section>
        <SectionHeading
          eyebrow="How it works"
          title="Four steps, one heirloom"
          copy="Every commission is supervised by a master sculptor from first sketch to final patina."
        />
        <ProcessSteps steps={STEPS} />
      </Section>

      <Section muted>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <div className="min-w-0">
            <SectionHeading
              eyebrow="Start a commission"
              title="Tell us what you have in mind"
              copy="Share as much detail as you can. Budgets typically begin at ₹30,000 for a custom idol and ₹14,000 for a custom framed relief."
            />
            <dl className="grid gap-5 text-sm">
              <div>
                <dt className="font-semibold">Typical lead time</dt>
                <dd className="mt-1 text-muted-foreground">
                  4–6 weeks for idols, 2–3 weeks for framed reliefs.
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Materials we cast</dt>
                <dd className="mt-1 text-muted-foreground">
                  999 silver and 925 sterling silver, with 24K gold coating in full or dual tone.
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Approvals</dt>
                <dd className="mt-1 text-muted-foreground">
                  Clay maquette photos and a wax-stage review before final casting.
                </dd>
              </div>
            </dl>
          </div>

          <form
            onSubmit={submit}
            className="grid gap-4 rounded-sm border border-border bg-card p-6 sm:grid-cols-2 sm:p-8"
          >
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" required />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject / deity</Label>
              <Input id="subject" name="subject" placeholder="e.g. Nataraja" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="budget">Budget (₹)</Label>
              <Input id="budget" name="budget" inputMode="numeric" placeholder="e.g. 250000" />
            </div>
            <div className="grid gap-2">
              <Label>Material</Label>
              <Select value={material} onValueChange={setMaterial}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Gold Coated Silver", "925 Silver", "Silver with Wood Frame"].map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Approximate height</Label>
              <Select value={height} onValueChange={setHeight}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Under 12 in", "1–2 ft", "2–4 ft", "4–6 ft", "Life-size / above 6 ft"].map(
                    (h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="brief">Your brief</Label>
              <Textarea
                id="brief"
                name="brief"
                rows={5}
                placeholder="Posture, likeness, installation site, timeline, inscription details…"
                required
              />
            </div>
            <Button type="submit" size="lg" className="sm:col-span-2">
              Send enquiry
            </Button>
          </form>
        </div>
      </Section>

      <WhatsAppButton message="Hi Kyathi, I'd like to discuss a custom sculpture commission." />
    </>
  );
}
