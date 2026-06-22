"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag, Check } from "lucide-react";
import { useCart } from "@/store/cart";
import { MOCK_COUPONS } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { lines, updateQuantity, remove, subtotal, clear } = useCart();
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<{ code: string; pct: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — cart is localStorage-persisted.
  useEffect(() => setMounted(true), []);

  const applyCoupon = () => {
    const match = MOCK_COUPONS.find(
      (c) => c.code === coupon.trim().toUpperCase()
    );
    if (match) {
      setApplied({ code: match.code, pct: match.discountPercentage });
      setCouponError(null);
    } else {
      setCouponError("That code isn't valid.");
      setApplied(null);
    }
  };

  const sub = mounted ? subtotal() : 0;
  const discount = applied ? Math.round((sub * applied.pct) / 100) : 0;
  const shipping = sub > 75 || sub === 0 ? 0 : 8;
  const tax = Math.round((sub - discount) * 0.08);
  const total = Math.max(0, sub - discount + shipping + tax);

  if (!mounted) {
    return <div className="container-edge h-[60vh]" />;
  }

  if (lines.length === 0) {
    return (
      <div className="container-edge flex min-h-[70vh] flex-col items-center justify-center text-center">
        <ShoppingBag className="mb-6 h-16 w-16 text-ink-muted dark:text-paper/40" />
        <h1 className="text-display-lg font-bold tracking-tight">Your bag is empty</h1>
        <p className="mt-3 max-w-sm text-ink-muted dark:text-paper/60">
          Looks like you haven&apos;t added anything yet. Let&apos;s fix that.
        </p>
        <Link href="/shop" className="btn-primary mt-8">
          Start shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-edge py-12 pt-28 lg:py-16 lg:pt-32">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="eyebrow mb-3">Checkout</p>
          <h1 className="text-display-lg font-bold tracking-tight">Your Bag</h1>
        </div>
        <button
          onClick={clear}
          className="text-sm text-ink-muted underline-offset-4 hover:underline dark:text-paper/60"
        >
          Clear all
        </button>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        {/* Lines */}
        <div>
          <AnimatePresence initial={false}>
            {lines.map((line) => (
              <motion.div
                key={`${line.productId}-${line.color}-${line.size}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-5 border-b border-ink/10 py-6 dark:border-paper/10"
              >
                <Link
                  href={`/product/${line.slug}`}
                  className="relative h-32 w-32 flex-none overflow-hidden rounded-xl bg-paper-soft dark:bg-ink-soft sm:h-40 sm:w-40"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={line.image} alt={line.name} className="h-full w-full object-cover" />
                </Link>

                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link href={`/product/${line.slug}`} className="text-lg font-medium hover:underline">
                        {line.name}
                      </Link>
                      <p className="mt-1 text-sm text-ink-muted dark:text-paper/60">
                        {line.color} · Size {line.size}
                      </p>
                    </div>
                    <button
                      onClick={() => remove(line.productId, line.color, line.size)}
                      aria-label="Remove"
                      className="h-fit text-ink-muted hover:text-crimson dark:text-paper/50"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-end justify-between pt-4">
                    <div className="flex items-center gap-2 rounded-full border border-ink/15 p-1 dark:border-paper/20">
                      <button
                        onClick={() => updateQuantity(line.productId, line.color, line.size, line.quantity - 1)}
                        aria-label="Decrease"
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-ink/5 dark:hover:bg-paper/5"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium tabular-nums">{line.quantity}</span>
                      <button
                        onClick={() => updateQuantity(line.productId, line.color, line.size, line.quantity + 1)}
                        aria-label="Increase"
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-ink/5 dark:hover:bg-paper/5"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="text-lg font-medium">{formatPrice(line.price * line.quantity)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-28 lg:h-fit">
          <div className="rounded-2xl border border-ink/10 p-6 dark:border-paper/10">
            <h2 className="mb-5 text-sm font-medium uppercase tracking-wider">Order Summary</h2>

            {/* Coupon */}
            <div className="mb-5">
              <label className="mb-2 block text-xs uppercase tracking-wider text-ink-muted dark:text-paper/50">
                Promo code
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted dark:text-paper/50" />
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="WELCOME10"
                    className="w-full rounded-full border border-ink/15 bg-transparent py-2.5 pl-9 pr-3 text-sm outline-none dark:border-paper/20"
                  />
                </div>
                <button onClick={applyCoupon} className="btn-ghost px-5 py-2.5">
                  Apply
                </button>
              </div>
              {couponError && <p className="mt-2 text-xs text-crimson">{couponError}</p>}
              <AnimatePresence>
                {applied && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 flex items-center gap-1 text-xs text-accent-deep dark:text-accent"
                  >
                    <Check className="h-3 w-3" /> {applied.code} applied — {applied.pct}% off
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <dl className="space-y-3 border-t border-ink/10 pt-5 text-sm dark:border-paper/10">
              <Row label="Subtotal" value={formatPrice(sub)} />
              {discount > 0 && (
                <Row label="Discount" value={`–${formatPrice(discount)}`} accent />
              )}
              <Row
                label="Shipping"
                value={shipping === 0 ? "Free" : formatPrice(shipping)}
              />
              <Row label="Estimated tax" value={formatPrice(tax)} />
            </dl>

            <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-5 dark:border-paper/10">
              <span className="font-medium">Total</span>
              <span className="text-2xl font-semibold">{formatPrice(total)}</span>
            </div>

            <Link href="/checkout" className="btn-primary mt-6 w-full">
              Checkout <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/shop"
              className="mt-3 block text-center text-sm text-ink-muted underline-offset-4 hover:underline dark:text-paper/60"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-muted dark:text-paper/60">{label}</dt>
      <dd className={accent ? "font-medium text-accent-deep dark:text-accent" : "font-medium"}>{value}</dd>
    </div>
  );
}
