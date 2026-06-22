import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductConfigurator } from "@/components/product/ProductConfigurator";
import { ReviewsSection } from "@/components/product/ReviewsSection";
import { ProductRow } from "@/components/home/ProductRow";
import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";
import { getAllProducts, getProductBySlug, getRelatedProducts } from "@/lib/data";

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description.slice(0, 155),
    openGraph: {
      title: `${product.name} · LUMEN`,
      description: product.tagline,
      images: [{ url: product.images[0].src }],
    },
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  const related = getRelatedProducts(product, 4);

  // JSON-LD Product schema for rich search results.
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => i.src),
    sku: product.id,
    brand: { "@type": "Brand", name: "LUMEN" },
    category: product.category,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="pt-16 lg:pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero config + gallery */}
      <section className="container-edge py-10 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} />
          <ProductConfigurator product={product} />
        </div>
      </section>

      {/* Editorial scroll-reveal banner */}
      <section className="relative my-10 overflow-hidden bg-ink py-24 text-paper dark:bg-paper dark:text-ink lg:py-32">
        <div className="container-edge max-w-4xl text-center">
          <SplitText
            as="h2"
            className="text-display-xl font-bold leading-[0.95] tracking-tight text-balance"
          >
            {`${product.name}.\n${product.tagline}`}
          </SplitText>
          <Reveal variant="fade-up" delay={0.3}>
            <p className="mx-auto mt-8 max-w-xl text-lg text-paper/70 dark:text-ink/70">
              {product.description}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Reviews */}
      <ReviewsSection
        reviews={product.reviews ?? []}
        rating={product.rating}
        reviewCount={product.reviewCount}
      />

      {/* Related products */}
      {related.length > 0 && (
        <ProductRow eyebrow="You may also like" title="Complete the kit." products={related} />
      )}
    </div>
  );
}
