"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";

export function CartDrawer() {
  const { isOpen, close, lines, updateQuantity, remove, subtotal } = useCart();
  const panelRef = useRef<HTMLElement>(null);

  // Esc-to-close + focus cycling inside the drawer.
  useFocusTrap(panelRef, isOpen, close);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={close}
            className="fixed inset-0 z-[70] bg-ink/40 backdrop-blur-sm"
            aria-hidden
          />

          {/* Panel */}
          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-[80] flex h-full w-full max-w-md flex-col bg-paper shadow-2xl dark:bg-ink"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5 dark:border-paper/10">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" aria-hidden />
                <h2 className="text-sm font-medium uppercase tracking-wider">
                  Your Bag ({lines.reduce((n, l) => n + l.quantity, 0)})
                </h2>
              </div>
              <button onClick={close} aria-label="Close cart" className="hover:scale-110 transition-transform">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            {/* Lines */}
            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <ShoppingBag className="h-12 w-12 text-ink-muted dark:text-paper/40" aria-hidden />
                <p className="text-lg font-medium">Your bag is empty</p>
                <p className="text-sm text-ink-muted dark:text-paper/60">
                  Let&apos;s find something worth chasing.
                </p>
                <Link href="/shop" onClick={close} className="btn-primary mt-2">
                  Shop Now
                </Link>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <AnimatePresence initial={false}>
                  {lines.map((line) => (
                    <motion.div
                      key={`${line.productId}-${line.color}-${line.size}`}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="flex gap-4 border-b border-ink/10 py-5 dark:border-paper/10"
                    >
                      <Link
                        href={`/product/${line.slug}`}
                        onClick={close}
                        className="relative h-24 w-24 flex-none overflow-hidden rounded-lg bg-paper-soft dark:bg-ink-soft"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={line.image}
                          alt={line.name}
                          className="h-full w-full object-cover"
                        />
                      </Link>

                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-2">
                          <Link
                            href={`/product/${line.slug}`}
                            onClick={close}
                            className="font-medium leading-tight hover:underline"
                          >
                            {line.name}
                          </Link>
                          <button
                            onClick={() => remove(line.productId, line.color, line.size)}
                            aria-label={`Remove ${line.name} from cart`}
                            className="text-ink-muted hover:text-ink dark:text-paper/50 dark:hover:text-paper"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-ink-muted dark:text-paper/60">
                          {line.color} · Size {line.size}
                        </p>

                        <div className="mt-auto flex items-center justify-between pt-3">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                updateQuantity(line.productId, line.color, line.size, line.quantity - 1)
                              }
                              aria-label={`Decrease ${line.name} quantity`}
                              className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/15 transition-colors hover:bg-ink hover:text-paper dark:border-paper/20"
                            >
                              <Minus className="h-3 w-3" aria-hidden />
                            </button>
                            <span className="w-5 text-center text-sm font-medium" aria-live="polite">
                              {line.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(line.productId, line.color, line.size, line.quantity + 1)
                              }
                              aria-label={`Increase ${line.name} quantity`}
                              className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/15 transition-colors hover:bg-ink hover:text-paper dark:border-paper/20"
                            >
                              <Plus className="h-3 w-3" aria-hidden />
                            </button>
                          </div>
                          <span className="font-medium">{formatPrice(line.price * line.quantity)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Footer */}
            {lines.length > 0 && (
              <div className="border-t border-ink/10 px-6 py-5 dark:border-paper/10">
                <div className="mb-4 flex items-center justify-between text-sm">
                  <span className="text-ink-muted dark:text-paper/60">Subtotal</span>
                  <span className="text-lg font-medium">{formatPrice(subtotal())}</span>
                </div>
                <p className="mb-4 text-xs text-ink-muted dark:text-paper/50">
                  Shipping &amp; taxes calculated at checkout.
                </p>
                <Link href="/checkout" onClick={close} className="btn-primary w-full">
                  Checkout
                </Link>
                <button
                  onClick={close}
                  className="mt-3 w-full text-center text-sm text-ink-muted underline-offset-4 hover:underline dark:text-paper/60"
                >
                  Continue shopping
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
