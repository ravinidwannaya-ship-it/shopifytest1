import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useStore } from "@/context/store-context";
import { formatINR, searchProducts } from "@/lib/catalog";

const SUGGESTIONS = ["Ganesha", "Lakshmi", "Balaji", "Photo frame", "Gold coated"];

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useStore();
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchProducts(query, 6), [query]);

  return (
    <Dialog
      open={searchOpen}
      onOpenChange={(open) => {
        setSearchOpen(open);
        if (!open) setQuery("");
      }}
    >
      <DialogContent className="top-24 max-w-2xl translate-y-0 gap-0 p-0">
        <DialogTitle className="sr-only">Search sculptures</DialogTitle>
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search idols and photo frames…"
            className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-2 py-2">
          {!query ? (
            <div className="px-3 py-3">
              <p className="eyebrow mb-3">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQuery(s)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:border-accent hover:text-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nothing matches “{query}”. Try “Ganesha” or “photo frame”.
            </p>
          ) : (
            <ul>
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/products/$slug"
                    params={{ slug: p.slug }}
                    onClick={() => {
                      setSearchOpen(false);
                      setQuery("");
                    }}
                    className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 rounded-sm px-3 py-2.5 transition-colors hover:bg-secondary"
                  >
                    <img
                      src={p.images[0]}
                      alt=""
                      loading="lazy"
                      className="h-14 w-14 rounded-xs object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-serif text-base">{p.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {p.material} · {p.figure}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold">{formatINR(p.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
