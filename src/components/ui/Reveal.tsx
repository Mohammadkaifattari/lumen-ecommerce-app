"use client";

import { useRef, useEffect, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Animation variant. */
  variant?: "fade-up" | "fade" | "scale" | "clip" | "blur";
  delay?: number;
  duration?: number;
  /** ScrollTrigger start position. */
  start?: string;
  /** Run the animation once (default) or every time it enters. */
  once?: boolean;
}

/**
 * Apple-style scroll-triggered reveal. Wraps content in a div and animates it
 * in when it scrolls into view. Under prefers-reduced-motion the content is
 * rendered in its final state with no animation.
 */
export function Reveal({
  children,
  className,
  variant = "fade-up",
  delay = 0,
  duration = 0.9,
  start = "top 85%",
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced motion: show immediately, no transforms, no ScrollTrigger.
    if (reduce) {
      gsap.set(el, { opacity: 1, y: 0, scale: 1, filter: "none", clipPath: "none" });
      return;
    }

    const fromVars: gsap.TweenVars = {
      opacity: 0,
      ease: "power3.out",
    };

    switch (variant) {
      case "fade-up":
        fromVars.y = 48;
        break;
      case "scale":
        fromVars.scale = 0.92;
        break;
      case "blur":
        fromVars.filter = "blur(16px)";
        fromVars.y = 24;
        break;
      case "clip":
        fromVars.clipPath = "inset(0 0 100% 0)";
        break;
      case "fade":
      default:
        break;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(el, fromVars, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        clipPath: "inset(0 0 0% 0)",
        duration,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions: once ? "play none none none" : "play none none reverse",
        },
      });
    }, el);

    return () => ctx.revert();
  }, [variant, delay, duration, start, once, reduce]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
