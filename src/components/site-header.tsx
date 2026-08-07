import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Heart, LogOut, Menu, Package, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/auth-context";
import { useStore } from "@/context/store-context";
import { listCollections } from "@/lib/catalog";
import { useCatalog } from "@/lib/catalog-store";
import { useSiteSettings } from "@/lib/site-settings";
import { cn } from "@/lib/utils";



function AccountMenu() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Button variant="ghost" size="icon" aria-label="Sign in" asChild>
        <Link to="/auth" search={{ redirect: undefined }}>
          <User className="h-[18px] w-[18px]" />
        </Link>
      </Button>
    );
  }

  const name = profile?.full_name ?? user.email ?? "Your account";
  const initials = name.trim().charAt(0).toUpperCase() || "K";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Account menu">
          <Avatar className="h-7 w-7">
            {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt="" /> : null}
            <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate font-normal">
          <span className="block text-sm font-medium">{profile?.full_name ?? "Signed in"}</span>
          <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/account">
            <Package className="mr-2 h-4 w-4" /> My account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/wishlist">
            <Heart className="mr-2 h-4 w-4" /> Wishlist
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            void signOut().then(() => navigate({ to: "/" }));
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


export function AnnouncementBar() {
  const { announcement } = useSiteSettings();
  if (!announcement.enabled || !announcement.text.trim()) return null;
  return (
    <div className="bg-primary text-primary-foreground">
      <p className="mx-auto max-w-7xl px-4 py-2 text-center text-[11px] font-medium tracking-[0.18em] uppercase sm:text-xs">
        {announcement.text}
      </p>
    </div>
  );
}

export function SiteHeader() {
  const { itemCount, setCartOpen, setSearchOpen, wishlist } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useCatalog();
  const settings = useSiteSettings();
  const collections = listCollections();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur transition-shadow",
        scrolled && "shadow-[0_1px_20px_-12px_oklch(0.25_0.03_40/0.55)]",
      )}
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[86vw] max-w-sm p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <nav className="flex h-full flex-col overflow-y-auto px-6 py-8">
                 <img src={settings.logoUrl} alt={settings.brandName} className="h-10 w-auto" />
                <div className="mt-8 grid gap-1">
                  {collections.map((c) => (
                    <Link
                      key={c.slug}
                      to="/collections/$slug"
                      params={{ slug: c.slug }}
                      className="border-b border-border/60 py-3 text-base"
                    >
                      {c.name}
                    </Link>
                  ))}
                  <Link to="/customize-idol" className="border-b border-border/60 py-3 font-medium text-primary">
                    Customise Idol Design
                  </Link>
                  <Link to="/corporate-gifting" className="border-b border-border/60 py-3">
                    Corporate Gifting
                  </Link>
                  <Link to="/custom-sculpture" className="border-b border-border/60 py-3">
                    Custom Sculpture
                  </Link>
                  <Link to="/about" className="border-b border-border/60 py-3">
                    About Us
                  </Link>
                  <Link to="/contact" className="border-b border-border/60 py-3">
                    Contact
                  </Link>
                  <Link to="/account" className="border-b border-border/60 py-3">
                    My Account
                  </Link>
                  <Link to="/wishlist" className="border-b border-border/60 py-3">
                    Wishlist
                  </Link>

                  <Link to="/track-order" className="border-b border-border/60 py-3">
                    Track Your Order
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/" className="min-w-0 shrink-0" aria-label="Kyathi — home">
            <img
               src={settings.logoUrl}
               alt={settings.brandName}
              className="h-9 w-auto sm:h-11"
              width={416}
              height={169}
            />
          </Link>
        </div>

        <nav className="hidden min-w-0 items-center justify-center gap-5 lg:flex xl:gap-7">
          {collections.map((c) => (
            <Link
              key={c.slug}
              to="/collections/$slug"
              params={{ slug: c.slug }}
              className="whitespace-nowrap text-[13px] tracking-wide text-foreground/80 transition-colors hover:text-primary data-[status=active]:text-primary"
            >
              {c.name}
            </Link>
          ))}
          <Link
            to="/corporate-gifting"
            className="whitespace-nowrap text-[13px] tracking-wide text-foreground/80 transition-colors hover:text-primary data-[status=active]:text-primary"
          >
            Corporate Gifting
          </Link>
          <Link
            to="/customize-idol"
            className="whitespace-nowrap rounded-sm border border-accent/50 px-3 py-1.5 text-[13px] font-medium tracking-wide text-accent transition-colors hover:bg-accent/10"
          >
            Customise Idol
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-[18px] w-[18px]" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Wishlist" asChild>
            <Link to="/wishlist">
              <span className="relative">
                <Heart className="h-5 w-5" />
                {wishlist.length > 0 ? (
                  <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] text-primary-foreground">
                    {wishlist.length}
                  </span>
                ) : null}
              </span>
            </Link>
          </Button>
          <AccountMenu />


          <Button
            variant="ghost"
            size="icon"
            aria-label={`Cart, ${itemCount} items`}
            className="relative"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            {itemCount > 0 ? (
              <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {itemCount}
              </span>
            ) : null}
          </Button>
        </div>
      </div>
    </header>
  );
}

export function CloseIcon() {
  return <X className="h-4 w-4" />;
}
