"use client";

/**
 * LUMEN Admin — shared design system.
 */
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/* ----------------------------------------------------------------------------
 * Tokens
 * ------------------------------------------------------------------------- */
export const COLORS = {
  bg: "#0a0a0a", // app background
  sidebar: "#0a0a0a", // sidebar
  card: "#111111", // cards / panels
  cardHover: "#1a1a1a", // nested hover surface
  field: "#111111", // input background
  line: "rgba(255,255,255,0.08)", // default border
  lineStrong: "rgba(255,255,255,0.14)",
  text: "#ffffff", // primary text
  textMid: "rgba(255,255,255,0.6)", // secondary
  textLow: "rgba(255,255,255,0.4)", // tertiary / labels
  muted: "rgba(255,255,255,0.3)", // very low emphasis
  accent: "#d4ff3f", // volt lime
  accentSoft: "rgba(212,255,63,0.14)",
  danger: "#ef4444",
  success: "#22c55e",
  info: "#3b82f6",
  warning: "#eab308",
};

export const RADIUS = { sm: 8, md: 12, lg: 16, xl: 20 };
export const SPACE = { 1: 8, 2: 16, 3: 24, 4: 32 } as const;

/** Single source of truth for order statuses — matches the Order model enum. */
export const STATUS: Record<string, string> = {
  Processing: COLORS.info,
  Shipped: COLORS.warning,
  Delivered: COLORS.success,
  Cancelled: COLORS.danger,
};

/* ----------------------------------------------------------------------------
 * Motion variants
 * ------------------------------------------------------------------------- */
export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export const rowFade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

export const pageFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/* ----------------------------------------------------------------------------
 * Primitives
 * ------------------------------------------------------------------------- */

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: SPACE[2], marginBottom: SPACE[3] }}>
      <div>
        {eyebrow && (
          <div style={eyebrowStyle}>{eyebrow}</div>
        )}
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0, letterSpacing: "-0.02em", color: COLORS.text }}>
          {title}
        </h1>
        {subtitle && <div style={{ fontSize: "0.85rem", color: COLORS.textMid, marginTop: 4 }}>{subtitle}</div>}
      </div>
      {actions && <div style={{ display: "flex", gap: SPACE[1] }}>{actions}</div>}
    </div>
  );
}

export function Card({
  children,
  style,
  accent = false,
  hover = true,
}: {
  children: ReactNode;
  style?: CSSProperties;
  accent?: boolean;
  hover?: boolean;
}) {
  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${accent ? "rgba(212,255,63,0.25)" : COLORS.line}`,
        borderRadius: RADIUS.md,
        padding: SPACE[3],
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        ...(hover
          ? { ["--tw-hover-border" as never]: COLORS.accent }
          : {}),
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!hover) return;
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = `${COLORS.accent}55`;
        e.currentTarget.style.boxShadow = `0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px ${COLORS.accent}22, 0 8px 30px rgba(212,255,63,0.06)`;
      }}
      onMouseLeave={(e) => {
        if (!hover) return;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = accent ? "rgba(212,255,63,0.25)" : COLORS.line;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {accent && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: COLORS.accent }} />}
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: boolean;
}) {
  return (
    <motion.div variants={fadeUp}>
      <Card accent={accent}>
        <div style={{ fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.textLow, marginBottom: SPACE[1] }}>
          {label}
        </div>
        <div
          style={{
            fontSize: "1.6rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: accent ? COLORS.accent : COLORS.text,
            marginBottom: 4,
          }}
        >
          {value}
        </div>
        {sub && <div style={{ fontSize: "0.72rem", color: COLORS.textLow }}>{sub}</div>}
      </Card>
    </motion.div>
  );
}

export function SectionLabel({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ marginBottom: SPACE[2] }}>
      <div style={{ fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.textLow, marginBottom: 4 }}>
        {eyebrow}
      </div>
      <div style={{ fontSize: "1rem", fontWeight: 600, color: COLORS.text }}>{title}</div>
    </div>
  );
}

export function Badge({ status }: { status: string }) {
  const color = STATUS[status] ?? COLORS.textMid;
  return (
    <span
      style={{
        fontSize: "0.7rem",
        fontWeight: 600,
        color,
        border: `1px solid ${color}33`,
        background: `${color}14`,
        borderRadius: 6,
        padding: "0.2rem 0.5rem",
        display: "inline-block",
        width: "fit-content",
      }}
    >
      {status}
    </span>
  );
}

export function Btn({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
  style?: CSSProperties;
}) {
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 18px",
    borderRadius: RADIUS.md,
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none",
    opacity: disabled ? 0.6 : 1,
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  };
  const variants: Record<string, CSSProperties> = {
    primary: { background: COLORS.accent, color: "#0a0a0a" },
    ghost: { background: "transparent", color: COLORS.text, border: `1px solid ${COLORS.lineStrong}` },
    danger: { background: "transparent", color: COLORS.danger, border: `1px solid ${COLORS.danger}55` },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

export function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  style?: CSSProperties;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "10px 14px",
        borderRadius: RADIUS.sm,
        background: COLORS.field,
        border: `1px solid ${COLORS.line}`,
        color: COLORS.text,
        fontSize: "0.85rem",
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.2s ease",
        ...style,
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = COLORS.accent)}
      onBlur={(e) => (e.currentTarget.style.borderColor = COLORS.line)}
    />
  );
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "10px 14px",
        borderRadius: RADIUS.sm,
        background: COLORS.field,
        border: `1px solid ${COLORS.line}`,
        color: COLORS.text,
        fontSize: "0.85rem",
        outline: "none",
        resize: "vertical",
        boxSizing: "border-box",
        fontFamily: "inherit",
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = COLORS.accent)}
      onBlur={(e) => (e.currentTarget.style.borderColor = COLORS.line)}
    />
  );
}

export function Select({
  value,
  onChange,
  options,
  colorMap,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  colorMap?: Record<string, string>;
}) {
  const color = colorMap?.[value];
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: COLORS.card,
        color: color ?? COLORS.text,
        border: `1px solid ${color ?? COLORS.lineStrong}55`,
        borderRadius: 6,
        padding: "0.35rem 0.75rem",
        fontSize: "0.78rem",
        cursor: "pointer",
        outline: "none",
      }}
    >
      {options.map((opt) => (
        <option key={opt} value={opt} style={{ color: colorMap?.[opt] ?? COLORS.text, background: COLORS.card }}>
          {opt}
        </option>
      ))}
    </select>
  );
}

export function Table({
  columns,
  children,
}: {
  columns: string[];
  children: ReactNode;
}) {
  return (
    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.lg, overflow: "hidden", width: "100%", overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${COLORS.line}`, background: COLORS.bg }}>
            {columns.map((h) => (
              <th
                key={h}
                style={{
                  padding: "16px 20px",
                  textAlign: "left",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: COLORS.textLow,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <motion.tbody variants={staggerContainer} initial="hidden" animate="show">
          {children}
        </motion.tbody>
      </table>
    </div>
  );
}

export function TableRow({ children, index = 0 }: { children: ReactNode; index?: number }) {
  const isEven = index % 2 === 0;
  return (
    <motion.tr
      variants={rowFade}
      style={{ 
        borderBottom: `1px solid ${COLORS.line}`,
        background: isEven ? COLORS.card : COLORS.bg,
        transition: "background 0.2s"
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = `${COLORS.accent}11`)}
      onMouseLeave={(e) => (e.currentTarget.style.background = isEven ? COLORS.card : COLORS.bg)}
    >
      {children}
    </motion.tr>
  );
}

export function Td({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <td style={{ padding: "16px 20px", fontSize: "0.85rem", color: COLORS.text, ...style }}>{children}</td>;
}

export function EmptyState({ icon, title, message }: { icon?: ReactNode; title: string; message?: string }) {
  return (
    <div style={{ textAlign: "center", padding: SPACE[4], color: COLORS.textMid, background: COLORS.card, borderRadius: RADIUS.lg, border: `1px solid ${COLORS.line}` }}>
      {icon && <div style={{ marginBottom: SPACE[2], opacity: 0.4, display: "flex", justifyContent: "center" }}>{icon}</div>}
      <div style={{ fontSize: "1rem", fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>{title}</div>
      {message && <div style={{ fontSize: "0.85rem" }}>{message}</div>}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  width = 520,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const modalContent = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            style={{
              position: "fixed",
              left: "50%",
              top: "50%",
              zIndex: 101,
              transform: "translate(-50%, -50%)",
              background: COLORS.card,
              border: `1px solid ${COLORS.lineStrong}`,
              borderRadius: RADIUS.xl,
              padding: SPACE[4],
              width: "92vw",
              maxWidth: width,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 30px 80px rgba(0,0,0,0.8)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE[3] }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, color: COLORS.text }}>{title}</h2>
              <button
                onClick={onClose}
                aria-label="Close"
                tabIndex={-1}
                style={{ background: "none", border: "none", color: COLORS.textMid, cursor: "pointer", padding: 4 }}
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}

const eyebrowStyle: CSSProperties = {
  fontSize: "0.65rem",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: COLORS.muted,
  marginBottom: 6,
};
