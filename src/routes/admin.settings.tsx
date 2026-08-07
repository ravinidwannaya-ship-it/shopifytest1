import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCatalog } from "@/lib/catalog-store";
import {
  DEFAULT_SETTINGS,
  refreshSiteSettings,
  saveSiteSettings,
  useSiteSettings,
  type HeroSlide,
  type SiteSettings,
} from "@/lib/site-settings";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-sm border border-border bg-card p-5 sm:p-6">
      <h2 className="font-serif text-xl">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-5 grid gap-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {textarea ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={placeholder} />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}

function AdminSettings() {
  const live = useSiteSettings();
  const { collections } = useCatalog();
  const [draft, setDraft] = useState<SiteSettings>(live);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void refreshSiteSettings();
  }, []);

  // Adopt server values until the admin starts editing.
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!dirty) setDraft(live);
  }, [live, dirty]);

  const update = (patch: Partial<SiteSettings>) => {
    setDirty(true);
    setDraft((d) => ({ ...d, ...patch }));
  };

  const updateHero = (index: number, patch: Partial<HeroSlide>) => {
    setDirty(true);
    setDraft((d) => ({
      ...d,
      hero: d.hero.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));
  };

  const moveHero = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= draft.hero.length) return;
    const next = [...draft.hero];
    const [item] = next.splice(index, 1);
    if (!item) return;
    next.splice(target, 0, item);
    update({ hero: next });
  };

  const save = async () => {
    setSaving(true);
    try {
      await saveSiteSettings(draft);
      setDirty(false);
      toast.success("Settings saved — live across the site");
    } catch (err) {
      toast.error("Couldn't save settings", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 pb-24">
      <Section title="Branding" description="Logo and name shown in the header, footer and menus.">
        <ImageUploadField
          label="Logo"
          value={draft.logoUrl}
          maxWidth={800}
          hint="PNG with a transparent background works best."
          onChange={(v) => update({ logoUrl: v })}
        />
        <Field label="Brand name (image alt text)" value={draft.brandName} onChange={(v) => update({ brandName: v })} />
        <Field label="Footer tagline" value={draft.tagline} onChange={(v) => update({ tagline: v })} textarea />
        <Field
          label="Copyright line"
          value={draft.footerNote}
          onChange={(v) => update({ footerNote: v })}
          placeholder="© {year} Kyathi…"
        />
      </Section>

      <Section title="Announcement bar" description="The strip above the header.">
        <div className="flex items-center gap-3">
          <Switch
            checked={draft.announcement.enabled}
            onCheckedChange={(checked) =>
              update({ announcement: { ...draft.announcement, enabled: checked } })
            }
            id="announcement-enabled"
          />
          <Label htmlFor="announcement-enabled">Show announcement bar</Label>
        </div>
        <Field
          label="Announcement text"
          value={draft.announcement.text}
          onChange={(v) => update({ announcement: { ...draft.announcement, text: v } })}
        />
      </Section>

      <Section title="Contact details" description="Used in the footer, contact page, call and WhatsApp buttons.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Phone (tel: link)"
            value={draft.contact.phone}
            onChange={(v) => update({ contact: { ...draft.contact, phone: v } })}
            placeholder="+919591517282"
          />
          <Field
            label="WhatsApp number (digits only)"
            value={draft.contact.whatsapp}
            onChange={(v) => update({ contact: { ...draft.contact, whatsapp: v } })}
            placeholder="919591517282"
          />
          <Field
            label="Email"
            value={draft.contact.email}
            onChange={(v) => update({ contact: { ...draft.contact, email: v } })}
          />
          <Field
            label="Opening hours"
            value={draft.contact.hours}
            onChange={(v) => update({ contact: { ...draft.contact, hours: v } })}
          />
        </div>
        <Field
          label="Studio address"
          value={draft.contact.address}
          onChange={(v) => update({ contact: { ...draft.contact, address: v } })}
          textarea
        />
      </Section>

      <Section title="Social links">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Instagram"
            value={draft.social.instagram}
            onChange={(v) => update({ social: { ...draft.social, instagram: v } })}
          />
          <Field
            label="Facebook"
            value={draft.social.facebook}
            onChange={(v) => update({ social: { ...draft.social, facebook: v } })}
          />
          <Field
            label="YouTube"
            value={draft.social.youtube}
            onChange={(v) => update({ social: { ...draft.social, youtube: v } })}
          />
        </div>
      </Section>

      <Section title="UPI payment" description="Shown at checkout when a customer pays by UPI.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="UPI ID"
            value={draft.payment.upiId}
            onChange={(v) => update({ payment: { ...draft.payment, upiId: v } })}
          />
          <Field
            label="Payee name"
            value={draft.payment.payee}
            onChange={(v) => update({ payment: { ...draft.payment, payee: v } })}
          />
        </div>
        <ImageUploadField
          label="UPI QR code"
          value={draft.payment.qrUrl}
          maxWidth={800}
          hint="Leave empty to keep the current QR image."
          onChange={(v) => update({ payment: { ...draft.payment, qrUrl: v } })}
        />
      </Section>

      <Section title="Homepage banners" description="Slides in the homepage carousel.">
        {draft.hero.map((slide, i) => (
          <div key={slide.id} className="rounded-sm border border-border p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Slide {i + 1}</p>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="icon" onClick={() => moveHero(i, -1)} aria-label="Move up">
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => moveHero(i, 1)} aria-label="Move down">
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Delete slide"
                  onClick={() => update({ hero: draft.hero.filter((_, x) => x !== i) })}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            <div className="mt-4 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Eyebrow" value={slide.eyebrow} onChange={(v) => updateHero(i, { eyebrow: v })} />
                <Field label="Button label" value={slide.ctaLabel} onChange={(v) => updateHero(i, { ctaLabel: v })} />
              </div>
              <Field label="Title" value={slide.title} onChange={(v) => updateHero(i, { title: v })} />
              <Field label="Copy" value={slide.copy} onChange={(v) => updateHero(i, { copy: v })} textarea />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label>Button links to collection</Label>
                  <select
                    className="h-9 rounded-xs border border-input bg-background px-3 text-sm"
                    value={slide.ctaSlug ?? ""}
                    onChange={(e) =>
                      updateHero(
                        i,
                        e.target.value
                          ? { ctaSlug: e.target.value as NonNullable<HeroSlide["ctaSlug"]> }
                          : ({ ctaSlug: undefined } as unknown as Partial<HeroSlide>),
                      )
                    }


                  >
                    <option value="">— page link instead —</option>
                    {collections.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Text alignment</Label>
                  <select
                    className="h-9 rounded-xs border border-input bg-background px-3 text-sm"
                    value={slide.align}
                    onChange={(e) => updateHero(i, { align: e.target.value as HeroSlide["align"] })}
                  >
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
              <ImageUploadField
                label="Banner image"
                value={slide.image}
                onChange={(v) => updateHero(i, { image: v })}
              />
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            update({
              hero: [
                ...draft.hero,
                {
                  id: `h${Date.now()}`,
                  eyebrow: "New collection",
                  title: "A new banner",
                  copy: "Describe the collection in a line or two.",
                  ctaLabel: "Shop now",
                  image: "",
                  align: "left",
                },
              ],
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add banner
        </Button>
      </Section>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border bg-card/95 p-4 backdrop-blur">
        <p className="text-sm text-muted-foreground">
          {dirty ? "You have unsaved changes." : "All changes saved."}
        </p>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              if (window.confirm("Restore all site settings to their defaults?")) {
                setDraft(DEFAULT_SETTINGS);
                setDirty(true);
              }
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Restore defaults
          </Button>
          <Button onClick={() => void save()} disabled={saving}>
            <Save className="mr-2 h-4 w-4" /> {saving ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
