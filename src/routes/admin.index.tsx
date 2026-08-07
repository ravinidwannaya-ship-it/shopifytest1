import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ProductForm } from "@/components/admin/product-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createFileRoute } from "@tanstack/react-router";
import { formatINR, type Product } from "@/lib/catalog";
import { deleteProduct, moveProduct, useCatalog } from "@/lib/catalog-store";

export const Route = createFileRoute("/admin/")({
  component: AdminProducts,
});

function AdminProducts() {
  const { products, collections } = useCatalog();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      `${p.name} ${p.figure} ${p.collection} ${p.material}`.toLowerCase().includes(q),
    );
  }, [products, query]);

  const collectionName = (slug: string) =>
    collections.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="max-w-xs"
          aria-label="Search products"
        />
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{products.length} products</span>
          <Button onClick={() => setCreating(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add product
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-sm border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Order</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="hidden md:table-cell">Collection</TableHead>
              <TableHead className="hidden lg:table-cell">Material</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="hidden sm:table-cell">Stock</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((product) => {
              const index = products.findIndex((p) => p.id === product.id);
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        aria-label={`Move ${product.name} up`}
                        disabled={index === 0 || !!query}
                        onClick={() => moveProduct(product.id, -1)}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        aria-label={`Move ${product.name} down`}
                        disabled={index === products.length - 1 || !!query}
                        onClick={() => moveProduct(product.id, 1)}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={product.images[0]}
                        alt=""
                        className="h-12 w-10 shrink-0 rounded-xs object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{product.name}</p>
                        <p className="truncate text-xs text-muted-foreground">/{product.slug}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {product.tags.map((t) => (
                            <Badge key={t} variant="secondary" className="text-[10px]">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {collectionName(product.collection)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">{product.material}</TableCell>
                  <TableCell className="text-sm">{formatINR(product.price)}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">{product.stock}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${product.name}`}
                        onClick={() => setEditing(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${product.name}`}
                        onClick={() => {
                          if (window.confirm(`Delete “${product.name}”?`)) {
                            deleteProduct(product.id);
                            toast.success("Product deleted");
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  No products match “{query}”.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      {query ? (
        <p className="text-xs text-muted-foreground">
          Clear the search to reorder products.
        </p>
      ) : null}

      <ProductForm
        open={creating || !!editing}
        product={editing}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setEditing(null);
          }
        }}
      />
    </div>
  );
}
