"use client";

import Link from "next/link";
import type { Product } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/ui/Reveal";

export function ProductRow({
  eyebrow,
  title,
  products,
  ctaHref = "/shop",
  ctaLabel = "View all",
}: {
  eyebrow: string;
  title: string;
  products: Product[];
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <section className="container-edge py-20 lg:py-24">
      <Reveal className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="eyebrow mb-3">{eyebrow}</p>
          <h2 className="text-display-lg font-bold tracking-tight">{title}</h2>
        </div>
        <Link
          href={ctaHref}
          className="hidden text-sm font-medium uppercase tracking-wider underline-offset-4 hover:underline sm:block"
        >
          {ctaLabel} →
        </Link>
      </Reveal>

      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>

      <div className="mt-10 text-center sm:hidden">
        <Link href={ctaHref} className="btn-ghost">
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
