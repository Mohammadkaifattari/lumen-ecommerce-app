"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CATEGORIES } from "@/lib/data";
import { SplitText } from "@/components/ui/SplitText";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/** Big editorial image tiles for each category, with hover zoom. */
export function CategoryShowcase() {
  return (
    <section className="container-edge py-20 lg:py-28">
      <div className="mb-12 max-w-2xl">
        <p className="eyebrow mb-3">Shop by category</p>
        <SplitText
          as="h2"
          className="text-display-lg font-bold tracking-tight"
        >
          {`Find your\nedge.`}
        </SplitText>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((cat, i) => (
          <CategoryTile key={cat.id} category={cat} index={i} />
        ))}
      </div>
    </section>
  );
}

function CategoryTile({
  category,
  index,
}: {
  category: (typeof CATEGORIES)[number];
  index: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const img = el.querySelector("[data-img]");

    // Reduced motion: render in final state, no scroll-driven effects.
    if (reduce) {
      gsap.set(el, { opacity: 1, y: 0 });
      if (img) gsap.set(img, { scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: index * 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        }
      );
      // Subtle zoom tied to scroll for life.
      gsap.fromTo(
        img,
        { scale: 1.15 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [index, reduce]);

  return (
    <Link
      ref={ref}
      href={`/shop?category=${category.id}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-paper-soft dark:bg-ink-soft"
    >
      <span data-img className="block absolute inset-0">
        <Image
          src={category.image}
          alt={category.label}
          fill
          loading="lazy"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-premium group-hover:scale-105"
        />
      </span>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 text-paper">
        <h3 className="text-2xl font-bold tracking-tight">{category.label}</h3>
        <p className="mt-1 text-sm text-paper/80">{category.description}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider opacity-80 transition-all group-hover:gap-3 group-hover:opacity-100">
          Explore →
        </span>
      </div>
    </Link>
  );
}
