import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  BellRing,
  Boxes,
  Database,
  LayoutGrid,
  Mail,
  Receipt,
  RotateCcw,
  Settings,
  Store,
} from "lucide-react";
import { AdminGate } from "@/components/admin/admin-gate";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resetCatalog } from "@/lib/catalog-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Catalog Admin — Kyathi" },
      { name: "description", content: "Manage Kyathi products and collections." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

const TABS = [
  { to: "/admin", label: "Products", icon: Boxes, exact: true },
  { to: "/admin/collections", label: "Collections", icon: LayoutGrid, exact: false },
  { to: "/admin/orders", label: "Orders", icon: Receipt, exact: false },
  { to: "/admin/alerts", label: "Alerts & carts", icon: BellRing, exact: false },
  { to: "/admin/data", label: "Collected data", icon: Database, exact: false },
  { to: "/admin/settings", label: "Site settings", icon: Settings, exact: false },
  { to: "/admin/email", label: "Email test", icon: Mail, exact: false },
] as const;

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <AdminGate>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div className="min-w-0">
          <p className="eyebrow">Store admin</p>
          <h1 className="mt-2 text-3xl">Manage the storefront</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Products, collections, customer orders, back-in-stock alerts and abandoned carts — all
            in one place.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/">
              <Store className="mr-2 h-4 w-4" /> View store
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.confirm("Discard all admin changes and restore the original catalog?")) {
                resetCatalog();
                toast.success("Catalog reset to defaults");
              }
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
        </div>
      </div>

      <nav className="mt-6 flex gap-1 border-b border-border">
        {TABS.map((tab) => {
          const active = tab.exact ? pathname === tab.to : pathname.startsWith(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                "-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="pt-8">
        <Outlet />
      </div>
      </AdminGate>
    </div>
  );
}
