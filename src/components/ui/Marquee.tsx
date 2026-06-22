import { cn } from "@/lib/utils";

/** Nike-style horizontal marquee strip. Pure CSS for performance. */
export function Marquee({
  items,
  className,
  invert = false,
}: {
  items: string[];
  className?: string;
  invert?: boolean;
}) {
  // Duplicate the list so the animation can loop seamlessly.
  const doubled = [...items, ...items];

  return (
    <div
      className={cn(
        "relative flex overflow-hidden border-y py-3",
        invert
          ? "border-ink/10 bg-ink text-paper dark:border-paper/10 dark:bg-paper dark:text-ink"
          : "border-ink/10 dark:border-paper/10",
        className
      )}
    >
      <div className="flex animate-marquee flex-none gap-8 whitespace-nowrap pr-8">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-8 text-sm font-medium uppercase tracking-[0.2em]">
            {item}
            <span className="text-accent" aria-hidden>
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
