import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ImagePicker } from "@/components/admin/image-picker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { Product, ProductTag, SizeVariant } from "@/data/catalog-data";
import { FINISHES, MATERIALS } from "@/lib/catalog";
import { nextProductId, saveProduct, slugify, useCatalog } from "@/lib/catalog-store";

const TAGS: ProductTag[] = ["trending", "most-gifted", "new", "best-seller"];

function blankProduct(collectionSlug: string, image: string): Product {
  return {
    id: "",
    slug: "",
    name: "",
    figure: "",
    collection: collectionSlug,
    material: MATERIALS[0] ?? "Gold Coated Silver",
    finishes: [FINISHES[0] ?? "24K Gold Coated"],
    sizes: [{ label: '6"', heightInches: 6, priceDelta: 0 }],
    price: 15000,
    compareAtPrice: 18000,
    images: [image],
    rating: 5,
    reviewCount: 0,
    stock: 10,
    tags: ["new"],
    shortDescription: "",
    description: "",
    specs: [],
  };
}

export function ProductForm({
  open,
  product,
  onOpenChange,
}: {
  open: boolean;
  product: Product | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { collections, products } = useCatalog();
  const [draft, setDraft] = useState<Product | null>(null);

  useEffect(() => {
    if (!open) {
      setDraft(null);
      return;
    }
    setDraft(
      product
        ? { ...product, sizes: product.sizes.map((s) => ({ ...s })), images: [...product.images] }
        : blankProduct(collections[0]?.slug ?? "", products[0]?.images[0] ?? ""),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product]);

  if (!draft) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl" />
      </Sheet>
    );
  }

  const set = <K extends keyof Product>(key: K, value: Product[K]) =>
    setDraft({ ...draft, [key]: value });

  const setSize = (index: number, patch: Partial<SizeVariant>) =>
    setDraft({
      ...draft,
      sizes: draft.sizes.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    });

  const submit = () => {
    const name = draft.name.trim();
    if (!name) {
      toast.error("Give the product a name");
      return;
    }
    if (!draft.collection) {
      toast.error("Pick a collection");
      return;
    }
    const slug = slugify(draft.slug || name);
    if (products.some((p) => p.slug === slug && p.id !== draft.id)) {
      toast.error("Another product already uses that URL slug");
      return;
    }
    const sizes = draft.sizes.filter((s) => s.label.trim());
    saveProduct({
      ...draft,
      id: draft.id || nextProductId(),
      name,
      slug,
      figure: draft.figure.trim() || name.split(" ")[0] || name,
      images: draft.images.filter(Boolean),
      sizes: sizes.length ? sizes : [{ label: '6"', heightInches: 6, priceDelta: 0 }],
      finishes: draft.finishes.length ? draft.finishes : [FINISHES[0] ?? "24K Gold Coated"],
    });
    toast.success(product ? "Product updated" : "Product created");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{product ? "Edit product" : "New product"}</SheetTitle>
          <SheetDescription>
            Everything here maps to the same catalog structure the storefront reads.
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-5 px-4 pb-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Text label="Name" value={draft.name} onChange={(v) => set("name", v)} />
            <Text
              label="URL slug"
              value={draft.slug}
              placeholder={slugify(draft.name)}
              onChange={(v) => set("slug", v)}
            />
            <Text
              label="Deity / figure"
              value={draft.figure}
              onChange={(v) => set("figure", v)}
            />
            <div className="grid gap-2">
              <Label>Collection</Label>
              <Select value={draft.collection} onValueChange={(v) => set("collection", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a collection" />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Material</Label>
              <Select value={draft.material} onValueChange={(v) => set("material", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MATERIALS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <NumberField
              label="Stock"
              value={draft.stock}
              onChange={(v) => set("stock", v)}
            />
            <NumberField label="Base price (₹)" value={draft.price} onChange={(v) => set("price", v)} />
            <NumberField
              label="Compare-at price (₹)"
              value={draft.compareAtPrice}
              onChange={(v) => set("compareAtPrice", v)}
            />
            <NumberField
              label="Rating"
              value={draft.rating}
              step={0.1}
              onChange={(v) => set("rating", v)}
            />
            <NumberField
              label="Review count"
              value={draft.reviewCount}
              onChange={(v) => set("reviewCount", v)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Finishes</Label>
            <div className="flex flex-wrap gap-4">
              {FINISHES.map((f) => (
                <label key={f} className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={draft.finishes.includes(f)}
                    onCheckedChange={(checked) =>
                      set(
                        "finishes",
                        checked
                          ? [...draft.finishes, f]
                          : draft.finishes.filter((x) => x !== f),
                      )
                    }
                  />
                  {f}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Badges</Label>
            <div className="flex flex-wrap gap-4">
              {TAGS.map((t) => (
                <label key={t} className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={draft.tags.includes(t)}
                    onCheckedChange={(checked) =>
                      set("tags", checked ? [...draft.tags, t] : draft.tags.filter((x) => x !== t))
                    }
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Sizes</Label>
            <div className="grid gap-2">
              {draft.sizes.map((size, i) => (
                <div key={i} className="grid grid-cols-[minmax(0,1fr)_6rem_8rem_auto] gap-2">
                  <Input
                    value={size.label}
                    placeholder='Label e.g. 6"'
                    aria-label="Size label"
                    onChange={(e) => setSize(i, { label: e.target.value })}
                  />
                  <Input
                    type="number"
                    value={size.heightInches}
                    aria-label="Height in inches"
                    onChange={(e) => setSize(i, { heightInches: Number(e.target.value) })}
                  />
                  <Input
                    type="number"
                    value={size.priceDelta}
                    aria-label="Price difference"
                    onChange={(e) => setSize(i, { priceDelta: Number(e.target.value) })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove size"
                    onClick={() =>
                      set(
                        "sizes",
                        draft.sizes.filter((_, index) => index !== i),
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Columns: label, height in inches, price added to the base price.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="justify-self-start"
                onClick={() =>
                  set("sizes", [...draft.sizes, { label: "", heightInches: 6, priceDelta: 0 }])
                }
              >
                <Plus className="mr-2 h-4 w-4" /> Add size
              </Button>
            </div>
          </div>

          <ImagePicker
            label="Primary image"
            value={draft.images[0] ?? ""}
            onChange={(v) => set("images", [v, ...draft.images.slice(1)])}
          />
          <ImagePicker
            label="Hover image"
            value={draft.images[1] ?? ""}
            onChange={(v) => set("images", [draft.images[0] ?? v, v])}
          />

          <div className="grid gap-2">
            <Label htmlFor="short-description">Card description</Label>
            <Textarea
              id="short-description"
              rows={2}
              value={draft.shortDescription}
              onChange={(e) => set("shortDescription", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Full description</Label>
            <Textarea
              id="description"
              rows={5}
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
        </div>

        <SheetFooter>
          <Button onClick={submit}>Save product</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Text({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const id = `p-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}) {
  const id = `p-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
