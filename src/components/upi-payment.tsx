import { Check, Copy, QrCode, Smartphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/catalog";
import { getSiteSettings, useSiteSettings } from "@/lib/site-settings";

export const UPI_ID = "ravinidwannaya@slc";
export const UPI_PAYEE = "Kyathi Sculptures";
export const UPI_QR_SRC = "/upi-qr.jpg";


export function upiDeepLink(amount: number, note: string) {
  const settings = getSiteSettings();
  const params = new URLSearchParams({
    pa: settings.payment.upiId || UPI_ID,
    pn: settings.payment.payee || UPI_PAYEE,
    am: String(amount),
    cu: "INR",
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}

export function UpiPayment({
  amount,
  reference,
  onReferenceChange,
}: {
  amount: number;
  reference: string;
  onReferenceChange: (value: string) => void;
}) {
  const settings = useSiteSettings();
  const upiId = settings.payment.upiId || UPI_ID;
  const qrSrc = settings.payment.qrUrl || UPI_QR_SRC;
  const [copied, setCopied] = useState(false);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      toast.success("UPI ID copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — please note the UPI ID manually");
    }
  };

  return (
    <div className="mt-4 rounded-sm border border-accent/40 bg-accent/5 p-4 sm:p-5">
      <p className="flex items-center gap-2 font-serif text-lg">
        <QrCode className="h-5 w-5 shrink-0 text-accent" /> Pay {formatINR(amount)} by UPI
      </p>

      <div className="mt-4 grid gap-5 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)] sm:items-start">
        <div className="mx-auto w-full max-w-[10rem] rounded-sm border border-border bg-background p-3">
          <img
            src={qrSrc}
            alt={`UPI QR code for ${upiId}`}
            className="aspect-square w-full object-contain"
            loading="lazy"
          />
          <p className="mt-2 text-center text-[0.7rem] uppercase tracking-widest text-muted-foreground">
            Scan to pay
          </p>
        </div>

        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">UPI ID</p>
          <div className="mt-1.5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <code className="truncate rounded-xs bg-background px-2.5 py-2 text-sm">{upiId}</code>
            <Button type="button" variant="outline" size="sm" onClick={copyId} className="shrink-0">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="sr-only">Copy UPI ID</span>
            </Button>
          </div>

          <Button asChild variant="outline" size="sm" className="mt-3 w-full sm:w-auto">
            <a href={upiDeepLink(amount, "Kyathi order")}>
              <Smartphone className="mr-2 h-4 w-4" /> Open UPI app
            </a>
          </Button>

          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Scan the QR or pay to the UPI ID above using GPay, PhonePe, Paytm or any bank app. Then
            enter the 12-digit UTR / reference number from your payment app so we can match it to
            your order.
          </p>

          <div className="mt-3 grid gap-2">
            <Label htmlFor="upiReference">UPI reference / UTR number</Label>
            <Input
              id="upiReference"
              name="upiReference"
              inputMode="numeric"
              autoComplete="off"
              placeholder="e.g. 412345678901"
              value={reference}
              onChange={(e) => onReferenceChange(e.target.value.replace(/\s/g, "").slice(0, 24))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
