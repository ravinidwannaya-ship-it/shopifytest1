import { discountPercent, formatINR } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function PriceTag({
  price,
  compareAt,
  size = "sm",
  className,
}: {
  price: number;
  compareAt?: number;
  size?: "sm" | "lg";
  className?: string;
}) {
  const off = compareAt ? discountPercent(price, compareAt) : 0;
  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span
        className={cn(
          "font-semibold text-foreground",
          size === "lg" ? "text-2xl sm:text-3xl" : "text-base",
        )}
      >
        {formatINR(price)}
      </span>
      {compareAt && compareAt > price ? (
        <>
          <span
            className={cn(
              "text-muted-foreground line-through",
              size === "lg" ? "text-base" : "text-xs",
            )}
          >
            {formatINR(compareAt)}
          </span>
          <span
            className={cn(
              "font-semibold text-terracotta",
              size === "lg" ? "text-sm" : "text-xs",
            )}
          >
            {off}% off
          </span>
        </>
      ) : null}
    </div>
  );
}
