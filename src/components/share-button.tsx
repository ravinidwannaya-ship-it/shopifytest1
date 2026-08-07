import { useState } from "react";
import { Check, Facebook, Link2, Share2, Twitter } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  title: string;
  text?: string;
  /** Path relative to the site root, e.g. /products/ganesha */
  path: string;
  className?: string;
  label?: string;
}

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.1 4.02 4.13-1.08A9.9 9.9 0 1 0 12.04 2Zm0 1.86a8.05 8.05 0 1 1-4.1 14.97l-.29-.17-2.45.64.65-2.38-.19-.3A8.05 8.05 0 0 1 12.04 3.86Zm4.6 10.2c-.25-.13-1.46-.72-1.69-.8-.22-.09-.39-.13-.55.12-.16.25-.63.8-.77.96-.14.17-.28.19-.53.06a6.6 6.6 0 0 1-1.94-1.2 7.3 7.3 0 0 1-1.34-1.67c-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.42.06-.64.31-.22.25-.84.82-.84 2s.86 2.32.98 2.48c.12.17 1.7 2.6 4.11 3.65.58.25 1.03.4 1.38.51.58.18 1.1.16 1.52.1.46-.07 1.46-.6 1.66-1.17.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.29Z" />
  </svg>
);

export function ShareButton({ title, text, path, className, label = "Share" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const url = () =>
    typeof window === "undefined" ? path : new URL(path, window.location.origin).toString();

  const nativeShare = async () => {
    const link = url();
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: text ?? title, url: link });
        return true;
      } catch {
        return true; // user dismissed — don't fall through to the menu
      }
    }
    return false;
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      toast.success("Link copied", { description: "Share it anywhere you like." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const open = (href: string) => window.open(href, "_blank", "noopener,noreferrer");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary",
          className,
        )}
        onClick={(e) => {
          if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
            e.preventDefault();
            void nativeShare();
          }
        }}
        aria-label={`${label} ${title}`}
      >
        {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
        {label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuItem
          onClick={() =>
            open(`https://wa.me/?text=${encodeURIComponent(`${title} — ${url()}`)}`)
          }
        >
          <WhatsAppIcon className="mr-2 h-4 w-4" /> WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            open(
              `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url())}`,
            )
          }
        >
          <Twitter className="mr-2 h-4 w-4" /> X (Twitter)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url())}`)
          }
        >
          <Facebook className="mr-2 h-4 w-4" /> Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void copy()}>
          <Link2 className="mr-2 h-4 w-4" /> Copy link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
