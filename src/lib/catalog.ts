/**
 * The only way the UI reads catalog data.
 *
 * Every function here is synchronous over a local array today. To move to a
 * real database later, change the bodies of these functions (and make them
 * async) — no screen imports `catalog-data` directly.
 */
import { getCatalog } from "@/lib/catalog-store";
import {
  reviews,
  stores,
  testimonials,
  type Collection,
  type CollectionSlug,
  type Finish,
  type Material,
  type Product,
  type ProductTag,
  type Review,
} from "@/data/catalog-data";

export type { Collection, CollectionSlug, Finish, Material, Product, ProductTag, Review };

export type SortKey = "featured" | "best-selling" | "price-asc" | "price-desc" | "newest" | "rating";

export interface CatalogFilters {
  collection?: CollectionSlug | undefined;
  figures?: string[] | undefined;
  materials?: Material[] | undefined;
  finishes?: Finish[] | undefined;
  /** applied to the smallest available size */
  maxHeight?: number | undefined;
  priceMax?: number | undefined;
  tag?: ProductTag | undefined;
  query?: string | undefined;
}

export const MATERIALS: Material[] = ["Gold Coated Silver", "925 Silver", "Silver with Wood Frame"];
export const FINISHES: Finish[] = ["24K Gold Coated", "Dual Tone", "Antique Silver", "Mirror Polish"];

export const HEIGHT_BUCKETS = [
  { label: 'Up to 6"', max: 6 },
  { label: 'Up to 10"', max: 10 },
  { label: 'Up to 14"', max: 14 },
  { label: 'Above 14"', max: 1000 },
];

export const PRICE_MAX = 150000;

export function listCollections(): Collection[] {
  return getCatalog().collections;
}

export function getCollection(slug: string): Collection | undefined {
  return getCatalog().collections.find((c) => c.slug === slug);
}

export function listFigures(): string[] {
  return Array.from(new Set(getCatalog().products.map((p) => p.figure))).sort();
}

export function listProducts(
  filters: CatalogFilters = {},
  sort: SortKey = "featured",
): Product[] {
  const q = filters.query?.trim().toLowerCase();

  const result = getCatalog().products.filter((p) => {
    // "New Launches" is a curated view over every collection, not a home collection.
    if (filters.collection === "new-launches") {
      if (!p.tags.includes("new")) return false;
    } else if (filters.collection && p.collection !== filters.collection) return false;
    if (filters.tag && !p.tags.includes(filters.tag)) return false;
    if (filters.figures?.length && !filters.figures.includes(p.figure)) return false;
    if (filters.materials?.length && !filters.materials.includes(p.material)) return false;
    if (filters.finishes?.length && !p.finishes.some((f) => filters.finishes!.includes(f)))
      return false;
    if (filters.maxHeight && (p.sizes[0]?.heightInches ?? 0) > filters.maxHeight) return false;
    if (filters.priceMax && p.price > filters.priceMax) return false;
    if (q) {
      const haystack = `${p.name} ${p.figure} ${p.material} ${p.shortDescription}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return sortProducts(result, sort);
}

export function sortProducts(list: Product[], sort: SortKey): Product[] {
  const copy = [...list];
  switch (sort) {
    case "featured":
      return copy;
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "newest":
      return copy.sort(
        (a, b) => Number(b.tags.includes("new")) - Number(a.tags.includes("new")),
      );
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    case "best-selling":
      return copy.sort((a, b) => b.reviewCount - a.reviewCount);
    default:
      return copy;
  }
}

export function getProduct(slug: string): Product | undefined {
  return getCatalog().products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return getCatalog().products.find((p) => p.id === id);
}

export function searchProducts(query: string, limit = 6): Product[] {
  if (!query.trim()) return [];
  return listProducts({ query }).slice(0, limit);
}

export function relatedProducts(product: Product, limit = 6): Product[] {
  const { products } = getCatalog();
  const sameCollection = products.filter(
    (p) => p.slug !== product.slug && p.collection === product.collection,
  );
  const rest = products.filter(
    (p) => p.slug !== product.slug && p.collection !== product.collection,
  );
  return [...sameCollection, ...rest].slice(0, limit);
}

export function listReviews(productSlug: string): Review[] {
  const own = reviews.filter((r) => r.productSlug === productSlug);
  return own.length ? own : reviews.slice(0, 3);
}

export function listTestimonials() {
  return testimonials;
}

export function listStores() {
  return stores;
}

export function priceForSize(product: Product, sizeLabel: string): number {
  const size = product.sizes.find((s) => s.label === sizeLabel) ?? product.sizes[0];
  return product.price + (size?.priceDelta ?? 0);
}

export function compareAtForSize(product: Product, sizeLabel: string): number {
  const size = product.sizes.find((s) => s.label === sizeLabel) ?? product.sizes[0];
  return product.compareAtPrice + (size?.priceDelta ?? 0);
}

export function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function discountPercent(price: number, compareAt: number): number {
  if (compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}
