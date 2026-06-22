"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

type CursorVariant = "default" | "hover" | "click" | "drag";

const SPRING_DOT  = { stiffness: 600, damping: 28, mass: 0.4 };
const SPRING_RING = { stiffness: 120, damping: 20, mass: 0.6 };

export function CustomCursor() {
  const reduced = usePrefersReducedMotion();
  const [variant, setVariant] = useState<CursorVariant>("default");
  const [visible, setVisible]  = useState(false);

  // Raw mouse position
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Dot follows instantly
  const dotX = useSpring(mouseX, SPRING_DOT);
  const dotY = useSpring(mouseY, SPRING_DOT);

  // Ring lags behind
  const ringX = useSpring(mouseX, SPRING_RING);
  const ringY = useSpring(mouseY, SPRING_RING);

  useEffect(() => {
    if (reduced) return;

    const onMove = (e: MouseEvent) => {
      if (!visible) {
        mouseX.jump(e.clientX);
        mouseY.jump(e.clientY);
        setVisible(true);
      } else {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      }
    };

    const onLeave  = () => setVisible(false);
    const onEnter  = () => setVisible(true);
    const onDown   = () => setVariant("click");
    const onUp     = () => setVariant("default");

    // Detect interactive elements
    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const interactive = el.closest("a, button, [role='button'], input, textarea, select, label[for], [data-cursor='hover']");
      const draggable   = el.closest("[data-cursor='drag']");
      if (draggable)   setVariant("drag");
      else if (interactive) setVariant("hover");
      else             setVariant("default");
    };

    document.addEventListener("mousemove",  onMove);
    document.addEventListener("mouseover",  onOver);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mousedown",  onDown);
    window.addEventListener("mouseup",      onUp);
    window.addEventListener("blur",         onUp);

    return () => {
      document.removeEventListener("mousemove",  onMove);
      document.removeEventListener("mouseover",  onOver);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mousedown",  onDown);
      window.removeEventListener("mouseup",      onUp);
      window.removeEventListener("blur",         onUp);
    };
  }, [reduced, visible, mouseX, mouseY]);

  // Hide on touch / reduced motion
  if (reduced) return null;

  const isHover = variant === "hover";
  const isClick = variant === "click";
  const isDrag  = variant === "drag";

  return (
    <>
      {/* Dot — snappy, always centered on cursor */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9999] mix-blend-difference"
        style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          opacity: visible ? 1 : 0,
          scale:   isClick ? 0.5 : isHover ? 0 : 1,
        }}
        transition={{ duration: 0.15 }}
      >
        <div className="h-2 w-2 rounded-full bg-white" />
      </motion.div>

      {/* Ring — lags, scales on hover */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9999] mix-blend-difference"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          opacity: visible ? 1 : 0,
          scale:   isClick ? 0.7 : isHover ? 2.2 : isDrag ? 1.5 : 1,
          rotate:  isDrag ? 45 : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        <div
          className={`rounded-full border transition-colors duration-200 ${
            isHover
              ? "h-8 w-8 border-accent bg-accent/10"
              : "h-8 w-8 border-white"
          }`}
        />
        {/* "drag" la
        bel inside ring */}
        {isDrag && (
          <span className="absolute inset-0 flex items-center justify-center text-[7px] font-semibold uppercase tracking-widest text-paper dark:text-ink">
            drag
          </span>
        )}
      </motion.div>
    </>
  );
}