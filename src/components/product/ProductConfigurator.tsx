"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Minus, Plus, ShoppingBag, Heart, Truck, RotateCcw, Shield } from "lucide-react";
import type { Product } from "@/types";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { Stars } from "@/components/ui/Stars";
import { cn, formatPrice } from "@/lib/utils";

export function ProductConfigurator({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const toggleWishlist = useWishlist((s) => s.toggle);
  const isWishlisted = useWishlist((s) => s.has(product.id));

  const [colorIdx, setColorIdx] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!size) {
      setError("Please select a size.");
      return;
    }
    setError(null);
    add(product, {
      color: product.colors[colorIdx].name,
      size,
      quantity: qty,
    });
    // Trigger the success micro-interaction.
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const lowStock = product.stock <= 5;

  return (
    <div className="lg:sticky lg:top-28">
      {/* Breadcrumb-ish header */}
      <p className="eyebrow mb-3">{product.category}</p>
      <h1 className="text-display-lg font-bold leading-[0.95] tracking-tight">{product.name}</h1>
      <p className="mt-2 text-lg text-ink-muted dark:text-paper/60">{product.tagline}</p>

      {/* Rating */}
      <div className="mt-4 flex items-center gap-3">
        <Stars rating={product.rating} size={16} showValue />
        <span className="text-sm text-ink-muted dark:text-paper/50">
          ({product.reviewCount} reviews)
        </span>
      </div>

      {/* Price */}
      <div className="mt-6 flex items-baseline gap-3">
        <span className="text-3xl font-semibold tracking-tight">{formatPrice(product.price)}</span>
        {product.compareAtPrice && (
          <span className="text-lg text-ink-muted line-through dark:text-paper/40">
            {formatPrice(product.compareAtPrice)}
          </span>
        )}
      </div>

      {/* Stock indicator — real-time feel */}
      <div className="mt-4 flex items-center gap-2 text-sm">
        <span className={cn("h-2 w-2 rounded-full", lowStock ? "bg-accent" : "bg-green-500")}>
          <span className="block h-2 w-2 animate-ping rounded-full bg-current opacity-60" />
        </span>
        {lowStock ? (
          <span className="font-medium">Only {product.stock} left — selling fast.</span>
        ) : (
          <span className="text-ink-muted dark:text-paper/60">In stock — ready to ship.</span>
        )}
      </div>

      {/* Color selector */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/50">
            Color
          </h3>
          <span className="text-sm font-medium">{product.colors[colorIdx].name}</span>
        </div>
        <div className="flex gap-3">
          {product.colors.map((c, i) => (
            <button
              key={c.name}
              onClick={() => setColorIdx(i)}
              aria-label={c.name}
              aria-pressed={colorIdx === i}
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                colorIdx === i
                  ? "border-ink dark:border-paper"
                  : "border-ink/15 dark:border-paper/20"
              )}
              style={{ backgroundColor: c.hex }}
            >
              {colorIdx === i && (
                <Check
                  className="h-4 w-4"
                  style={{
                    color: ["#f1f1f0", "#d4ff3f", "#d8c4a8"].includes(c.hex) ? "#0a0a0a" : "#fff",
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Size selector */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/50">
            Size
          </h3>
          <button className="text-xs underline-offset-2 hover:underline">Size guide</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => (
            <button
              key={s}
              onClick={() => {
                setSize(s);
                setError(null);
              }}
              className={cn(
                "min-w-[3.5rem] rounded-xl border px-4 py-3 text-sm font-medium transition-all",
                size === s
                  ? "border-ink bg-ink text-paper dark:border-paper dark:bg-paper dark:text-ink"
                  : "border-ink/15 hover:border-ink dark:border-paper/20 dark:hover:border-paper"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-sm text-crimson"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Quantity + Add */}
      <div className="mt-8 flex items-stretch gap-3">
        <div className="flex items-center gap-1 rounded-full border border-ink/15 p-1 dark:border-paper/20">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink/5 dark:hover:bg-paper/5"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center font-medium tabular-nums">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            aria-label="Increase quantity"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink/5 dark:hover:bg-paper/5"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Add to cart with morph micro-interaction */}
        <motion.button
          onClick={handleAdd}
          whileTap={{ scale: 0.97 }}
          className={cn(
            "relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-full px-8 text-sm font-medium uppercase tracking-wider transition-colors",
            added
              ? "bg-accent text-ink"
              : "bg-ink text-paper dark:bg-paper dark:text-ink"
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <motion.span
                key="added"
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -24, opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Check className="h-5 w-5" /> Added
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -24, opacity: 0 }}
                className="flex items-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" /> Add to Bag
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <button
          onClick={() => toggleWishlist(product.id)}
          aria-label="Toggle wishlist"
          className="flex h-14 w-14 flex-none items-center justify-center rounded-full border border-ink/15 transition-colors hover:border-ink dark:border-paper/20 dark:hover:border-paper"
        >
          <Heart className={cn("h-5 w-5", isWishlisted && "fill-crimson text-crimson")} />
        </button>
      </div>

      {/* Trust badges */}
      <div className="mt-8 grid grid-cols-3 gap-4 border-t border-ink/10 pt-6 text-center dark:border-paper/10">
        {[
          { icon: Truck, label: "Free shipping over $75" },
          { icon: RotateCcw, label: "30-day returns" },
          { icon: Shield, label: "2-year warranty" },
        ].map((b) => (
          <div key={b.label} className="flex flex-col items-center gap-2">
            <b.icon className="h-5 w-5 text-ink-muted dark:text-paper/50" />
            <span className="text-xs text-ink-muted dark:text-paper/60">{b.label}</span>
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="mt-8 border-t border-ink/10 pt-6 dark:border-paper/10">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/50">
          Overview
        </h3>
        <p className="text-pretty leading-relaxed text-ink-muted dark:text-paper/70">
          {product.description}
        </p>
      </div>
    </div>
  );
}
