import { createFileRoute, notFound } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useCatalog } from "@/lib/catalog-store";
import { emptyFilters, FilterSidebar, type FilterState } from "@/components/filter-sidebar";
import { PageHero } from "@/components/page-hero";
import { ProductGrid } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getCollection, listProducts, type SortKey } from "@/lib/catalog";

export const Route = createFileRoute("/collections/$slug")({
  loader: ({ params }) => {
    const collection = getCollection(params.slug);
    if (!collection) throw notFound();
    return { collection };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Collection unavailable — Kyathi" }, { name: "robots", content: "noindex" }],
      };
    }
    const { collection } = loaderData;
    const title = `${collection.name} — Kyathi Sculptures`;
    return {
      meta: [
        { title },
        { name: "description", content: collection.description },
        { property: "og:title", content: title },
        { property: "og:description", content: collection.description },
      ],
    };
  },
  component: CollectionPage,
});

const SORTS: { value: SortKey; label: string }[] = [
  { value: "best-selling", label: "Best-selling" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top rated" },
];

function CollectionPage() {
  const { collection: loadedCollection } = Route.useLoaderData();
  const catalog = useCatalog();
  const collection =
    catalog.collections.find((c) => c.slug === loadedCollection.slug) ?? loadedCollection;
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [sort, setSort] = useState<SortKey>("best-selling");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const id = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(id);
  }, [collection.slug, filters, sort, catalog]);

  const products = useMemo(
    () =>
      listProducts(
        {
          collection: collection.slug,
          figures: filters.figures,
          materials: filters.materials,
          finishes: filters.finishes,
          maxHeight: filters.maxHeight,
          priceMax: filters.priceMax,
        },
        sort,
      ),
    [collection.slug, filters, sort, catalog],
  );

  return (
    <>
      <PageHero
        eyebrow={collection.tagline}
        title={collection.name}
        copy={collection.description}
        image={collection.image}
        compact
      />

      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:px-8">
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <FilterSidebar value={filters} onChange={setFilters} />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border pb-4">
            <p className="truncate text-sm text-muted-foreground">
              {loading ? "Loading…" : `${products.length} sculptures`}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 lg:hidden">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto p-6">
                  <SheetTitle className="sr-only">Filters</SheetTitle>
                  <FilterSidebar value={filters} onChange={setFilters} />
                </SheetContent>
              </Sheet>

              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="w-44" aria-label="Sort products">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-8">
            <ProductGrid products={products} loading={loading} columns={3} skeletonCount={6} />
          </div>
        </div>
      </div>
    </>
  );
}
