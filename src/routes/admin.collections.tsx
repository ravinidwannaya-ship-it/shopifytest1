import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ImagePicker } from "@/components/admin/image-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { Collection } from "@/lib/catalog";
import {
  deleteCollection,
  moveCollection,
  saveCollection,
  slugify,
  useCatalog,
} from "@/lib/catalog-store";

export const Route = createFileRoute("/admin/collections")({
  component: AdminCollections,
});

const BLANK: Collection = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  image: "",
};

function AdminCollections() {
  const { collections, products } = useCatalog();
  const [draft, setDraft] = useState<Collection | null>(null);
  const [originalSlug, setOriginalSlug] = useState<string | undefined>(undefined);

  const count = (slug: string) => products.filter((p) => p.collection === slug).length;

  const startCreate = () => {
    setOriginalSlug(undefined);
    setDraft({ ...BLANK, image: products[0]?.images[0] ?? "" });
  };

  const startEdit = (collection: Collection) => {
    setOriginalSlug(collection.slug);
    setDraft({ ...collection });
  };

  const submit = () => {
    if (!draft) return;
    const name = draft.name.trim();
    if (!name) {
      toast.error("Give the collection a name");
      return;
    }
    const slug = slugify(draft.slug || name);
    if (collections.some((c) => c.slug === slug && c.slug !== originalSlug)) {
      toast.error("Another collection already uses that URL slug");
      return;
    }
    saveCollection({ ...draft, name, slug }, originalSlug);
    toast.success(originalSlug ? "Collection updated" : "Collection created");
    setDraft(null);
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {collections.length} collections · order here controls the header navigation
        </p>
        <Button onClick={startCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add collection
        </Button>
      </div>

      <ul className="grid gap-3">
        {collections.map((collection, index) => (
          <li
            key={collection.slug}
            className="grid grid-cols-[auto_72px_minmax(0,1fr)_auto] items-center gap-4 rounded-sm border border-border p-3"
          >
            <div className="flex flex-col">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                aria-label={`Move ${collection.name} up`}
                disabled={index === 0}
                onClick={() => moveCollection(collection.slug, -1)}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                aria-label={`Move ${collection.name} down`}
                disabled={index === collections.length - 1}
                onClick={() => moveCollection(collection.slug, 1)}
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </Button>
            </div>
            <img
              src={collection.image}
              alt=""
              className="h-16 w-[72px] rounded-xs object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{collection.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                /collections/{collection.slug} · {count(collection.slug)} products
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{collection.tagline}</p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Edit ${collection.name}`}
                onClick={() => startEdit(collection)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete ${collection.name}`}
                onClick={() => {
                  const n = count(collection.slug);
                  if (
                    window.confirm(
                      n
                        ? `Delete “${collection.name}” and its ${n} product(s)?`
                        : `Delete “${collection.name}”?`,
                    )
                  ) {
                    deleteCollection(collection.slug);
                    toast.success("Collection deleted");
                  }
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Sheet open={!!draft} onOpenChange={(open) => !open && setDraft(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{originalSlug ? "Edit collection" : "New collection"}</SheetTitle>
            <SheetDescription>
              Collections drive the shop pages and the header navigation.
            </SheetDescription>
          </SheetHeader>

          {draft ? (
            <div className="grid gap-4 px-4">
              <Field
                label="Name"
                value={draft.name}
                onChange={(v) => setDraft({ ...draft, name: v })}
              />
              <Field
                label="URL slug"
                value={draft.slug}
                placeholder={slugify(draft.name) || "gold-coated-silver"}
                onChange={(v) => setDraft({ ...draft, slug: v })}
              />
              <Field
                label="Tagline"
                value={draft.tagline}
                onChange={(v) => setDraft({ ...draft, tagline: v })}
              />
              <div className="grid gap-2">
                <Label htmlFor="collection-description">Description</Label>
                <Textarea
                  id="collection-description"
                  rows={4}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>
              <ImagePicker
                label="Banner image"
                value={draft.image}
                onChange={(v) => setDraft({ ...draft, image: v })}
              />
            </div>
          ) : null}

          <SheetFooter>
            <Button onClick={submit}>Save collection</Button>
            <Button variant="outline" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Field({
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
  const id = `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
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
