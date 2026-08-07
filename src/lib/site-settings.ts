/**
 * Site-wide, admin-editable settings (branding, contact, banners, payment).
 *
 * Stored in the `site_settings` table so every visitor sees the same values,
 * with a localStorage mirror so the first paint doesn't flash the defaults.
 * Only admins can write (enforced by RLS).
 */
import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { heroSlides as seedHeroSlides, type HeroSlide } from "@/data/catalog-data";

export interface SiteSettings {
  brandName: string;
  logoUrl: string;
  tagline: string;
  announcement: { enabled: boolean; text: string };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    hours: string;
  };
  social: { instagram: string; facebook: string; youtube: string };
  payment: { upiId: string; payee: string; qrUrl: string };
  hero: HeroSlide[];
  footerNote: string;
  freeShippingNote: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  brandName: "Kyathi Heritage",
  logoUrl: "/kyathi-logo.png",
  tagline:
    "Gold-coated silver idols and framed deity reliefs, hand-finished at our Puttur studio — made for homes that keep things for generations.",
  announcement: {
    enabled: true,
    text: "Free shipping on orders above ₹999 · Certified authentic sculptures",
  },
  contact: {
    phone: "+919591517282",
    whatsapp: "919591517282",
    email: "care@kyathi.in",
    address: "Radhakrishna Building, Near Rotary Blood Bank, Puttur — 574201",
    hours: "Mon–Sun, 10:00 AM – 8:30 PM",
  },
  social: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
  },
  payment: { upiId: "ravinidwannaya@slc", payee: "Kyathi Sculptures", qrUrl: "" },
  hero: seedHeroSlides,
  footerNote: "© {year} Kyathi Sculptures Pvt. Ltd. All rights reserved.",
  freeShippingNote: "Free shipping on orders above ₹999",
};

const STORAGE_KEY = "kyathi-site-settings-v1";

let snapshot: SiteSettings = DEFAULT_SETTINGS;
let hydrated = false;
const listeners = new Set<() => void>();

const emit = () => {
  for (const l of listeners) l();
};

function merge(patch: unknown): SiteSettings {
  const p = (patch ?? {}) as Partial<SiteSettings>;
  return {
    ...DEFAULT_SETTINGS,
    ...p,
    announcement: { ...DEFAULT_SETTINGS.announcement, ...(p.announcement ?? {}) },
    contact: { ...DEFAULT_SETTINGS.contact, ...(p.contact ?? {}) },
    social: { ...DEFAULT_SETTINGS.social, ...(p.social ?? {}) },
    payment: { ...DEFAULT_SETTINGS.payment, ...(p.payment ?? {}) },
    hero: Array.isArray(p.hero) && p.hero.length > 0 ? p.hero : DEFAULT_SETTINGS.hero,
  };
}

function setSnapshot(next: SiteSettings) {
  snapshot = next;
  emit();
}

/** Called once on the client: read the local mirror, then refresh from the DB. */
export function hydrateSiteSettings() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) setSnapshot(merge(JSON.parse(raw)));
  } catch {
    /* ignore corrupt cache */
  }
  void refreshSiteSettings();
}

export async function refreshSiteSettings() {
  const { data, error } = await supabase
    .from("site_settings")
    .select("data")
    .eq("id", "default")
    .maybeSingle();
  if (error || !data) return;
  const next = merge(data.data);
  setSnapshot(next);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export async function saveSiteSettings(next: SiteSettings) {
  const { error } = await supabase
    .from("site_settings")
    .upsert({ id: "default", data: next as unknown as never });
  if (error) throw new Error(error.message);
  setSnapshot(next);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export async function resetSiteSettings() {
  await saveSiteSettings(DEFAULT_SETTINGS);
}

export function getSiteSettings(): SiteSettings {
  return snapshot;
}

export function useSiteSettings(): SiteSettings {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => snapshot,
    () => DEFAULT_SETTINGS,
  );
}

export type { HeroSlide };
