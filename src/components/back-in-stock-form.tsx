import { useState, type FormEvent } from "react";
import { BellRing, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { sendEmail, STUDIO_EMAIL } from "@/lib/emailjs";

interface Props {
  productSlug: string;
  productName: string;
  className?: string;
}

/** Sold-out capture: we mail the shopper automatically when the piece is recast. */
export function BackInStockForm({ productSlug, productName, className }: Props) {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? "");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("back_in_stock_requests").insert({
      product_slug: productSlug,
      product_name: productName,
      email: email.trim().toLowerCase(),
      user_id: user?.id ?? null,
    });
    setBusy(false);
    if (error && !error.message.includes("duplicate")) {
      toast.error("Couldn't save your alert", { description: error.message });
      return;
    }
    const address = email.trim().toLowerCase();
    void sendEmail({
      to: address,
      subject: `We'll tell you when ${productName} is back`,
      message: `Namaste,\n\nYour back-in-stock alert for ${productName} is set. The moment this piece is recast and available, we'll email you straight away.\n\n— Kyathi Heritage, Puttur`,
    });
    void sendEmail({
      to: STUDIO_EMAIL,
      toName: "Kyathi Studio",
      subject: `Back-in-stock request — ${productName}`,
      message: `${address} wants to be notified when ${productName} (${productSlug}) is available again.`,
      replyTo: address,
    });
    setDone(true);
    toast.success("You're on the list", {
      description: `We'll email you the moment ${productName} is back.`,
    });
  };

  if (done) {
    return (
      <div
        className={cn(
          "flex items-start gap-3 rounded-sm border border-accent/40 bg-accent/10 p-4 text-sm",
          className,
        )}
      >
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <p>
          Alert set for <span className="font-medium">{email}</span>. You'll be the first to know
          when this piece is available again.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className={cn("rounded-sm border border-border bg-secondary/40 p-4", className)}
    >
      <p className="flex items-center gap-2 text-sm font-medium">
        <BellRing className="h-4 w-4 text-accent" /> Sold out — get notified
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Leave your email and we'll send an automatic reminder as soon as this piece is back in
        stock. No spam, one mail only.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          aria-label="Email for back-in-stock alert"
        />
        <Button type="submit" disabled={busy} className="shrink-0">
          {busy ? "Saving…" : "Notify me"}
        </Button>
      </div>
    </form>
  );
}
