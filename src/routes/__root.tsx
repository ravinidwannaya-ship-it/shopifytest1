import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AnnouncementBar, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartDrawer } from "@/components/cart-drawer";
import { SearchOverlay } from "@/components/search-overlay";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { PrototypeNotice } from "@/components/prototype-notice";
import { StoreProvider } from "@/context/store-context";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { hydrateCatalog } from "@/lib/catalog-store";
import { hydrateSiteSettings } from "@/lib/site-settings";
import { hydrateOrders } from "@/lib/orders";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-7xl">404</h1>
        <h2 className="mt-4 text-xl">This page isn't in our catalogue</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-sm border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: "Kyathi — Gold Coated Silver Idols & Photo Frame Idols" },
      {
        name: "description",
        content:
          "Hand-finished 999 silver idols coated in 24K gold, and gold-coated deity reliefs framed in teak and rosewood. Made in India, shipped nationwide.",
      },
      { name: "author", content: "Kyathi" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Kyathi — Gold Coated Silver Idols & Photo Frame Idols" },
      { name: "twitter:title", content: "Kyathi — Gold Coated Silver Idols & Photo Frame Idols" },
      { property: "og:description", content: "Hand-finished 999 silver idols coated in 24K gold, and gold-coated deity reliefs framed in teak and rosewood. Made in India, shipped nationwide." },
      { name: "twitter:description", content: "Hand-finished 999 silver idols coated in 24K gold, and gold-coated deity reliefs framed in teak and rosewood. Made in India, shipped nationwide." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/29cb3a97-d493-4762-8c03-0eb86cc6041c/id-preview-d9961f6d--e15e7019-92af-40bc-ac00-0390b1a6c1d8.lovable.app-1785874255797.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/29cb3a97-d493-4762-8c03-0eb86cc6041c/id-preview-d9961f6d--e15e7019-92af-40bc-ac00-0390b1a6c1d8.lovable.app-1785874255797.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Karla:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    hydrateCatalog();
    hydrateSiteSettings();
    hydrateOrders();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreProvider>
          <div className="flex min-h-dvh flex-col">
            <a href="#main-content" className="skip-link">
              Skip to content
            </a>
            <AnnouncementBar />
            <SiteHeader />
            <main
              id="main-content"
              className="w-full min-w-0 flex-1 pb-[calc(var(--bottom-nav-h)+var(--bottom-safe))]"
            >
              {/* Required: nested routes render here. */}
              <Outlet />
            </main>
            <SiteFooter />
          </div>
          <CartDrawer />
          <SearchOverlay />
          <MobileBottomNav />
          <PrototypeNotice />
          <Toaster
            position="bottom-right"
            offset="calc(var(--bottom-nav-h) + var(--bottom-safe) + var(--bottom-bar-h) + 4.5rem)"
          />
        </StoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
