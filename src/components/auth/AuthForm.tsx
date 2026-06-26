"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Check } from "lucide-react";

type Mode = "login" | "register";

export function AuthForm({ mode: initial }: { mode: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initial);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "register") {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Registration failed.");
          setLoading(false);
          return;
        }
      } catch {
        setError("Something went wrong. Try again.");
        setLoading(false);
        return;
      }
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setDone(true);
    setTimeout(async () => {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      if ((session?.user as any)?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/account");
      }
    }, 900);
  };

  const flip = (next: Mode) => setMode(next);

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-ink dark:bg-paper p-14 relative overflow-hidden">
        {/* Animated rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-paper/10 dark:border-ink/10"
              style={{ width: `${(i + 1) * 140}px`, height: `${(i + 1) * 140}px` }}
              animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
              transition={{ duration: 25 + i * 6, repeat: Infinity, ease: "linear" }}
            />
          ))}
        </div>

        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <span className="text-2xl font-bold tracking-[0.3em] text-paper dark:text-ink">LUMEN</span>
        </motion.div>

        {/* Headline */}
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <p className="text-[3.5rem] font-bold leading-[1.1] tracking-tight text-paper dark:text-ink">
              Premium.<br />Curated.<br />Delivered.
            </p>
            <p className="mt-6 text-paper/50 dark:text-ink/50 text-sm leading-relaxed max-w-xs">
              Exclusive access to curated collections, early drops, and a checkout experience built for speed.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-14 grid grid-cols-3 gap-6 border-t border-paper/10 dark:border-ink/10 pt-8"
          >
            {[
              { value: "50K+", label: "Members" },
              { value: "200+", label: "Brands" },
              { value: "4.9★", label: "Rating" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-paper dark:text-ink">{s.value}</p>
                <p className="text-xs text-paper/40 dark:text-ink/40 mt-1 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <p className="text-xs text-paper/20 dark:text-ink/20 relative z-10">© 2025 LUMEN. All rights reserved.</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-14 lg:px-16 bg-paper dark:bg-ink overflow-y-auto">
        {/* Mobile logo */}
        <div className="mb-10 lg:hidden">
          <span className="text-2xl font-bold tracking-[0.3em]">LUMEN</span>
        </div>

        <div className="w-full max-w-[380px]">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-16 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="flex h-24 w-24 items-center justify-center rounded-full bg-accent"
                >
                  <Check className="h-12 w-12 text-ink" strokeWidth={3} />
                </motion.div>
                <p className="mt-8 text-2xl font-bold">
                  {mode === "login" ? "Welcome back." : "You're in."}
                </p>
                <p className="mt-2 text-sm text-ink-muted dark:text-paper/60">Redirecting you now…</p>
              </motion.div>
            ) : (
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Heading */}
                <div className="mb-8">
                  <h1 className="text-[2rem] font-bold tracking-tight leading-tight">
                    {mode === "login" ? "Sign in" : "Create account"}
                  </h1>
                  <p className="mt-2 text-sm text-ink-muted dark:text-paper/50">
                    {mode === "login"
                      ? "Welcome back — enter your details below."
                      : "Join LUMEN for member pricing and early access."}
                  </p>
                </div>

                {/* Google */}
                <button
                  type="button"
                  onClick={() => signIn("google")}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-ink/12 dark:border-paper/15 py-3.5 text-sm font-medium transition-all duration-200 hover:bg-ink/[0.04] dark:hover:bg-paper/[0.06] mb-5"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-ink-muted/60 dark:text-paper/30 mb-5">
                  <span className="h-px flex-1 bg-ink/8 dark:bg-paper/10" />
                  or
                  <span className="h-px flex-1 bg-ink/8 dark:bg-paper/10" />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "register" && (
                    <InputWithIcon
                      icon={User}
                      label="Full name"
                      placeholder="Alex Rivera"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  )}
                  <InputWithIcon
                    icon={Mail}
                    label="Email"
                    placeholder="you@email.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <InputWithIcon
                    icon={Lock}
                    label="Password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 bg-red-500/8 rounded-xl px-4 py-2.5"
                    >
                      {error}
                    </motion.p>
                  )}

                  {mode === "login" && (
                    <div className="flex justify-end -mt-1">
                      <button
                        type="button"
                        className="text-xs text-ink-muted dark:text-paper/50 hover:text-ink dark:hover:text-paper underline-offset-2 hover:underline transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full disabled:opacity-60 !mt-6"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Please wait…
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        {mode === "login" ? "Sign in" : "Create account"}
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </button>
                </form>

                {/* Switch mode */}
                <p className="mt-6 text-center text-sm text-ink-muted dark:text-paper/50">
                  {mode === "login" ? "New to LUMEN?" : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => flip(mode === "login" ? "register" : "login")}
                    className="font-semibold text-ink dark:text-paper underline-offset-4 hover:underline"
                  >
                    {mode === "login" ? "Create an account" : "Sign in"}
                  </button>
                </p>

                {/* Demo credentials */}
                <div className="mt-8 rounded-2xl border border-ink/8 dark:border-paper/10 p-4 bg-ink/[0.015] dark:bg-paper/[0.03]">
                  <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-ink-muted/60 dark:text-paper/30 mb-3">
                    Demo Access
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-ink/[0.03] dark:bg-paper/[0.04] p-3 space-y-1">
                      <p className="font-semibold text-ink dark:text-paper">Customer</p>
                      <p className="text-ink-muted dark:text-paper/50 font-mono text-[11px]">user@lumen.com</p>
                      <p className="text-ink-muted dark:text-paper/50 font-mono text-[11px]">password123</p>
                    </div>
                    <div className="rounded-xl bg-ink/[0.03] dark:bg-paper/[0.04] p-3 space-y-1">
                      <p className="font-semibold text-ink dark:text-paper">Admin</p>
                      <p className="text-ink-muted dark:text-paper/50 font-mono text-[11px]">admin@lumen.com</p>
                      <p className="text-ink-muted dark:text-paper/50 font-mono text-[11px]">admin123</p>
                    </div>
                  </div>
                  <p className="text-center text-[11px] text-ink-muted/60 dark:text-paper/30 mt-3">
                    Stripe test card:{" "}
                    <span className="font-mono font-semibold text-ink dark:text-paper">4242 4242 4242 4242</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function InputWithIcon({
  icon: Icon,
  label,
  ...props
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-widest text-ink-muted/70 dark:text-paper/40">
        {label}
      </span>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted/50 dark:text-paper/30" />
        <input
          {...props}
          required
          className="w-full rounded-xl border border-ink/10 dark:border-paper/15 bg-ink/[0.02] dark:bg-paper/[0.03] py-3.5 pl-11 pr-4 text-sm outline-none transition-all duration-200 focus:border-ink/40 dark:focus:border-paper/40 focus:bg-transparent placeholder:text-ink-muted/30 dark:placeholder:text-paper/20"
        />
      </div>
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}