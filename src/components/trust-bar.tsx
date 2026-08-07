import { BadgeCheck, RotateCcw, ShieldCheck, Truck, Users } from "lucide-react";
import { Reveal } from "@/components/section";

const items = [
  { icon: RotateCcw, title: "10-Day Easy Returns", copy: "No questions on damage or mismatch" },
  { icon: Users, title: "Trusted by 2 Lakh+ Customers", copy: "Across 480+ Indian cities" },
  { icon: BadgeCheck, title: "Certified Authentic", copy: "Each piece ships with a certificate" },
  { icon: Truck, title: "Insured Delivery", copy: "Crated, foam-moulded, fully insured" },
];

export function TrustBar() {
  return (
    <section className="border-y border-border bg-secondary/60">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-6 px-4 py-9 sm:px-6 lg:grid-cols-4 lg:px-8">
        {items.map((item, i) => (
          <Reveal key={item.title} delay={i * 70} className="flex min-w-0 items-start gap-3">
            <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-snug">{item.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.copy}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const productTrust = [
  { icon: ShieldCheck, label: "Secure Payment" },
  { icon: RotateCcw, label: "10-Day Returns" },
  { icon: BadgeCheck, label: "Certified Authentic" },
  { icon: Truck, label: "Free Shipping ₹999+" },
];

export function ProductTrustRow() {
  return (
    <ul className="grid grid-cols-2 gap-3 rounded-sm border border-border bg-secondary/40 p-4 sm:grid-cols-4">
      {productTrust.map((t) => (
        <li key={t.label} className="flex min-w-0 flex-col items-center gap-1.5 text-center">
          <t.icon className="h-5 w-5 text-accent" />
          <span className="text-[11px] font-medium leading-tight">{t.label}</span>
        </li>
      ))}
    </ul>
  );
}
