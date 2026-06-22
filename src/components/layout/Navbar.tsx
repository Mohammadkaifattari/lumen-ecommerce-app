"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, User, Menu, X, Moon, Sun } from "lucide-react";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=footwear", label: "Footwear" },
  { href: "/shop?category=apparel", label: "Apparel" },
  { href: "/shop?category=accessories", label: "Accessories" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const openCart = useCart((s) => s.open);
  const setSearchOpen = useUI((s) => s.setSearchOpen);
  const theme = useUI((s) => s.theme);
  const toggleTheme = useUI((s) => s.toggleTheme);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Focus trap + Esc-close for the mobile menu.
  useFocusTrap(mobileMenuRef, mobileOpen, () => setMobileOpen(false));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close mobile menu on route change.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-premium",
          scrolled
            ? "border-b border-ink/10 bg-paper/80 backdrop-blur-xl dark:border-paper/10 dark:bg-ink/80"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <nav className="container-edge flex h-16 items-center justify-between gap-6 lg:h-20">
          {/* Left: mobile menu trigger + desktop nav */}
          <div className="flex flex-1 items-center gap-8">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
            <ul className="hidden items-center gap-8 lg:flex">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <MagneticLink href={link.href} label={link.label} />
                </li>
              ))}
            </ul>
          </div>

          {/* Center: wordmark */}
          <Link
            href="/"
            className="flex-none text-center text-xl font-bold tracking-[0.2em] lg:text-2xl"
            aria-label="LUMEN home"
          >
            LUMEN
          </Link>

          {/* Right: actions */}
          <div className="flex flex-1 items-center justify-end gap-4 sm:gap-5">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
              className="transition-transform duration-300 hover:scale-110"
            >
              <Search className="h-5 w-5" aria-hidden />
            </button>
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              className="transition-transform duration-300 hover:scale-110"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
            </button>
            <Link
              href="/account"
              aria-label="Account"
              className="hidden transition-transform duration-300 hover:scale-110 sm:block"
            >
              <User className="h-5 w-5" aria-hidden />
            </Link>
            <button
              onClick={openCart}
              aria-label={`Open cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
              className="relative transition-transform duration-300 hover:scale-110"
            >
              <ShoppingBag className="h-5 w-5" aria-hidden />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-ink"
                    aria-hidden
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            ref={mobileMenuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-paper dark:bg-ink lg:hidden"
          >
            <div className="container-edge flex h-16 items-center justify-between">
              <span className="text-xl font-bold tracking-[0.2em]">LUMEN</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-6 w-6" aria-hidden />
              </button>
            </div>
            <motion.ul
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
              }}
              className="container-edge mt-8 space-y-2"
            >
              {NAV_LINKS.concat([{ href: "/account", label: "Account" }]).map((link) => (
                <motion.li
                  key={link.href}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <Link
                    href={link.href}
                    className="block border-b border-ink/10 py-5 text-3xl font-medium tracking-tight dark:border-paper/10"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** A nav link with a subtle magnetic hover: the underline grows from center. */
function MagneticLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="group relative block py-1 text-sm font-medium">
      <span className="relative z-10 transition-colors duration-300 group-hover:text-ink-muted dark:group-hover:text-paper/60">
        {label}
      </span>
      <span className="absolute -bottom-0.5 left-1/2 h-px w-0 -translate-x-1/2 bg-current transition-all duration-500 ease-premium group-hover:w-full" />
    </Link>
  );
}
