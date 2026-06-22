"use client";

import { useEffect, useState } from "react";

/**
 * Reactive hook for `prefers-reduced-motion`. Returns `true` when the user has
 * requested reduced motion at the OS level. Used to conditionally disable
 * GSAP / Framer Motion animations (the CSS override alone isn't enough for
 * JS-driven animations).
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);

    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  return reduced;
}
