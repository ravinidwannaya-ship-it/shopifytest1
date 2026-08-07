import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";

interface Policy {
  slug: string;
  title: string;
  eyebrow: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
}

const POLICIES: Policy[] = [
  {
    slug: "shipping",
    title: "Shipping Policy",
    eyebrow: "Last updated January 2026",
    intro:
      "Every Kyathi sculpture is packed by hand, crated where needed, and shipped fully insured.",
    sections: [
      {
        heading: "Dispatch timelines",
        body: [
          "In-stock pieces leave our facility within 2 working days of payment confirmation. Custom and engraved orders follow the lead time stated on your order confirmation, which is confirmed again by email once your order is accepted.",
        ],
      },
      {
        heading: "Charges",
        body: [
          "Shipping is free across India on orders above ₹999. A flat ₹149 applies to orders below that value. Sculptures above 4 feet or 60 kg ship on a freight quote which we share for approval before dispatch.",
        ],
      },
      {
        heading: "Tracking and delivery",
        body: [
          "A tracking link is emailed and sent over WhatsApp at dispatch. Deliveries are attempted twice; if both fail, the consignment returns to our hub and we contact you to rebook. Please inspect the crate before signing.",
        ],
      },
      {
        heading: "International orders",
        body: [
          "We ship to 18 countries. Duties, taxes and customs clearance charges at the destination are payable by the recipient and are not included in the order value.",
        ],
      },
    ],
  },
  {
    slug: "returns",
    title: "Returns & Refunds",
    eyebrow: "Last updated January 2026",
    intro:
      "We want the sculpture to feel right in your space. If it doesn't, here is exactly what happens.",
    sections: [
      {
        heading: "Return window",
        body: [
          "Standard catalogue pieces can be returned within 10 days of delivery, unused and in original packaging. Raise the request from your order confirmation email or by writing to care@kyathi.in.",
        ],
      },
      {
        heading: "Transit damage",
        body: [
          "Every shipment is insured. Send unboxing photographs within 48 hours of delivery and we will repair or replace the sculpture at no cost to you, including return pickup.",
        ],
      },
      {
        heading: "Non-returnable items",
        body: [
          "Custom commissions, engraved corporate orders and consecrated idols that have been used in puja cannot be returned, as they cannot be resold. Manufacturing defects remain covered regardless.",
        ],
      },
      {
        heading: "Refund processing",
        body: [
          "Approved refunds are issued to the original payment method within 7 working days of the returned piece passing inspection. Shipping charges already paid are refunded only when the return is due to a defect or our error.",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    eyebrow: "Last updated January 2026",
    intro:
      "This page explains what Kyathi collects when you browse or order, and how that information is used.",
    sections: [
      {
        heading: "What we collect",
        body: [
          "Details you give us directly — name, email, phone, billing and shipping address, GSTIN where provided, and the content of enquiries you submit. We also record order history so support can help you quickly.",
        ],
      },
      {
        heading: "How it is used",
        body: [
          "To process and deliver orders, respond to enquiries, prevent fraud, and — only if you opt in — send occasional emails about new collections. You can unsubscribe from any such email in one click.",
        ],
      },
      {
        heading: "Sharing",
        body: [
          "We share the minimum necessary with logistics partners, payment gateways and communication providers so your order can be fulfilled. We do not sell personal information to anyone.",
        ],
      },
      {
        heading: "Your choices",
        body: [
          "Write to care@kyathi.in to access, correct or delete the personal information we hold about you. We retain transaction records for the period required by Indian tax law.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms of Service",
    eyebrow: "Last updated January 2026",
    intro: "These terms govern your use of the Kyathi website and any order placed through it.",
    sections: [
      {
        heading: "Orders and pricing",
        body: [
          "All prices are in Indian Rupees and inclusive of applicable taxes unless stated otherwise. An order is confirmed only once payment is received and we send a confirmation email. We may decline or cancel an order with a full refund where a listing error or stock issue occurs.",
        ],
      },
      {
        heading: "Handmade variation",
        body: [
          "Each sculpture is cast and finished by hand. Minor variation in patina, weight and surface detail from the photographs is inherent to the craft and is not treated as a defect.",
        ],
      },
      {
        heading: "Intellectual property",
        body: [
          "Photographs, designs, sculpted forms and copy on this site belong to Kyathi and may not be reproduced commercially without written permission.",
        ],
      },
      {
        heading: "Liability and governing law",
        body: [
          "Our liability for any order is limited to the amount paid for it. These terms are governed by the laws of India, with the courts of Chennai holding exclusive jurisdiction.",
        ],
      },
    ],
  },
];

export const Route = createFileRoute("/policies/$slug")({
  loader: ({ params }): { policy: Policy } => {
    const policy = POLICIES.find((p) => p.slug === params.slug);
    if (!policy) throw notFound();
    return { policy };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Policy unavailable — Kyathi" }, { name: "robots", content: "noindex" }],
      };
    }
    const { policy } = loaderData;
    const title = `${policy.title} — Kyathi`;
    return {
      meta: [
        { title },
        { name: "description", content: policy.intro },
        { property: "og:title", content: title },
        { property: "og:description", content: policy.intro },
      ],
    };
  },
  component: PolicyPage,
});

function PolicyPage() {
  const { policy } = Route.useLoaderData() as { policy: Policy };

  return (
    <>
      <PageHero eyebrow={policy.eyebrow} title={policy.title} copy={policy.intro} />
      <Section>
        <div className="mx-auto grid w-full max-w-3xl gap-9">
          {policy.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-2xl">{s.heading}</h2>
              <div className="gold-rule mt-3" />
              {s.body.map((p, i) => (
                <p key={i} className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </Section>
    </>
  );
}
