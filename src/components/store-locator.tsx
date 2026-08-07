import { Clock, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listStores } from "@/lib/catalog";

export function StoreLocator() {
  const stores = listStores();
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {stores.map((store) => (
        <article
          key={store.id}
          className="grid overflow-hidden rounded-sm border border-border bg-card sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
        >
          <img
            src={store.image}
            alt={store.name}
            loading="lazy"
            className="h-44 w-full object-cover sm:h-full"
          />
          <div className="min-w-0 p-5">
            <h3 className="text-xl leading-snug">{store.name}</h3>
            <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{store.address}</span>
              </li>
              <li className="flex gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{store.timing}</span>
              </li>
              <li className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{store.phone}</span>
              </li>
            </ul>
            <Button asChild variant="outline" size="sm" className="mt-5">
              <a href={store.mapsUrl} target="_blank" rel="noreferrer">
                Get directions
              </a>
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
