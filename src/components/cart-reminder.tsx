import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Clock, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { CART_HOLD_HOURS, useStore } from "@/context/store-context";
import { saveAbandonedCart } from "@/lib/commerce.functions";

function countdown(to: number) {
  const ms = Math.max(0, to - Date.now());
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

/**
 * Cart-page notice for the 3-hour hold plus the email capture that powers the
 * automatic "you left something behind" reminder.
 */
export function CartReminder() {
  const { lines, subtotal, cartExpiresAt } = useStore();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [, force] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => force((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  const payload = useMemo(
    () => ({
      items: lines.map((l) => ({
        slug: l.product.slug,
        name: l.product.name,
        size: l.size,
        finish: l.finish,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
      })),
      subtotal,
    }),
    [lines, subtotal],
  );

  /** Signed-in shoppers are remembered automatically. */
  useEffect(() => {
    if (!user?.email || !payload.items.length) return;
    void saveAbandonedCart({ data: { email: user.email, ...payload } })
      .then(() => setSaved(true))
      .catch(() => undefined);
  }, [user?.email, payload]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    try {
      await saveAbandonedCart({ data: { email: email.trim().toLowerCase(), ...payload } });
      setSaved(true);
      toast.success("Cart saved", { description: "We'll email you a reminder before it expires." });
    } catch {
      toast.error("Couldn't save your cart. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!lines.length) return null;

  return (
    <div className="rounded-sm border border-accent/40 bg-accent/5 p-5">
      <p className="flex items-center gap-2 font-serif text-lg">
        <Clock className="h-4 w-4 text-accent" />
        Your cart is held for {CART_HOLD_HOURS} hours
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Because each piece is hand-finished in limited numbers, items stay reserved in your cart for{" "}
        {CART_HOLD_HOURS} hours and are then released back to stock. We send you an automatic
        reminder email before that happens, so nothing is lost by accident.
        {cartExpiresAt ? (
          <>
            {" "}
            Time remaining: <span className="font-semibold text-foreground">{countdown(cartExpiresAt)}</span>.
          </>
        ) : null}
      </p>

      {saved ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-foreground">
          <MailCheck className="h-4 w-4 text-accent" /> Reminder set for{" "}
          <span className="font-medium">{email}</span>
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email me a reminder"
            aria-label="Email for cart reminder"
          />
          <Button type="submit" variant="outline" disabled={busy} className="shrink-0">
            {busy ? "Saving…" : "Send me a reminder"}
          </Button>
        </form>
      )}
    </div>
  );
}
