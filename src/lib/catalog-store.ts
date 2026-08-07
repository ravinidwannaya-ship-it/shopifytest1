/**
 * Mutable, admin-editable catalog store.
 *
 * Seeded from `src/data/catalog-data.ts`. Any change made in /admin is layered
 * on top of the seed and persisted to localStorage, so the storefront and the
 * admin panel always read the same data. Swapping this for a real database
 * later means changing only this file and `src/lib/catalog.ts`.
 */
import { useSyncExternalStore } from "react";
import {
  collections as seedCollections,
  products as seedProducts,
  type Collection,
  type Product,
} from "@/data/catalog-data";

export interface CatalogSnapshot {
  products: Product[];
  collections: Collection[];
}

const STORAGE_KEY = "kyathi-catalog-v1";

const seed: CatalogSnapshot = {
  products: seedProducts,
  collections: seedCollections,
};

let snapshot: CatalogSnapshot = seed;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* storage unavailable */
  }
}

function commit(next: CatalogSnapshot) {
  snapshot = next;
  persist();
  emit();
}

/** Called once on the client, after hydration, so SSR and first paint match. */
export function hydrateCatalog() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<CatalogSnapshot>;
    if (!Array.isArray(parsed.products) || !Array.isArray(parsed.collections)) return;
    snapshot = { products: parsed.products, collections: parsed.collections };
    emit();
  } catch {
    /* corrupt storage — keep the seed */
  }
}

export function getCatalog(): CatalogSnapshot {
  return snapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Subscribe a component to catalog changes. Call this in any screen that
 * renders products or collections so admin edits show up immediately.
 */
export function useCatalog(): CatalogSnapshot {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => seed,
  );
}

/* ------------------------------------------------------------------ */
/* Mutations                                                           */
/* ------------------------------------------------------------------ */

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function nextProductId(): string {
  const nums = snapshot.products
    .map((p) => Number(p.id.replace(/\D/g, "")))
    .filter((n) => Number.isFinite(n));
  return `p${Math.max(0, ...nums) + 1}`;
}

export function saveProduct(product: Product) {
  const exists = snapshot.products.some((p) => p.id === product.id);
  commit({
    ...snapshot,
    products: exists
      ? snapshot.products.map((p) => (p.id === product.id ? product : p))
      : [...snapshot.products, product],
  });
}

export function deleteProduct(id: string) {
  commit({ ...snapshot, products: snapshot.products.filter((p) => p.id !== id) });
}

export function moveProduct(id: string, direction: -1 | 1) {
  commit({ ...snapshot, products: move(snapshot.products, (p) => p.id === id, direction) });
}

export function saveCollection(collection: Collection, originalSlug?: string) {
  const key = originalSlug ?? collection.slug;
  const exists = snapshot.collections.some((c) => c.slug === key);
  const collections = exists
    ? snapshot.collections.map((c) => (c.slug === key ? collection : c))
    : [...snapshot.collections, collection];
  // keep products pointing at a renamed collection
  const products =
    originalSlug && originalSlug !== collection.slug
      ? snapshot.products.map((p) =>
          p.collection === originalSlug ? { ...p, collection: collection.slug } : p,
        )
      : snapshot.products;
  commit({ products, collections });
}

export function deleteCollection(slug: string) {
  commit({
    products: snapshot.products.filter((p) => p.collection !== slug),
    collections: snapshot.collections.filter((c) => c.slug !== slug),
  });
}

export function moveCollection(slug: string, direction: -1 | 1) {
  commit({
    ...snapshot,
    collections: move(snapshot.collections, (c) => c.slug === slug, direction),
  });
}

export function resetCatalog() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
  snapshot = seed;
  emit();
}

function move<T>(list: T[], match: (item: T) => boolean, direction: -1 | 1): T[] {
  const index = list.findIndex(match);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(index, 1);
  if (!item) return list;
  copy.splice(target, 0, item);
  return copy;
}
