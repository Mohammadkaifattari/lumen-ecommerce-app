"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Search } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();

  // Framer Motion scroll parallax
  const { scrollYProgress } = useScroll({
    target: root,
    offset: ["start start", "end start"],
  });

  const imgScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 1.4]);
  const imgY     = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 120]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.3, 0.75]);

  useEffect(() => {
    if (reduce) {
      gsap.set("[data-hero-line] > span, [data-hero-fade]", {
        opacity: 1, y: 0, yPercent: 0,
      });
      return;
    }

    const ctx = gsap.context(() => {
      // Staggered headline words slam in from below
      gsap.from("[data-hero-line] > span", {
        yPercent: 120,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.12,
        delay: 0.2,
      });

      // Sub-copy + buttons fade up
      gsap.from("[data-hero-fade]", {
        opacity: 0,
        y: 24,
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.9,
      });

      // Content fades + moves up as user scrolls away
      gsap.to(content.current, {
        opacity: 0,
        yPercent: -15,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "60% top",
          scrub: true,
        },
      });
    }, root);

    return () => ctx.revert();
  }, [reduce]);

  return (
    <section ref={root} className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">

      {/* Parallax background — Framer Motion handles scale + Y */}
      <motion.div
        ref={bg}
        style={{ scale: imgScale, y: imgY }}
        className="absolute inset-0 -z-10"
      >
        <Image
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2400&q=80"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark overlay deepens on scroll */}
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 bg-ink"
        />
      </motion.div>

      {/* Content */}
      <div
        ref={content}
        className="container-edge flex h-full flex-col justify-center lg:justify-end pb-12 lg:pb-28 pt-32 text-paper"
      >
        <p data-hero-fade className="eyebrow mb-5 text-xs lg:text-base text-paper/70">
          The 2026 Collection
        </p>

        <h1 className="font-bold leading-[0.85] tracking-tight text-[clamp(3rem,8vw,8rem)]">
          <span data-hero-line className="block overflow-hidden">
            <span className="inline-block">CRAFTED</span>
          </span>
          <span data-hero-line className="block overflow-hidden">
            <span className="inline-block">WITH</span>
          </span>
          <span data-hero-line className="block overflow-hidden text-accent">
            <span className="inline-block">PURPOSE.</span>
          </span>
        </h1>

        {/* Mobile-only Search Bar */}
        <div data-hero-fade className="mt-8 flex lg:hidden items-center w-full max-w-sm rounded-full bg-white/10 p-1 backdrop-blur-md border border-white/20">
          <div className="pl-4 pr-2">
            <Search className="h-4 w-4 text-paper/70" />
          </div>
          <input 
            type="text" 
            placeholder="Search collection..." 
            className="w-full bg-transparent text-paper placeholder:text-paper/50 focus:outline-none text-sm"
          />
          <button className="bg-accent text-ink px-4 py-2 rounded-full text-sm font-semibold hover:bg-accent/90 transition-colors">
            Go
          </button>
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href="/shop"
            data-hero-fade
            className="btn-primary flex items-center justify-center gap-2 bg-paper text-ink dark:bg-ink dark:text-paper"
          >
            Shop the Collection
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/product/aether-flight-1"
            data-hero-fade
            className="text-sm font-medium uppercase tracking-wider text-paper/80 underline-offset-4 hover:underline text-center sm:text-left"
          >
            Explore the Range
          </Link>
        </div>
      </div>

      {/* Scroll cue */}
      {!reduce && (
        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-paper/60 lg:flex">
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <span className="h-10 w-px bg-paper/40">
            <motion.span
              animate={{ y: [0, 32, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="block h-3 w-px bg-paper"
            />
          </span>
        </div>
      )}
    </section>
  );
}