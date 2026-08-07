import { createFileRoute } from "@tanstack/react-router";
import { ImagePlus, Sparkles, X } from "lucide-react";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { sendEmail, STUDIO_EMAIL } from "@/lib/emailjs";
import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { STORE_WHATSAPP } from "@/lib/whatsapp";

export const Route = createFileRoute("/customize-idol")({
  head: () => ({
    meta: [
      { title: "Customise Your Idol Design — Kyathi" },
      {
        name: "description",
        content:
          "Design a bespoke idol with Kyathi: choose the deity, pose, material, finish, size, detailing, base, halo and engraving, then share reference images with our studio.",
      },
      { property: "og:title", content: "Customise Your Idol Design — Kyathi" },
      {
        property: "og:description",
        content: "A guided questionnaire that turns your vision into a handcrafted idol.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CustomiseIdolPage,
});

const DEITIES = [
  "Ganesha",
  "Krishna",
  "Shiva",
  "Durga",
  "Lakshmi",
  "Saraswati",
  "Murugan",
  "Hanuman",
  "Rama",
  "Vishnu",
  "Balaji",
  "Ayyappa",
  "Sai Baba",
  "Buddha",
  "Jain Tirthankara",
  "Other (Specify)",
];
const POSES = [
  "Standing",
  "Sitting",
  "Dancing",
  "Blessing Pose",
  "Meditation",
  "Family Form",
  "Child Form",
  "Warrior Form",
];
const REFERENCE_TYPES = ["Front View", "Side View", "Existing Idol", "Temple Idol", "Sketch"];
const INSPIRATIONS = [
  "Existing Temple Idol",
  "Traditional Sculpture",
  "Own Design",
  "AI Generated Concept",
  "Mix of Multiple References",
];
const MATERIALS = ["Brass", "Bronze", "Panchaloha", "Copper", "Silver", "Gold Plated", "Other"];
const FINISHES = ["Antique", "Matte", "Polished", "Gold Finish", "Natural Metal", "Black Patina"];
const HEIGHTS = ["4 inch", "6 inch", "8 inch", "10 inch", "12 inch", "18 inch", "24 inch", "Custom"];
const BUDGETS = ["Under ₹10,000", "₹10k–25k", "₹25k–50k", "₹50k–1L", "Above ₹1L"];
const PURPOSES = [
  "Home Temple",
  "Office",
  "Gift",
  "Wedding",
  "Housewarming",
  "Temple Installation",
  "Anniversary",
  "Other",
];
const DETAILING = ["Simple", "Medium", "Highly Detailed", "Museum Grade"];
const BASES = ["Lotus", "Plain", "Temple Style", "Customized", "No Base"];
const HALOS = ["None", "Traditional", "Decorative", "Temple Style"];
const ACCESSORIES = [
  "Crown",
  "Jewelry",
  "Weapons",
  "Garland",
  "Lotus",
  "Cow",
  "Peacock",
  "Mouse",
  "Lion",
  "Snake",
  "Other",
];
const ENGRAVING_TYPES = ["Name", "Date", "Mantra", "Blessing", "Logo"];
const PERSONALISATION = [
  "Smile like the temple idol",
  "Larger eyes",
  "Child-like appearance",
  "Traditional proportions",
  "South Indian style",
  "North Indian style",
  "Chola style",
];
const PACKAGING = ["Standard", "Premium Gift Box", "Wooden Box", "Temple Packaging"];
const APPROVALS = ["Concept Sketch", "3D Preview", "Clay Model", "Before Polishing", "Before Dispatch"];
const SHIPPING = ["Standard", "Express", "International"];
const TERMS = [
  "I understand that handcrafted idols may have slight variations.",
  "I confirm that I own or have permission to use the uploaded reference images.",
  "I understand that customized products cannot be returned unless damaged or defective.",
  "I agree to the quoted price and production timeline.",
];

type Multi = Record<string, boolean>;

function toList(state: Multi) {
  return Object.keys(state).filter((k) => state[k]);
}

function CustomiseIdolPage() {
  const [deity, setDeity] = useState("");
  const [deityOther, setDeityOther] = useState("");
  const [pose, setPose] = useState("");
  const [inspiration, setInspiration] = useState("");
  const [material, setMaterial] = useState("");
  const [finish, setFinish] = useState("");
  const [height, setHeight] = useState("");
  const [budget, setBudget] = useState("");
  const [purpose, setPurpose] = useState("");
  const [detailing, setDetailing] = useState("");
  const [base, setBase] = useState("");
  const [halo, setHalo] = useState("");
  const [packaging, setPackaging] = useState("Standard");
  const [shipping, setShipping] = useState("Standard");
  const [urgent, setUrgent] = useState("No");
  const [engraving, setEngraving] = useState("No");

  const [referenceTypes, setReferenceTypes] = useState<Multi>({});
  const [accessories, setAccessories] = useState<Multi>({});
  const [engravingTypes, setEngravingTypes] = useState<Multi>({});
  const [personalisation, setPersonalisation] = useState<Multi>({});
  const [approvals, setApprovals] = useState<Multi>({});
  const [terms, setTerms] = useState<Multi>({});

  const [files, setFiles] = useState<File[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const previews = useMemo(() => files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })), [files]);

  const allTermsAccepted = TERMS.every((t) => terms[t]);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files, ...Array.from(list)].slice(0, 10);
    if (files.length + list.length > 10) toast.info("Maximum 10 reference images");
    setFiles(next);
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const v = (n: string) => String(form.get(n) ?? "").trim();

    if (!deity || !material || !height) {
      toast.error("Please choose the deity, material and height");
      return;
    }
    if (!allTermsAccepted) {
      toast.error("Please accept all four terms to submit your request");
      return;
    }

    const chosenDeity = deity === "Other (Specify)" ? deityOther || "Other" : deity;

    const message = [
      "*Kyathi — Customised Idol Request* 🪔",
      "",
      `Name: ${v("fullName")}`,
      `Mobile: ${v("mobile")}`,
      `Email: ${v("email")}`,
      `Address: ${v("address")}, ${v("city")}, ${v("state")}, ${v("country")} — ${v("pincode")}`,
      "",
      `Deity: ${chosenDeity}`,
      `Pose / Form: ${pose || "—"}`,
      `Inspiration: ${inspiration || "—"}`,
      `Reference views: ${toList(referenceTypes).join(", ") || "—"}`,
      `Reference images attached: ${files.length}`,
      "",
      `Material: ${material}`,
      `Finish: ${finish || "—"}`,
      `Height: ${height}${v("customHeight") ? ` (${v("customHeight")})` : ""}`,
      `Width: ${v("width") || "—"} · Depth: ${v("depth") || "—"}`,
      `Detailing: ${detailing || "—"}`,
      `Base: ${base || "—"} · Halo: ${halo || "—"}`,
      `Accessories: ${toList(accessories).join(", ") || "—"}`,
      `Engraving: ${engraving}${engraving === "Yes" ? ` — ${toList(engravingTypes).join(", ")}: ${v("engravingText")}` : ""}`,
      `Personalisation: ${toList(personalisation).join(", ") || "—"}`,
      `Colour reference: ${v("colourReference") || "—"}`,
      "",
      `Budget: ${budget || "—"}`,
      `Purpose: ${purpose || "—"}`,
      `Needed by: ${v("neededBy") || "—"} · Urgent: ${urgent}`,
      `Packaging: ${packaging} · Shipping: ${shipping}`,
      `Updates wanted: ${toList(approvals).join(", ") || "—"}`,
      "",
      `Notes: ${v("notes") || "—"}`,
      "",
      "All terms accepted ✅",
    ].join("\n");

    const plain = message.replace(/\*/g, "");
    const customerEmail = v("email");
    if (customerEmail) {
      void sendEmail({
        to: customerEmail,
        toName: v("fullName"),
        subject: "Your customised idol request — Kyathi",
        message: `Namaste ${v("fullName")},\n\nWe've received your customisation brief. Our studio will send a quote within 24 hours.\n\n${plain}\n\n— Kyathi Heritage, Puttur`,
        replyTo: customerEmail,
      });
    }
    void sendEmail({
      to: STUDIO_EMAIL,
      toName: "Kyathi Studio",
      subject: `Customised idol request — ${v("fullName")}`,
      message: plain,
      replyTo: customerEmail || undefined,
    });

    window.open(
      `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
    toast.success("Request sent to our studio", {
      description: "We've opened WhatsApp with your brief — attach your reference images there and our team will quote within 24 hours.",
    });
  };

  return (
    <>
      <PageHero
        eyebrow="Bespoke commissions"
        title="Customise your idol design"
        copy="Answer the questionnaire below and our master sculptors will translate every detail — deity, pose, finish, detailing and engraving — into a one-of-a-kind piece."
      />

      <Section>
        <form onSubmit={submit} className="mx-auto grid w-full min-w-0 max-w-4xl grid-cols-[minmax(0,1fr)] gap-6">
          <Block n={1} title="Customer information">
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <Field id="fullName" label="Full name" required />
              <Field id="mobile" label="Mobile number" type="tel" required />
              <Field id="email" label="Email address" type="email" required className="sm:col-span-2" />
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="address">Delivery address</Label>
                <Textarea id="address" name="address" rows={2} required />
              </div>
              <Field id="city" label="City" required />
              <Field id="state" label="State" required />
              <Field id="country" label="Country" defaultValue="India" required />
              <Field id="pincode" label="PIN code" inputMode="numeric" required />
            </div>
          </Block>

          <Block n={2} title="Idol selection" hint="Which deity would you like?">
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <Picker label="Deity" value={deity} onChange={setDeity} options={DEITIES} />
              {deity === "Other (Specify)" ? (
                <div className="grid gap-2">
                  <Label htmlFor="deityOther">Specify deity</Label>
                  <Input
                    id="deityOther"
                    value={deityOther}
                    onChange={(e) => setDeityOther(e.target.value)}
                  />
                </div>
              ) : null}
            </div>
          </Block>

          <Block n={3} title="Pose / form">
            <Picker label="Pose" value={pose} onChange={setPose} options={POSES} />
          </Block>

          <Block n={4} title="Reference images" hint="Up to 10 images — front view, side view, temple idol, sketch.">
            <CheckGrid options={REFERENCE_TYPES} state={referenceTypes} setState={setReferenceTypes} />
            <div className="mt-5">
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
              <Button type="button" variant="outline" onClick={() => fileInput.current?.click()}>
                <ImagePlus className="mr-2 h-4 w-4" /> Upload reference images
              </Button>
              {previews.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-3">
                  {previews.map((p, i) => (
                    <li key={p.name + i} className="relative">
                      <img src={p.url} alt={p.name} className="h-20 w-20 rounded-sm object-cover" />
                      <button
                        type="button"
                        aria-label={`Remove ${p.name}`}
                        onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                        className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </Block>

          <Block n={5} title="Inspiration" hint="What should we follow?">
            <Picker label="Inspiration" value={inspiration} onChange={setInspiration} options={INSPIRATIONS} />
          </Block>

          <Block n={6} title="Material">
            <Picker label="Material" value={material} onChange={setMaterial} options={MATERIALS} />
          </Block>

          <Block n={7} title="Finish">
            <Picker label="Finish" value={finish} onChange={setFinish} options={FINISHES} />
          </Block>

          <Block n={8} title="Size">
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <Picker label="Height" value={height} onChange={setHeight} options={HEIGHTS} />
              {height === "Custom" ? (
                <Field id="customHeight" label="Custom height" />
              ) : null}
              <Field id="width" label="Width (optional)" />
              <Field id="depth" label="Depth (optional)" />
            </div>
          </Block>

          <Block n={9} title="Budget">
            <Picker label="Budget range" value={budget} onChange={setBudget} options={BUDGETS} />
          </Block>

          <Block n={10} title="Purpose">
            <Picker label="Purpose" value={purpose} onChange={setPurpose} options={PURPOSES} />
          </Block>

          <Block n={11} title="Level of detailing">
            <Picker label="Detailing" value={detailing} onChange={setDetailing} options={DETAILING} />
          </Block>

          <Block n={12} title="Base design">
            <Picker label="Base" value={base} onChange={setBase} options={BASES} />
          </Block>

          <Block n={13} title="Halo / Prabhavali">
            <Picker label="Halo" value={halo} onChange={setHalo} options={HALOS} />
          </Block>

          <Block n={14} title="Accessories" hint="Select all that apply.">
            <CheckGrid options={ACCESSORIES} state={accessories} setState={setAccessories} />
          </Block>

          <Block n={15} title="Engraving">
            <Choice value={engraving} onChange={setEngraving} options={["Yes", "No"]} name="engraving" />
            {engraving === "Yes" ? (
              <div className="mt-5 grid gap-4">
                <CheckGrid options={ENGRAVING_TYPES} state={engravingTypes} setState={setEngravingTypes} />
                <Field id="engravingText" label="Engraving text" />
              </div>
            ) : null}
          </Block>

          <Block n={16} title="Personalisation" hint="Special requests — select all that apply.">
            <CheckGrid options={PERSONALISATION} state={personalisation} setState={setPersonalisation} />
          </Block>

          <Block n={17} title="Colour reference" hint="If the piece is painted, describe or link your colour reference.">
            <Field id="colourReference" label="Colour reference" />
          </Block>

          <Block n={18} title="Delivery timeline">
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <Field id="neededBy" label="When do you need it?" type="date" />
              <div className="grid gap-2">
                <Label>Is it urgent?</Label>
                <Choice value={urgent} onChange={setUrgent} options={["Yes", "No"]} name="urgent" />
              </div>
            </div>
          </Block>

          <Block n={19} title="Packaging">
            <Picker label="Packaging" value={packaging} onChange={setPackaging} options={PACKAGING} />
          </Block>

          <Block n={20} title="Approval process" hint="Which updates would you like along the way?">
            <CheckGrid options={APPROVALS} state={approvals} setState={setApprovals} />
          </Block>

          <Block n={21} title="Shipping">
            <Picker label="Preferred shipping" value={shipping} onChange={setShipping} options={SHIPPING} />
          </Block>

          <Block n={22} title="Additional notes">
            <Textarea id="notes" name="notes" rows={4} placeholder="Anything else you'd like us to know?" />
          </Block>

          <Block n={23} title="Terms">
            <div className="grid gap-3">
              {TERMS.map((t) => (
                <label key={t} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
                  <Checkbox
                    checked={!!terms[t]}
                    onCheckedChange={(c) => setTerms((s) => ({ ...s, [t]: c === true }))}
                    className="mt-0.5"
                  />
                  <span className="text-muted-foreground">{t}</span>
                </label>
              ))}
            </div>
          </Block>

          <Button type="submit" size="lg" className="h-14 w-full text-base">
            <Sparkles className="mr-2 h-5 w-5" /> Submit customisation request
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Our studio replies with a sketch and quotation within 24 hours.
          </p>
        </form>
      </Section>
    </>
  );
}

function Block({
  n,
  title,
  hint,
  children,
}: {
  n: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-sm border border-border bg-card p-5 sm:p-7">
      <div className="mb-5 grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
          {n}
        </span>
        <div className="min-w-0">
          <h2 className="font-serif text-xl leading-tight">{title}</h2>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function Picker({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function CheckGrid({
  options,
  state,
  setState,
}: {
  options: string[];
  state: Multi;
  setState: React.Dispatch<React.SetStateAction<Multi>>;
}) {
  return (
    <div className="grid min-w-0 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((o) => (
        <label
          key={o}
          className="flex cursor-pointer items-center gap-2.5 rounded-sm border border-border px-3 py-2.5 text-sm transition-colors hover:border-accent has-[button[data-state=checked]]:border-accent has-[button[data-state=checked]]:bg-accent/5"
        >
          <Checkbox
            checked={!!state[o]}
            onCheckedChange={(c) => setState((s) => ({ ...s, [o]: c === true }))}
          />
          <span className="min-w-0">{o}</span>
        </label>
      ))}
    </div>
  );
}

function Choice({
  value,
  onChange,
  options,
  name,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  name: string;
}) {
  return (
    <RadioGroup value={value} onValueChange={onChange} className="flex flex-wrap gap-3">
      {options.map((o) => (
        <Label
          key={o}
          htmlFor={`${name}-${o}`}
          className="flex cursor-pointer items-center gap-2 rounded-sm border border-border px-4 py-2.5 text-sm transition-colors has-[button[data-state=checked]]:border-accent has-[button[data-state=checked]]:bg-accent/5"
        >
          <RadioGroupItem value={o} id={`${name}-${o}`} />
          {o}
        </Label>
      ))}
    </RadioGroup>
  );
}

function Field({
  id,
  label,
  type = "text",
  required = false,
  className,
  inputMode,
  defaultValue,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  className?: string;
  inputMode?: "numeric" | "text" | "tel";
  defaultValue?: string;
}) {
  return (
    <div className={`grid gap-2 ${className ?? ""}`}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        required={required}
        inputMode={inputMode}
        defaultValue={defaultValue}
      />
    </div>
  );
}
