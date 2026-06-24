"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, Check, ArrowUpDown } from "lucide-react";
import type { Category, Product } from "@/types";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { cn, formatPrice } from "@/lib/utils";

type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const CATEGORIES: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "footwear", label: "Footwear" },
  { id: "apparel", label: "Apparel" },
  { id: "accessories", label: "Accessories" },
  { id: "equipment", label: "Equipment" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "7", "8", "9", "9.5", "10", "10.5", "11", "12", "13", "28", "30", "32", "34", "36"];

export function ShopBrowser({ products }: { products: Product[] }) {
  const params = useSearchParams();
  const router = useRouter();

  const initialCategory = (params.get("category") as Category | "all") ?? "all";
  const [category, setCategory] = useState<Category | "all">(initialCategory);
  const [sort, setSort] = useState<SortKey>("featured");
  const [maxPrice, setMaxPrice] = useState<number>(600);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Sync category when the URL changes (e.g. navbar links).
  useEffect(() => {
    setCategory((params.get("category") as Category | "all") ?? "all");
  }, [params]);

  // Fake skeleton on first paint + whenever filters change (feels responsive).
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, [category, sort, maxPrice, selectedColors]);

  const allColors = useMemo(() => {
    const set = new Map<string, string>();
    products.forEach((p) => p.colors.forEach((c) => set.set(c.name, c.hex)));
    return Array.from(set, ([name, hex]) => ({ name, hex }));
  }, [products]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (p.price > maxPrice) return false;
      if (selectedColors.length && !p.colors.some((c) => selectedColors.includes(c.name)))
        return false;
      if (selectedSizes.length && !p.sizes.some((s) => selectedSizes.includes(s)))
        return false;
      return true;
    });

    list = [...list];
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        break;
      case "featured":
      default:
        list.sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false));
        break;
    }
    return list;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, category, sort, maxPrice, selectedColors]);

  const setCategoryParam = (c: Category | "all") => {
    setCategory(c);
    const next = new URLSearchParams(params.toString());
    if (c === "all") next.delete("category");
    else next.set("category", c);
    router.replace(`/shop${next.toString() ? `?${next}` : ""}`, { scroll: false });
  };

  const toggleColor = (name: string) =>
    setSelectedColors((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );

  const toggleSize = (size: string) =>
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );

  const activeCount =
    (category !== "all" ? 1 : 0) +
    (maxPrice < 600 ? 1 : 0) +
    selectedColors.length +
    selectedSizes.length;

  const clearAll = () => {
    setCategory("all");
    setMaxPrice(600);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSort("featured");
    router.replace("/shop", { scroll: false });
  };

  const Filters = (
    <div className="space-y-8">
      {/* Category */}
      <div>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/50">
          Category
        </h3>
        <ul className="space-y-1">
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setCategoryParam(c.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                  category === c.id
                    ? "bg-ink text-paper dark:bg-ink dark:text-paper"
                    : "hover:bg-ink/5 dark:hover:bg-paper/5"
                )}
              >
                {c.label}
                <span className="text-xs opacity-60">
                  {c.id === "all"
                    ? products.length
                    : products.filter((p) => p.category === c.id).length}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price */}
      <div>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/50">
          Max Price
        </h3>
        <input
          type="range"
          min={40}
          max={600}
          step={10}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-accent"
        />
        <div className="mt-2 flex justify-between text-xs">
          <span>$40</span>
          <span className="font-medium">{formatPrice(maxPrice)}</span>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/50">
          Size
        </h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => {
            const active = selectedSizes.includes(size);
            return (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                aria-pressed={active}
                className={cn(
                  "flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-xs font-medium transition-colors",
                  active
                    ? "border-ink bg-ink text-paper dark:border-paper dark:bg-paper dark:text-ink"
                    : "border-ink/15 hover:border-ink/40 dark:border-paper/20 dark:hover:border-paper/40"
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-muted dark:text-paper/50">
          Color
        </h3>
        <div className="flex flex-wrap gap-2">
          {allColors.map((c) => {
            const active = selectedColors.includes(c.name);
            return (
              <button
                key={c.name}
                onClick={() => toggleColor(c.name)}
                title={c.name}
                aria-pressed={active}
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-full border transition-all",
                  active
                    ? "border-ink ring-2 ring-ink/20 dark:border-paper dark:ring-paper/20"
                    : "border-ink/15 dark:border-paper/20"
                )}
                style={{ backgroundColor: c.hex }}
              >
                {active && (
                  <Check
                    className="h-4 w-4"
                    style={{ color: ["#f1f1f0", "#d4ff3f", "#d8c4a8"].includes(c.hex) ? "#0a0a0a" : "#fff" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {activeCount > 0 && (
        <button
          onClick={clearAll}
          className="text-xs font-medium uppercase tracking-wider text-ink-muted underline-offset-4 hover:underline dark:text-paper/60"
        >
          Clear all ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="container-edge py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 border-b border-ink/10 pb-8 dark:border-paper/10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow mb-3">The collection</p>
          <h1 className="text-display-lg font-bold tracking-tight">
            {category === "all" ? "All Products" : CATEGORIES.find((c) => c.id === category)?.label}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2.5 text-sm font-medium lg:hidden dark:border-paper/20"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-ink">
                {activeCount}
              </span>
            )}
          </button>
          <div className="relative flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-ink-muted dark:text-paper/50" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="appearance-none rounded-full border border-ink/15 bg-paper text-ink py-2.5 pl-3 pr-8 text-sm font-medium outline-none dark:border-paper/20 dark:bg-ink dark:text-paper"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-12">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 flex-none lg:block">
          <div className="sticky top-28">{Filters}</div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          <p className="mb-6 text-sm text-ink-muted dark:text-paper/60">
            {loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "product" : "products"}`}
          </p>

          <motion.div
            layout
            className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <motion.div key={`sk-${i}`} exit={{ opacity: 0 }}>
                      <ProductCardSkeleton />
                    </motion.div>
                  ))
                : filtered.map((p, i) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
                    >
                      <ProductCard product={p} index={i} />
                    </motion.div>
                  ))}
            </AnimatePresence>
          </motion.div>

          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
              <p className="text-xl font-medium">No matches found</p>
              <p className="text-sm text-ink-muted dark:text-paper/60">
                Try widening your filters.
              </p>
              <button onClick={clearAll} className="btn-ghost mt-2">
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[70] bg-ink/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-0 top-0 z-[80] h-full w-[85%] max-w-sm overflow-y-auto bg-paper p-6 shadow-2xl dark:bg-ink lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-sm font-medium uppercase tracking-wider">Filters</h2>
                <button onClick={() => setDrawerOpen(false)} aria-label="Close filters">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {Filters}
              <button
                onClick={() => setDrawerOpen(false)}
                className="btn-primary mt-8 w-full"
              >
                Show {filtered.length} results
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
