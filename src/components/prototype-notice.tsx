import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export function PrototypeNotice() {
  // Shows on every visit/refresh; dismissible for the current page view.
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(true);
  }, []);

  if (!open) return null;

  return (
    <div
      role="alert"
      className="bottom-stack-1 fixed inset-x-0 z-[60] px-2 md:px-4"
    >
      <div className="mx-auto flex w-full max-w-3xl items-start gap-2 rounded-sm border border-accent/40 bg-card/95 px-3 py-2 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/80 safe-x">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
        <p className="min-w-0 flex-1 text-[11px] leading-snug text-foreground sm:text-xs">
          <span className="font-semibold">Caution!</span> This is a prototype website. Please do
          not make any payments.
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close notice"
          className="-m-1 grid h-8 w-8 shrink-0 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
