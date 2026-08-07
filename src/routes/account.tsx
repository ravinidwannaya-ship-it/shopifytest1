import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, LogOut, MapPin, PackageSearch, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageHero } from "@/components/page-hero";
import { ProductCard } from "@/components/product-card";
import { Section } from "@/components/section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, type Address } from "@/context/auth-context";
import { useStore } from "@/context/store-context";
import { formatINR, getProduct } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-store";
import {
  currentStage,
  formatOrderDate,
  loadOrdersFromCloud,
  ORDER_STAGES,
  useOrders,
} from "@/lib/orders";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your Account — Kyathi" },
      {
        name: "description",
        content:
          "Your Kyathi profile, saved addresses, order history and the gold-coated silver idols you have saved.",
      },
      { property: "og:title", content: "Your Account — Kyathi" },
      {
        property: "og:description",
        content: "Profile, addresses, orders and saved pieces — synced to your Kyathi account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  useCatalog();
  const orders = useOrders();
  const { wishlist } = useStore();
  const { user, profile, loading, signOut } = useAuth();

  useEffect(() => {
    if (user) void loadOrdersFromCloud();
  }, [user]);

  const saved = wishlist.flatMap((slug) => {
    const p = getProduct(slug);
    return p ? [p] : [];
  });

  if (loading) {
    return (
      <Section>
        <div className="py-24 text-center text-sm text-muted-foreground">Loading your account…</div>
      </Section>
    );
  }

  if (!user) {
    return (
      <>
        <PageHero
          eyebrow="Your account"
          title="Sign in to Kyathi"
          copy="Sign in to sync your wishlist, addresses and orders across every device."
        />
        <Section>
          <div className="mx-auto max-w-md py-6 text-center">
            <Button asChild size="lg">
              <Link to="/auth" search={{ redirect: undefined }}>Sign in or create an account</Link>
            </Button>
          </div>
        </Section>
      </>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Your account"
        title={profile?.full_name ? `Namaste, ${profile.full_name.split(" ")[0]}` : "Your account"}
        copy="Profile, addresses, orders and saved pieces — synced to your Kyathi account."
      />

      <Section>
        <Tabs defaultValue="orders">
          <TabsList className="flex-wrap">
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="saved">Saved ({saved.length})</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-8">
            {orders.length === 0 ? (
              <div className="mx-auto max-w-md py-10 text-center">
                <PackageSearch className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <h2 className="mt-5 font-serif text-2xl">No orders yet</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Once you complete checkout, your order and its delivery status appear here.
                </p>
                <Button asChild className="mt-6">
                  <Link to="/collections/$slug" params={{ slug: "gold-coated-silver" }}>
                    Browse the collection
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-5">
                {orders.map((order) => {
                  const stage = currentStage(order);
                  const stageInfo = ORDER_STAGES[stage];
                  return (
                    <article
                      key={order.id}
                      className="rounded-lg border border-border bg-card p-5 sm:p-6"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="font-serif text-xl">{order.id}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Placed {formatOrderDate(order.placedAt)} · {order.paymentLabel}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{formatINR(order.total)}</p>
                          <p className="mt-1 text-xs text-primary">
                            {stageInfo?.title ?? "In progress"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 border-t border-border/70 pt-4">
                        {order.lines.map((line) => (
                          <div
                            key={`${line.productSlug}-${line.size}-${line.finish}`}
                            className="flex items-center gap-3"
                          >
                            <img
                              src={line.image}
                              alt={line.name}
                              loading="lazy"
                              className="h-14 w-14 rounded object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm">{line.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {line.size} · {line.finish} · Qty {line.quantity}
                              </p>
                            </div>
                            <p className="text-sm">{formatINR(line.lineTotal)}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <Button asChild size="sm" variant="outline">
                          <Link to="/order/$id" params={{ id: order.id }}>
                            View details
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="ghost">
                          <Link to="/track-order" search={{ id: order.id }}>
                            Track order
                          </Link>
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-8">
            {saved.length === 0 ? (
              <div className="mx-auto max-w-md py-10 text-center">
                <Heart className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <h2 className="mt-5 font-serif text-2xl">Nothing saved yet</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tap the heart on any idol or frame and it will wait for you here.
                </p>
                <Button asChild className="mt-6">
                  <Link to="/wishlist">Go to wishlist</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
                {saved.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="addresses" className="mt-8">
            <AddressBook />
          </TabsContent>

          <TabsContent value="profile" className="mt-8">
            <ProfilePanel onSignOut={signOut} />
          </TabsContent>
        </Tabs>
      </Section>
    </>
  );
}

function ProfilePanel({ onSignOut }: { onSignOut: () => Promise<void> }) {
  const { user, profile, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSaving(true);
    await updateProfile({
      full_name: String(form.get("full_name") ?? "").trim().slice(0, 100),
      phone: String(form.get("phone") ?? "").trim().slice(0, 20),
    });
    setSaving(false);
    toast.success("Profile updated");
  };

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt="" /> : null}
          <AvatarFallback>
            {(profile?.full_name ?? user?.email ?? "K").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-serif text-xl">{profile?.full_name ?? "Kyathi customer"}</p>
          <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-8 grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            name="full_name"
            defaultValue={profile?.full_name ?? ""}
            maxLength={100}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={profile?.phone ?? ""}
            maxLength={20}
            placeholder="+91 95915 17282"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={saving}>
            Save changes
          </Button>
          <Button type="button" variant="ghost" onClick={() => void onSignOut()}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </form>
    </div>
  );
}

function AddressBook() {
  const { addresses, saveAddress, deleteAddress } = useAuth();
  const [editing, setEditing] = useState<Address | "new" | null>(null);

  return (
    <div className="max-w-2xl">
      <div className="grid gap-4">
        {addresses.map((a) => (
          <article key={a.id} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-primary" />
                  {a.label || "Address"}
                  {a.is_default ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] tracking-wide text-primary uppercase">
                      Default
                    </span>
                  ) : null}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {a.full_name} · {a.phone}
                  <br />
                  {a.line1}, {a.city}, {a.state} {a.pincode}
                </p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => setEditing(a)}>
                  Edit
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Delete address"
                  onClick={() => void deleteAddress(a.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {editing ? (
        <form
          className="mt-6 grid gap-4 rounded-lg border border-border bg-card p-5"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            await saveAddress({
              ...(editing === "new" ? {} : { id: editing.id }),
              label: String(f.get("label") ?? "").slice(0, 40),
              full_name: String(f.get("full_name") ?? "").slice(0, 100),
              phone: String(f.get("phone") ?? "").slice(0, 20),
              line1: String(f.get("line1") ?? "").slice(0, 240),
              city: String(f.get("city") ?? "").slice(0, 80),
              state: String(f.get("state") ?? "").slice(0, 80),
              pincode: String(f.get("pincode") ?? "").slice(0, 6),
              is_default: f.get("is_default") === "on",
            });
            setEditing(null);
            toast.success("Address saved");
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="label" label="Label" defaultValue={editing === "new" ? "" : (editing.label ?? "")} placeholder="Home" />
            <Field name="full_name" label="Full name" required defaultValue={editing === "new" ? "" : editing.full_name} />
            <Field name="phone" label="Phone" required defaultValue={editing === "new" ? "" : editing.phone} />
            <Field name="pincode" label="Pincode" required defaultValue={editing === "new" ? "" : editing.pincode} />
            <Field name="city" label="City" required defaultValue={editing === "new" ? "" : editing.city} />
            <Field name="state" label="State" required defaultValue={editing === "new" ? "" : editing.state} />
          </div>
          <Field name="line1" label="Address" required defaultValue={editing === "new" ? "" : editing.line1} />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_default"
              defaultChecked={editing !== "new" && editing.is_default}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Use as my default delivery address
          </label>
          <div className="flex gap-3">
            <Button type="submit">Save address</Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" className="mt-6" onClick={() => setEditing("new")}>
          <Plus className="mr-2 h-4 w-4" /> Add an address
        </Button>
      )}
    </div>
  );
}

function Field({
  name,
  label,
  defaultValue,
  required,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={`addr-${name}`}>{label}</Label>
      <Input
        id={`addr-${name}`}
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required ?? false}
        placeholder={placeholder ?? ""}
      />
    </div>
  );
}
