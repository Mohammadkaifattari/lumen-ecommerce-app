"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { Review } from "@/types";
import { Stars } from "@/components/ui/Stars";
import { cn } from "@/lib/utils";

/** Aggregate rating breakdown + expandable review cards. */
export function ReviewsSection({
  reviews,
  rating,
  reviewCount,
}: {
  reviews: Review[];
  rating: number;
  reviewCount: number;
}) {
  const [visible, setVisible] = useState(3);

  const distribution = [5, 4, 3, 2, 1].map((star) => {
    // Derive a believable distribution from the average for the demo.
    const base = star === Math.round(rating) ? 60 : star >= 4 ? 22 : star >= 3 ? 8 : 3;
    return { star, pct: base };
  });

  return (
    <section className="container-edge py-20 lg:py-24">
      <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-16">
        {/* Summary */}
        <div>
          <p className="eyebrow mb-3">Reviews</p>
          <h2 className="text-display-lg font-bold tracking-tight">The verdict.</h2>
          <div className="mt-6 flex items-end gap-4">
            <span className="text-6xl font-bold tracking-tight">{rating.toFixed(1)}</span>
            <div className="pb-2">
              <Stars rating={rating} size={20} />
              <p className="mt-1 text-sm text-ink-muted dark:text-paper/60">
                Based on {reviewCount} reviews
              </p>
            </div>
          </div>

          {/* Distribution bars */}
          <div className="mt-6 space-y-2">
            {distribution.map((d) => (
              <div key={d.star} className="flex items-center gap-3 text-sm">
                <span className="w-3 text-ink-muted dark:text-paper/60">{d.star}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10 dark:bg-paper/10">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${d.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full bg-accent"
                  />
                </div>
                <span className="w-8 text-right text-ink-muted dark:text-paper/60">{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Review cards */}
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {reviews.slice(0, visible).map((review, i) => (
              <motion.article
                key={review.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-2xl border border-ink/10 p-6 dark:border-paper/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-bold text-paper dark:bg-paper dark:text-ink">
                      {review.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{review.author}</p>
                      <p className="text-xs text-ink-muted dark:text-paper/50">
                        Verified Purchase · {new Date(review.date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <Stars rating={review.rating} size={14} />
                </div>
                <h3 className="mt-4 font-medium">{review.title}</h3>
                <p className="mt-1 text-ink-muted dark:text-paper/70">{review.comment}</p>
              </motion.article>
            ))}
          </AnimatePresence>

          {visible < reviews.length && (
            <button
              onClick={() => setVisible((v) => v + 3)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-ink/15 py-4 text-sm font-medium transition-colors hover:bg-ink hover:text-paper dark:border-paper/20 dark:hover:bg-paper dark:hover:text-ink"
            >
              Show more reviews <ChevronDown className={cn("h-4 w-4")} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
