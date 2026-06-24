"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const SIZE_TABLE = [
  { size: "XS / 28", chest: "34-36", waist: "28-30", hip: "34-36" },
  { size: "S / 30", chest: "36-38", waist: "30-32", hip: "36-38" },
  { size: "M / 32", chest: "38-40", waist: "32-34", hip: "38-40" },
  { size: "L / 34", chest: "40-42", waist: "34-36", hip: "40-42" },
  { size: "XL / 36", chest: "42-44", waist: "36-38", hip: "42-44" },
  { size: "XXL", chest: "44-46", waist: "38-40", hip: "44-46" },
];

export function SizeGuideModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-ink/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Size guide"
            className="fixed left-1/2 top-1/2 z-[101] w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-paper p-6 text-ink shadow-2xl dark:bg-ink dark:text-paper sm:p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold uppercase tracking-tight">Size Guide</h2>
              <button
                onClick={onClose}
                aria-label="Close size guide"
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-ink/5 dark:hover:bg-paper/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-ink/10 dark:border-paper/15">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-ink/10 bg-ink/5 dark:border-paper/15 dark:bg-paper/5">
                    <th className="px-3 py-3 font-medium uppercase tracking-wide text-xs">Size</th>
                    <th className="px-3 py-3 font-medium uppercase tracking-wide text-xs">Chest (in)</th>
                    <th className="px-3 py-3 font-medium uppercase tracking-wide text-xs">Waist (in)</th>
                    <th className="px-3 py-3 font-medium uppercase tracking-wide text-xs">Hip (in)</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_TABLE.map((row, i) => (
                    <tr
                      key={row.size}
                      className={i % 2 === 0 ? "" : "bg-ink/[0.02] dark:bg-paper/[0.03]"}
                    >
                      <td className="px-3 py-3 font-medium">{row.size}</td>
                      <td className="px-3 py-3 text-ink-muted dark:text-paper/60">{row.chest}</td>
                      <td className="px-3 py-3 text-ink-muted dark:text-paper/60">{row.waist}</td>
                      <td className="px-3 py-3 text-ink-muted dark:text-paper/60">{row.hip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-5 text-xs text-ink-muted dark:text-paper/50">
              Measurements are approximate. For footwear, refer to the size selector — true to standard US sizing.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}