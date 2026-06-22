"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000)); // mock delay
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <section className="bg-paper py-24 text-ink dark:bg-ink dark:text-paper">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <p className="mb-3 text-xs uppercase tracking-widest text-accent">
          Stay in the loop
        </p>
        <h2 className="mb-4 text-4xl font-black uppercase tracking-tight md:text-5xl">
          First to know.
          <br />
          Last to miss out.
        </h2>
        <p className="mb-10 text-ink/60 dark:text-paper/60">
          Drop sales, new arrivals, and member-only offers — straight to your inbox.
        </p>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 rounded-full border border-ink/20 bg-ink/5 px-6 py-4 text-ink placeholder:text-ink/40 outline-none focus:border-accent transition-colors dark:border-paper/20 dark:bg-paper/5 dark:text-paper dark:placeholder:text-paper/40"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 font-bold uppercase tracking-wide text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  "Joining…"
                ) : (
                  <>
                    Join <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 text-lg font-medium text-ink dark:text-paper"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                <Check className="h-4 w-4 text-ink" />
              </span>
              You&apos;re in! Welcome to LUMEN.
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-6 text-xs text-ink/30 dark:text-paper/30">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}