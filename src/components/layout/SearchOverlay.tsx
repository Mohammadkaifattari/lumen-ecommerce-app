"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowUpRight } from "lucide-react";
import { useUI } from "@/store/ui";
import { getAllProducts } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { useDebounce } from "@/lib/hooks/useDebounce";

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useUI();
  const [query, setQuery] = useState("");
  const products = useMemo(() => getAllProducts(), []);
  const debouncedQuery = useDebounce(query, 300);
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus trap + Esc handled by the hook (Esc also still handled by the global
  // shortcut listener below for when the overlay isn't yet focused).
  useFocusTrap(panelRef, searchOpen, () => setSearchOpen(false));

  // Keyboard shortcut: Cmd/Ctrl+K to open, Esc to close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  const results = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return products.slice(0, 4); // show popular when empty
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [debouncedQuery, products]);

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[90] flex items-start justify-center bg-ink/50 px-4 pt-[10vh] backdrop-blur-md"
          onClick={() => setSearchOpen(false)}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-ink/10 bg-paper shadow-2xl dark:border-paper/10 dark:bg-ink"
          >
            {/* Input */}
            <div className="flex items-center gap-3 border-b border-ink/10 px-5 dark:border-paper/10">
              <Search className="h-5 w-5 text-ink-muted dark:text-paper/50" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, categories…"
                className="flex-1 bg-transparent py-5 text-lg outline-none placeholder:text-ink-muted dark:placeholder:text-paper/40"
              />
              <button
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="rounded-full p-1 hover:bg-ink/5 dark:hover:bg-paper/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto p-2">
              <p className="px-3 py-2 text-xs uppercase tracking-wider text-ink-muted dark:text-paper/50">
                {query ? "Results" : "Popular right now"}
              </p>
              <AnimatePresence mode="popLayout">
                {results.map((p) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Link
                      href={`/product/${p.slug}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-ink/5 dark:hover:bg-paper/10"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.images[0].src}
                        alt={p.name}
                        className="h-14 w-14 flex-none rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-sm text-ink-muted dark:text-paper/60">{p.tagline}</p>
                      </div>
                      <span className="text-sm font-medium">{formatPrice(p.price)}</span>
                      <ArrowUpRight className="h-4 w-4 text-ink-muted dark:text-paper/50" />
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>

              {query && results.length === 0 && (
                <div className="px-3 py-10 text-center text-ink-muted dark:text-paper/60">
                  No matches for &ldquo;{query}&rdquo;.
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
