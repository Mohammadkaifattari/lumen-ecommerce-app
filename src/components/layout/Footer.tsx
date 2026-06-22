"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Demo-only: in production this would POST to a newsletter endpoint.
    setSubmitted(true);
    setEmail("");
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <footer className="border-t border-ink/10 bg-paper-soft dark:border-paper/10 dark:bg-ink-soft">
      <div className="container-edge py-16 lg:py-24">
        {/* Big newsletter callout */}
        <div className="grid gap-12 border-b border-ink/10 pb-16 dark:border-paper/10 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="eyebrow mb-4">Join the movement</p>
            <h2 className="text-display-lg font-bold tracking-tight text-balance">
              First access. <br />
              Member pricing.
            </h2>
          </div>
          <div className="flex flex-col justify-end">
            <p className="mb-6 max-w-md text-ink-muted dark:text-paper/60">
              Get early drops, athlete stories, and members-only pricing delivered to your inbox.
            </p>
            <form onSubmit={onSubmit} className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="peer w-full border-b border-ink/20 bg-transparent py-4 pr-12 text-lg outline-none transition-colors focus:border-ink dark:border-paper/20 dark:focus:border-paper"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="absolute right-0 top-1/2 -translate-y-1/2 transition-transform duration-300 hover:translate-x-1"
              >
                <ArrowRight className="h-6 w-6" />
              </button>
              <motion.span
                initial={false}
                animate={{ opacity: submitted ? 1 : 0, y: submitted ? 0 : -4 }}
                className="mt-3 block text-sm text-accent-deep dark:text-accent"
              >
                You&apos;re in. Welcome to the movement.
              </motion.span>
            </form>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <FooterCol
            title="Shop"
            links={[
              { href: "/shop", label: "All Products" },
              { href: "/shop?category=footwear", label: "Footwear" },
              { href: "/shop?category=apparel", label: "Apparel" },
              { href: "/shop?category=accessories", label: "Accessories" },
              { href: "/shop?category=equipment", label: "Equipment" },
            ]}
          />
          <FooterCol
            title="Support"
            links={[
              { href: "/account", label: "Order Tracking" },
              { href: "#", label: "Shipping & Returns" },
              { href: "#", label: "Size Guide" },
              { href: "#", label: "Contact" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { href: "#", label: "Our Story" },
              { href: "#", label: "Sustainability" },
              { href: "#", label: "Careers" },
              { href: "#", label: "Press" },
            ]}
          />
          <div>
            <h3 className="mb-4 text-sm font-medium uppercase tracking-wider">LUMEN</h3>
            <p className="text-sm text-ink-muted dark:text-paper/60">
              Engineered for the relentless. Designed in Portland, built worldwide.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-ink/10 pt-8 text-xs text-ink-muted dark:border-paper/10 dark:text-paper/50 sm:flex-row">
          <p>© {new Date().getFullYear()} LUMEN. A demo storefront.</p>
          <p>Crafted with Next.js, Tailwind, Framer Motion &amp; GSAP.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-medium uppercase tracking-wider">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-ink-muted transition-colors hover:text-ink dark:text-paper/60 dark:hover:text-paper"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
