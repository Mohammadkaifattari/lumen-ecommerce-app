"use client";

import { useRef, useEffect, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";

/**
 * Splits children into per-word spans and staggers them in on scroll.
 * Use on short headings / taglines for a cinematic text reveal. Under
 * prefers-reduced-motion words are shown in place with no stagger.
 */
export function SplitText({
  children,
  className,
  as = "h2",
  delay = 0,
}: {
  children: string;
  className?: string;
  as?: HeadingTag;
  delay?: number;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const words = el.querySelectorAll<HTMLElement>("[data-word]");

    // Reduced motion: words visible immediately, no transform or ScrollTrigger.
    if (reduce) {
      gsap.set(words, { yPercent: 0, opacity: 1 });
      return;
    }

    gsap.set(words, { yPercent: 110 });

    const ctx = gsap.context(() => {
      gsap.to(words, {
        yPercent: 0,
        duration: 1,
        ease: "power4.out",
        stagger: 0.08,
        delay,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }, el);

    return () => ctx.revert();
  }, [delay, reduce]);

  const lines = children.split("\n");

  // Render the chosen tag with a ref. React's JSX typing for a union of tags
  // produces an incompatible intersection of ref types, so we cast the element
  // to a single renderable type here.
  const Tag = as as React.ElementType;

  return (
    <Tag
      ref={ref}
      className={className}
      aria-label={children.replace(/\n/g, " ")}
    >
      {lines.map((line, li) => (
        <span key={li} className="block overflow-hidden">
          {line.split(" ").map((word, wi) => (
            <span key={wi} className="inline-block overflow-hidden align-bottom">
              <span data-word className="inline-block">{word}</span>
              {wi < line.split(" ").length - 1 && <span>&nbsp;</span>}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}

/**
 * A simpler reveal that fades + slides a whole block (used for paragraphs).
 */
export function RevealBlock({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [delay, reduce]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
