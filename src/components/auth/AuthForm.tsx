"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Check } from "lucide-react";

type Mode = "login" | "register";

/**
 * Animated auth form. Demo-only: pretends to authenticate and redirects to /account.
 * In production this would call NextAuth signIn / a register Server Action.
 */
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
    const role = (result as any)?.role;
    // Session se role lene ke liye thoda wait karo
    setTimeout(async () => {
      const { getSession } = await import('next-auth/react');
      const session = await getSession();
      if ((session?.user as any)?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    }, 900);
  };

  const flip = (next: Mode) => setMode(next);

  return (
    <div className="container-edge flex min-h-[88vh] items-center justify-center py-28">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-10 flex justify-center text-2xl font-bold tracking-[0.2em]"
        >
          LUMEN
        </Link>

        <div className="relative overflow-hidden rounded-3xl border border-ink/10 p-8 dark:border-paper/10 sm:p-10">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-accent"
                >
                  <Check className="h-8 w-8 text-ink" strokeWidth={3} />
                </motion.div>
                <p className="mt-5 text-lg font-medium">
                  {mode === "login" ? "Welcome back." : "Account created."}
                </p>
                <p className="mt-1 text-sm text-ink-muted dark:text-paper/60">
                  Taking you to your account…
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === "login" ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === "login" ? 30 : -30 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1 className="text-3xl font-bold tracking-tight">
                  {mode === "login" ? "Welcome back." : "Create your account."}
                </h1>
                <p className="mt-2 text-sm text-ink-muted dark:text-paper/60">
                  {mode === "login"
                    ? "Sign in to track orders and check out faster."
                    : "Join LUMEN for member pricing and early access."}
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
                    <p className="text-sm text-crimson">{error}</p>
                  )}

                  {mode === "login" && (
                    <div className="flex justify-end">
                      <button type="button" className="text-xs underline-offset-2 hover:underline">
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Please wait…
                      </span>
                    ) : (
                      <>
                        {mode === "login" ? "Sign in" : "Create account"}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center gap-4 text-xs text-ink-muted dark:text-paper/50">
                  <span className="h-px flex-1 bg-ink/10 dark:bg-paper/10" />
                  OR
                  <span className="h-px flex-1 bg-ink/10 dark:bg-paper/10" />
                </div>

                {/* Social */}
                <button
                  type="button"
                  onClick={() => signIn("google")}
                  className="flex w-full items-center justify-center gap-3 rounded-full border border-ink/15 py-3.5 text-sm font-medium transition-colors hover:bg-ink/5 dark:border-paper/20 dark:hover:bg-paper/5"
                >
                  <GoogleIcon /> Continue with Google
                </button>

                <p className="mt-6 text-center text-sm text-ink-muted dark:text-paper/60">
                  {mode === "login" ? "New to LUMEN?" : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => flip(mode === "login" ? "register" : "login")}
                    className="font-medium text-ink underline-offset-4 hover:underline dark:text-paper"
                  >
                    {mode === "login" ? "Create an account" : "Sign in"}
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-6 text-center text-xs text-ink-muted dark:text-paper/50">
          Demo only — no real authentication occurs.
        </p>
      </div>
    </div>
  );
}

function InputWithIcon({
  icon: Icon,
  label,
  ...props
}: { icon: React.ComponentType<{ className?: string }>; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-ink-muted dark:text-paper/50">
        {label}
      </span>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted dark:text-paper/50" />
        <input
          {...props}
          required
          className="w-full rounded-xl border border-ink/15 bg-transparent py-3.5 pl-11 pr-4 text-sm outline-none transition-colors focus:border-ink dark:border-paper/20 dark:focus:border-paper"
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
