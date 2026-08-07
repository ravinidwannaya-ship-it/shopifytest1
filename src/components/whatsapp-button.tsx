import { MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/lib/site-settings";

export function WhatsAppButton({ message }: { message?: string }) {
  const { contact } = useSiteSettings();
  const href = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
    message ?? "Hello Kyathi, I'd like to enquire about a sculpture.",
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Enquire on WhatsApp"
      className="bottom-stack-2 fixed right-4 z-30 flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg transition-transform hover:scale-105 md:right-6"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">Enquire</span>
    </a>
  );
}
