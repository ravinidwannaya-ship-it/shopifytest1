import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-form";
import { listCollections } from "@/lib/catalog";
import { useSiteSettings } from "@/lib/site-settings";



export function SiteFooter() {
  const collections = listCollections();
  const settings = useSiteSettings();
  const socials = [
    { Icon: Instagram, href: settings.social.instagram, label: "Instagram" },
    { Icon: Facebook, href: settings.social.facebook, label: "Facebook" },
    { Icon: Youtube, href: settings.social.youtube, label: "YouTube" },
  ].filter((s2) => s2.href.trim().length > 0);

  return (
    <footer className="mt-4 border-t border-border bg-secondary/50">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="min-w-0">
          <img src={settings.logoUrl} alt={settings.brandName} className="h-12 w-auto" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {settings.tagline}
          </p>
          <div className="mt-5 flex gap-2">
            {socials.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="eyebrow mb-4">Shop by Category</h3>
          <ul className="grid gap-2.5 text-sm text-muted-foreground">
            {collections.map((c) => (
              <li key={c.slug}>
                <Link
                  to="/collections/$slug"
                  params={{ slug: c.slug }}
                  className="transition-colors hover:text-primary"
                >
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/corporate-gifting" className="transition-colors hover:text-primary">
                Corporate Gifting
              </Link>
            </li>
          </ul>
        </div>

        <div className="min-w-0">
          <h3 className="eyebrow mb-4">Information</h3>
          <ul className="grid gap-2.5 text-sm text-muted-foreground">
            <li>
              <Link to="/about" className="transition-colors hover:text-primary">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/custom-sculpture" className="transition-colors hover:text-primary">
                Custom Sculpture
              </Link>
            </li>
            <li>
              <Link to="/faq" className="transition-colors hover:text-primary">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/track-order" className="transition-colors hover:text-primary">
                Track Your Order
              </Link>
            </li>
            <li>
              <Link to="/policies/$slug" params={{ slug: "shipping" }} className="transition-colors hover:text-primary">
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link to="/policies/$slug" params={{ slug: "returns" }} className="transition-colors hover:text-primary">
                Return &amp; Refund Policy
              </Link>
            </li>
            <li>
              <Link to="/policies/$slug" params={{ slug: "terms" }} className="transition-colors hover:text-primary">
                Terms of Use
              </Link>
            </li>
            <li>
              <Link to="/policies/$slug" params={{ slug: "privacy" }} className="transition-colors hover:text-primary">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        <div className="min-w-0">
          <h3 className="eyebrow mb-4">Talk to us</h3>
          <a
            href={`tel:${settings.contact.phone}`}
            className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-accent px-5 py-3 text-sm font-semibold tracking-wide text-accent-foreground transition-opacity hover:opacity-90 sm:w-auto"
          >
            <Phone className="h-4 w-4" /> Call {settings.contact.phone}
          </a>
          <ul className="grid gap-3 text-sm text-muted-foreground">
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>{settings.contact.hours}</span>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>{settings.contact.email}</span>
            </li>

            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>{settings.contact.address}</span>
            </li>
          </ul>
          <div className="mt-6">
            <h3 className="eyebrow mb-3">Kyathi Insider</h3>
            <NewsletterForm compact />
          </div>
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 text-xs text-muted-foreground sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center lg:px-8">
          <p>{settings.footerNote.replace("{year}", String(new Date().getFullYear()))}</p>
          <div className="flex flex-wrap gap-2">
            {["VISA", "Mastercard", "RuPay", "UPI", "Net Banking", "COD"].map((m) => (
              <span
                key={m}
                className="rounded-xs border border-border bg-background px-2.5 py-1 text-[10px] font-semibold tracking-wide"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
