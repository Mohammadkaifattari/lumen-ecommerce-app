"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Heart, Plus } from "lucide-react";
import type { Product } from "@/types";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { Stars } from "@/components/ui/Stars";
import { cn, formatPrice } from "@/lib/utils";

// ── Tilt config ───────────────────────────────────────────
const TILT_MAX    = 12;   // degrees
const SPRING_OPTS = { stiffness: 300, damping: 30, mass: 0.5 };

export function ProductCard({
  product,
  index = 0,
  priority = false,
}: {
  product: Product;
  index?: number;
  priority?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const add          = useCart((s) => s.add);
  const wishlistHas  = useWishlist((s) => s.has);
  const toggleWishlist = useWishlist((s) => s.toggle);
  const [hovered, setHovered] = useState(false);
  const isWishlisted = wishlistHas(product.id);

  // Raw mouse values (-0.5 → 0.5)
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Sprung for smoothness
  const springX = useSpring(rawX, SPRING_OPTS);
  const springY = useSpring(rawY, SPRING_OPTS);

  // Card rotation
  const rotateY = useTransform(springX, [-0.5, 0.5], [-TILT_MAX, TILT_MAX]);
  const rotateX = useTransform(springY, [-0.5, 0.5], [ TILT_MAX, -TILT_MAX]);

  // Image parallax (moves opposite, slower)
  const imgX = useTransform(springX, [-0.5, 0.5], ["4%", "-4%"]);
  const imgY = useTransform(springY, [-0.5, 0.5], ["4%", "-4%"]);

  // Shine overlay
  const shineX = useTransform(springX, [-0.5, 0.5], ["-30%", "130%"]);
  const shineY = useTransform(springY, [-0.5, 0.5], ["-30%", "130%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set((e.clientX - rect.left) / rect.width  - 0.5);
    rawY.set((e.clientY - rect.top)  / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
    setHovered(false);
  };

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(product, {
      color:    product.colors[0].name,
      size:     product.sizes[Math.floor(product.sizes.length / 2)] ?? product.sizes[0],
      quantity: 1,
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
      style={{ perspective: 800 }}
    >
      {/* Tilt wrapper */}
      <motion.div
        ref={cardRef}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        <Link href={`/product/${product.slug}`} className="block">
          {/* Image stage */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-paper-soft dark:bg-ink-soft">
            {/* Primary image — parallax on tilt */}
            <motion.div
              className="absolute inset-0 scale-[1.08]"
              style={{ x: imgX, y: imgY }}
            >
              <Image
                src={product.images[0].src}
                alt={product.images[0].alt}
                fill
                priority={priority}
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 50vw"
                className={cn(
                  "object-cover transition-opacity duration-700 ease-premium",
                  hovered && product.images[1] ? "opacity-0" : "opacity-100"
                )}
              />
            </motion.div>

            {/* Secondary image (hover swap) */}
            {product.images[1] && (
              <motion.div
                className="absolute inset-0 scale-[1.08]"
                style={{ x: imgX, y: imgY }}
              >
                <Image
                  src={product.images[1].src}
                  alt={product.images[1].alt}
                  fill
                  loading="lazy"
                  sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 50vw"
                  className={cn(
                    "object-cover transition-opacity duration-700 ease-premium",
                    hovered ? "opacity-100" : "opacity-0"
                  )}
                />
              </motion.div>
            )}

            {/* Shine overlay */}
            {hovered && (
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-2xl"
                style={{
                  background: `radial-gradient(circle at ${shineX} ${shineY}, rgba(255,255,255,0.12) 0%, transparent 60%)`,
                }}
              />
            )}

            {/* Badges */}
            <div className="absolute left-3 top-3 flex flex-col gap-1.5">
              {product.badges?.map((b) => (
                <span
                  key={b}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm",
                    b === "Sale" || b === "Limited"
                      ? "bg-accent text-ink"
                      : "bg-ink/80 text-paper dark:bg-paper/80 dark:text-ink"
                  )}
                >
                  {b}
                </span>
              ))}
            </div>

            {/* Wishlist */}
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleWishlist(product.id);
              }}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-paper/80 text-ink backdrop-blur-sm transition-all hover:scale-110 dark:bg-ink/60 dark:text-paper"
            >
              <Heart className={cn("h-4 w-4", isWishlisted && "fill-crimson text-crimson")} />
            </button>

            {/* Quick add */}
            <motion.div
              initial={false}
              animate={{ y: hovered ? 0 : 80, opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-3 bottom-3"
            >
              <button
                onClick={quickAdd}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-paper/95 py-3 text-sm font-medium text-ink shadow-lg backdrop-blur-sm transition-colors hover:bg-paper dark:bg-ink/95 dark:text-paper dark:hover:bg-ink"
              >
                <Plus className="h-4 w-4" /> Quick Add
              </button>
            </motion.div>
          </div>

          {/* Meta */}
          <div className="mt-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-ink-muted dark:text-paper/50">
                {product.category}
              </p>
              <h3 className="mt-1 truncate font-medium">{product.name}</h3>
              <div className="mt-1 flex items-center gap-2">
                <Stars rating={product.rating} size={12} />
                <span className="text-xs text-ink-muted dark:text-paper/50">({product.reviewCount})</span>
              </div>
            </div>
            <div className="flex-none text-right">
              <p className="font-medium">{formatPrice(product.price)}</p>
              {product.compareAtPrice && (
                <p className="text-xs text-ink-muted line-through dark:text-paper/40">
                  {formatPrice(product.compareAtPrice)}
                </p>
              )}
            </div>
          </div>

          {/* Color dots */}
          <div className="mt-3 flex items-center gap-1.5">
            {product.colors.map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="h-3 w-3 rounded-full border border-ink/10 dark:border-paper/20"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </Link>
      </motion.div>
    </motion.article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-[4/5] rounded-2xl" />
      <div className="mt-4 space-y-2">
        <div className="skeleton h-3 w-1/4 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
      </div>
    </div>
  );
}