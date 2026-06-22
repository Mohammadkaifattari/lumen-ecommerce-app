"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartLine, Product } from "@/types";

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  lastAddedAt: number;
  /** Add a product variant to the cart (merges on product+color+size). */
  add: (product: Product, opts: { color: string; size: string; quantity?: number }) => void;
  remove: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  /** Derived helpers */
  count: () => number;
  subtotal: () => number;
}

const sameLine = (l: CartLine, productId: string, color: string, size: string) =>
  l.productId === productId && l.color === color && l.size === size;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      lastAddedAt: 0,

      add: (product, { color, size, quantity = 1 }) => {
        const existing = get().lines.find((l) => sameLine(l, product.id, color, size));
        if (existing) {
          set({
            lines: get().lines.map((l) =>
              sameLine(l, product.id, color, size)
                ? { ...l, quantity: l.quantity + quantity }
                : l
            ),
            isOpen: true,
            lastAddedAt: Date.now(),
          });
        } else {
          const line: CartLine = {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.images[0]?.src ?? "",
            price: product.price,
            color,
            size,
            quantity,
          };
          set({ lines: [...get().lines, line], isOpen: true, lastAddedAt: Date.now() });
        }
      },

      remove: (productId, color, size) =>
        set({
          lines: get().lines.filter((l) => !sameLine(l, productId, color, size)),
        }),

      updateQuantity: (productId, color, size, quantity) =>
        set({
          lines: get()
            .lines.map((l) =>
              sameLine(l, productId, color, size)
                ? { ...l, quantity: Math.max(0, quantity) }
                : l
            )
            .filter((l) => l.quantity > 0),
        }),

      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set({ isOpen: !get().isOpen }),

      count: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotal: () => get().lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    }),
    {
      name: "lumen-cart",
      storage: createJSONStorage(() => localStorage),
      // Only persist the actual cart contents, not transient UI state.
      partialize: (state) => ({ lines: state.lines }) as CartState,
    }
  )
);
