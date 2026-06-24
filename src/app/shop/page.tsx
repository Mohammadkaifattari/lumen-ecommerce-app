import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopBrowser } from "@/components/shop/ShopBrowser";
import { getAllProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse the full LUMEN collection — footwear, apparel, accessories, and equipment.",
};

// SearchParams must be read in a Client component, so we wrap with Suspense.
export default async function ShopPage() {
  const products = await getAllProducts();

  return (
    <div className="pt-16 lg:pt-20">
      <Suspense fallback={<ShopFallback />}>
        <ShopBrowser products={products} />
      </Suspense>
    </div>
  );
}

function ShopFallback() {
  return (
    <div className="container-edge py-24">
      <div className="skeleton mb-8 h-16 w-64 rounded" />
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton aspect-[4/5] rounded-2xl" />
            <div className="skeleton mt-4 h-4 w-3/4 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
