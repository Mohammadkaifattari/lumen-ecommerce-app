"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Product } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/ui/Reveal";

/** Horizontal scroll carousel of featured products with snap + arrows. */
export function FeaturedCarousel({ products }: { products: Product[] }) {
  const scroller = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = scroller.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="py-20 lg:py-28">
      <div className="container-edge mb-10 flex items-end justify-between gap-6">
        <Reveal>
          <p className="eyebrow mb-3">Featured</p>
          <h2 className="text-display-lg font-bold tracking-tight">The Icons.</h2>
        </Reveal>
        <div className="hidden items-center gap-3 sm:flex">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 transition-colors hover:bg-ink hover:text-paper dark:border-paper/20 dark:hover:bg-paper dark:hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 transition-colors hover:bg-ink hover:text-paper dark:border-paper/20 dark:hover:bg-paper dark:hover:text-ink"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-pl-5 px-5 pb-4 sm:px-8 lg:px-12"
      >
        {products.map((p, i) => (
          <div
            key={p.id}
            className="w-[78vw] flex-none snap-start sm:w-[42vw] lg:w-[28vw] xl:w-[24rem]"
          >
            <ProductCard product={p} index={i} priority={i < 2} />
          </div>
        ))}
        {/* Tail card: link to shop */}
        <Link
          href="/shop"
          className="group flex w-[60vw] flex-none snap-center items-center justify-center rounded-2xl border border-dashed border-ink/20 p-8 text-center transition-colors hover:border-ink dark:border-paper/20 dark:hover:border-paper sm:w-[28vw] lg:w-[20vw]"
        >
          <span className="flex flex-col items-center gap-3">
            <motion.span
              whileHover={{ x: 4 }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-paper dark:bg-paper dark:text-ink"
            >
              <ArrowRight className="h-5 w-5" />
            </motion.span>
            <span className="text-sm font-medium uppercase tracking-wider">View All</span>
          </span>
        </Link>
      </div>
    </section>
  );
}
