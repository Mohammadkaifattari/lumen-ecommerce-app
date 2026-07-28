import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/ui/Marquee";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { Manifesto } from "@/components/home/Manifesto";
import { ProductRow } from "@/components/home/ProductRow";
import { Newsletter } from "@/components/home/Newsletter";
import { getFeaturedProducts, getNewArrivals, getBestSellers } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await getFeaturedProducts();
  const newArrivals = await getNewArrivals(4);
  const bestSellers = await getBestSellers(4);

  return (
    <>
      <Hero />

      <Marquee
        items={[
          "Free shipping over $75",
          "30-day returns",
          "Members get 10% off",
          "Carbon-neutral delivery",
          "Engineered in Portland",
        ]}
      />

      <FeaturedCarousel products={featured} />

      <CategoryShowcase />

      <ProductRow
        eyebrow="Just landed"
        title="New Arrivals."
        products={newArrivals}
      />

      <Manifesto />

      <Newsletter />

      <ProductRow
        eyebrow="Fan favorites"
        title="Best Sellers."
        products={bestSellers}
      />
    </>
  );
}
