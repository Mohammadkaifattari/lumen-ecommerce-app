"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Pinned, parallax editorial section. A big product image sticks while the
 * body text scrolls past — Apple keynote style. Parallax is disabled under
 * prefers-reduced-motion.
 */
export function Manifesto() {
  const root = useRef<HTMLElement>(null);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    // Reduced motion: skip the parallax scrub entirely.
    if (reduce) {
      gsap.set("[data-parallax-img]", { yPercent: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.to("[data-parallax-img]", {
        yPercent: -12,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, root);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <section ref={root} className="relative overflow-hidden bg-paper text-ink dark:bg-ink dark:text-paper">
      <div className="container-edge grid items-center gap-8 py-24 lg:grid-cols-2 lg:gap-16 lg:py-32">
        {/* Sticky text */}
        <div className="order-2 lg:order-1">
          <Reveal variant="fade-up">
            <p className="eyebrow mb-4 text-ink dark:text-accent">The LUMEN Standard</p>
            <h2 className="text-display-xl font-bold leading-[0.9] tracking-tight text-balance text-ink dark:text-paper">
              No detail is small enough to ignore.
            </h2>
          </Reveal>
          <Reveal variant="fade-up" delay={0.15}>
            <p className="mt-8 max-w-md text-lg text-ink/70 dark:text-paper/70 text-pretty">
              Every product is lab-tested for 10,000 hours before it touches a shelf.
              From the carbon-plate geometry of our runners to the gusset placement on
              our tees — if it doesn&apos;t perform, it doesn&apos;t ship.
            </p>
          </Reveal>
          <Reveal variant="fade-up" delay={0.3}>
            <Link
              href="/shop"
              className="mt-10 inline-flex items-center gap-3 border-b border-ink/30 pb-2 text-sm font-medium uppercase tracking-wider transition-colors hover:border-ink text-ink dark:border-paper/30 dark:hover:border-paper dark:text-paper"
            >
              Explore the collection
              <span aria-hidden>→</span>
            </Link>
          </Reveal>
        </div>

        {/* Parallax image */}
        <div className="relative order-1 aspect-[4/5] overflow-hidden rounded-3xl lg:order-2">
          <span data-parallax-img className="block h-[120%] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1781863074774-9438be5a49a0?auto=format&fit=crop&w=1600&q=80"
              alt="Athlete training in LUMEN gear"
              className="h-full w-full object-cover"
            />
          </span>
        </div>
      </div>
    </section>
  );
}
