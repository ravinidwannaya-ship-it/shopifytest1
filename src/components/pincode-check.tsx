import { Check, Loader2, MapPin, Truck, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkPincode, isValidPincode, type DeliveryEstimate } from "@/lib/delivery";
import { cn } from "@/lib/utils";

interface PincodeCheckProps {
  className?: string;
  compact?: boolean;
  onResult?: (estimate: DeliveryEstimate | null) => void;
}

const STORAGE_KEY = "kyathi-pincode";

export function PincodeCheck({ className, compact = false, onResult }: PincodeCheckProps) {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<DeliveryEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const run = () => {
    if (!isValidPincode(pincode)) {
      setError("Enter a valid 6-digit pincode");
      setResult(null);
      onResult?.(null);
      return;
    }
    setError(null);
    setChecking(true);
    // Simulated lookup latency — replace with the courier API call.
    window.setTimeout(() => {
      const estimate = checkPincode(pincode);
      setResult(estimate);
      setChecking(false);
      onResult?.(estimate);
      try {
        if (estimate) window.localStorage.setItem(STORAGE_KEY, estimate.pincode);
      } catch {
        /* storage unavailable */
      }
    }, 450);
  };

  return (
    <div className={cn("grid gap-3", className)}>
      {!compact ? (
        <p className="flex items-center gap-2 text-xs font-medium tracking-[0.14em] uppercase text-muted-foreground">
          <MapPin className="h-4 w-4 text-accent" /> Check delivery
        </p>
      ) : null}

      <div className="flex gap-2">
        <Input
          value={pincode}
          onChange={(e) => {
            setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              run();
            }
          }}
          inputMode="numeric"
          placeholder="6-digit pincode"
          aria-label="Delivery pincode"
          className="max-w-44"
        />
        <Button type="button" variant="outline" onClick={run} disabled={checking}>
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
        </Button>
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      {result ? (
        <div
          className={cn(
            "rounded-sm border p-3.5 text-xs leading-relaxed",
            result.serviceable
              ? "border-accent/40 bg-accent/5"
              : "border-destructive/40 bg-destructive/5",
          )}
        >
          <p className="flex items-center gap-2 text-sm font-medium">
            {result.serviceable ? (
              <Check className="h-4 w-4 text-accent" />
            ) : (
              <X className="h-4 w-4 text-destructive" />
            )}
            {result.serviceable
              ? `Delivers by ${result.etaLabel}`
              : `We don't ship to ${result.pincode} yet`}
          </p>
          <p className="mt-1.5 text-muted-foreground">{result.message}</p>
          {result.serviceable ? (
            <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-accent" />
                {result.zone} · {result.city}
              </li>
              <li>{result.codAvailable ? "Cash on delivery available" : "Prepaid only"}</li>
              {result.expressAvailable ? <li>Express dispatch available</li> : null}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
