import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import { useSiteSettings } from "@/lib/site-settings";
import { sendWithStudioCopy } from "@/lib/emailjs";
import { PageHero } from "@/components/page-hero";
import { Section, SectionHeading } from "@/components/section";
import { StoreLocator } from "@/components/store-locator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Kyathi — Sculpture Studio" },
      {
        name: "description",
        content:
          "Call, WhatsApp or write to the Kyathi team for orders, commissions and studio visits.",
      },
      { property: "og:title", content: "Contact Kyathi — Sculpture Studio" },
      { property: "og:description", content: "We reply to every enquiry within one working day." },
    ],
  }),
  component: ContactPage,
});


function ContactPage() {
  const settings = useSiteSettings();
  const CHANNELS = [
    { icon: Phone, title: "Call us", value: settings.contact.phone, hint: settings.contact.hours },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      value: settings.contact.phone,
      hint: "Fastest for photos",
    },
    { icon: Mail, title: "Email", value: settings.contact.email, hint: "Replies within 24 hours" },
    {
      icon: MapPin,
      title: "Studio",
      value: settings.contact.address,
      hint: "Visits by appointment",
    },
  ];

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const v = (n: string) => String(form.get(n) ?? "").trim();
    const body = `Name: ${v("cname")}\nEmail: ${v("cemail")}\nOrder ID: ${v("corder") || "—"}\n\n${v("cmsg")}`;
    void sendWithStudioCopy(
      {
        to: v("cemail"),
        toName: v("cname"),
        subject: "We've received your message — Kyathi",
        message: `Namaste ${v("cname")},\n\nThank you for writing in. Our team replies within 24 hours.\n\nYour message:\n${body}\n\n— Kyathi Heritage, Puttur`,
        replyTo: v("cemail"),
      },
      `Contact form — ${v("cname")}`,
    );
    e.currentTarget.reset();
    toast.success("Message sent", { description: "We'll get back to you shortly." });
  };

  return (
    <>
      <PageHero
        eyebrow="We're listening"
        title="Get in touch"
        copy="Questions about a piece, a commission, or an order already on its way — reach us on any channel below."
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="min-w-0 grid gap-5">
            <Button asChild size="lg" className="h-14 w-full text-base">
              <a href={`tel:${settings.contact.phone}`}>
                <Phone className="mr-2 h-5 w-5" /> Call {settings.contact.phone}
              </a>
            </Button>
            {CHANNELS.map((c) => (

              <div
                key={c.title}
                className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 rounded-sm border border-border bg-card p-5"
              >
                <c.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {c.title}
                  </p>
                  <p className="mt-1 font-serif text-xl">{c.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{c.hint}</p>
                </div>
              </div>
            ))}
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-4 w-4 text-accent" /> Support hours: Monday to Saturday, 10am–7pm
              IST
            </p>
          </div>

          <form
            onSubmit={submit}
            className="grid gap-4 rounded-sm border border-border bg-card p-6 sm:p-8"
          >
            <div className="grid gap-2">
              <Label htmlFor="cname">Name</Label>
              <Input id="cname" name="cname" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cemail">Email</Label>
              <Input id="cemail" name="cemail" type="email" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="corder">Order ID (optional)</Label>
              <Input id="corder" name="corder" placeholder="KY123456" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cmsg">Message</Label>
              <Textarea id="cmsg" name="cmsg" rows={6} required />
            </div>
            <Button type="submit" size="lg">
              Send message
            </Button>
          </form>
        </div>
      </Section>

      <Section muted>
        <SectionHeading eyebrow="Experience studios" title="Come See Them in Person" />
        <StoreLocator />
      </Section>
    </>
  );
}
