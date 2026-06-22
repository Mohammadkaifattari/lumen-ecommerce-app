"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Renders a star rating with partial fill via fractional width overlay. */
export function Stars({
  rating,
  size = 14,
  className,
  showValue = false,
}: {
  rating: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="relative inline-flex">
        <span className="flex text-ink/15 dark:text-paper/15">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} width={size} height={size} className="fill-current" />
          ))}
        </span>
        <span
          className="absolute inset-0 flex overflow-hidden text-accent"
          style={{ width: `${(rating / 5) * 100}%` }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} width={size} height={size} className="flex-none fill-current" />
          ))}
        </span>
      </span>
      {showValue && (
        <span className="text-xs font-medium tabular-nums">{rating.toFixed(1)}</span>
      )}
    </span>
  );
}
