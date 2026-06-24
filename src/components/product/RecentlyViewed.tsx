"use client";

import { useEffect, useState } from "react";
import { getAllProducts } from "@/lib/data";
import { useRecentlyViewed } from "@/store/recentlyViewed";
import { ProductRow } from "@/components/home/ProductRow";

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const ids = useRecentlyViewed((s) => s.ids);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const products = getAllProducts()
    .filter((p) => ids.includes(p.id) && p.id !== excludeId)
    .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

  if (products.length === 0) return null;

  return (
    <ProductRow
      eyebrow="Your history"
      title="Recently viewed."
      products={products}
    />
  );
}