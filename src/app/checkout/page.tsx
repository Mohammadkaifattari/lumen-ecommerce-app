"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CreditCard, Truck, Lock, ShoppingBag, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
// PaymentElement removed — using individual card elements
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import {
  shippingSchema, ShippingData,
  paymentSchema,  PaymentData,
} from "@/lib/validation";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type Step = 0 | 1 | 2 | 3 | 4;

const STEPS = [
  { id: 0, label: "Shipping", icon: Truck },
  { id: 1, label: "Payment", icon: CreditCard },
  { id: 2, label: "Review",  icon: Lock },
] as const;

export default function CheckoutPage() {
  const router                    = useRouter();
  const { lines, subtotal, clear } = useCart();
  const [step, setStep]           = useState<Step>(0);
  const [mounted, setMounted]     = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Store validated data across steps
  const shippingData = useRef<ShippingData | null>(null);
  const paymentData  = useRef<PaymentData  | null>(null);

  useEffect(() => setMounted(true), []);

  const sub      = mounted ? subtotal() : 0;
  const shipping = sub > 75 ? 0 : 8;
  const tax      = Math.round(sub * 0.08);
  const total    = sub + shipping + tax;

  const goTo = (next: Step) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const { data: session } = useSession();

  const stripeElementsRef = useRef<ReturnType<typeof useElements> | null>(null);
  const stripeRef = useRef<Awaited<ReturnType<typeof stripePromise>> | null>(null);
  const cardNameRef = useRef<string>("");
  const confirmedPaymentIntentRef = useRef<string | null>(null);

  const [isPlacing, setIsPlacing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const confirmCard = async () => {
    const stripe = stripeRef.current;
    const elements = stripeElementsRef.current;
    if (!stripe || !elements) return;

    const piRes = await fetch("/api/stripe/payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: total }),
    });
    const { clientSecret } = await piRes.json();
    if (!clientSecret) return;

    const cardElement = elements.getElement(CardNumberElement);
    if (!cardElement) return;

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: { name: cardNameRef.current },
      },
    });

    if (error) {
      setPaymentError(error.message ?? "Payment failed");
      goTo(1);
      return;
    }

    confirmedPaymentIntentRef.current = paymentIntent?.id ?? null;
    goTo(2);
  };

  const placeOrder = async () => {
    if (!shippingData.current) return;
    setIsPlacing(true);
    setPaymentError(null);

    // Order DB mein save karo
    const body = {
      total,
      stripePaymentIntentId: confirmedPaymentIntentRef.current,
      items: lines.map((l) => ({
        productId: l.productId,
        slug: l.slug,
        name: l.name,
        image: l.image,
        price: l.price,
        color: l.color,
        size: l.size,
        quantity: l.quantity,
      })),
      shippingAddress: {
        fullName: `${shippingData.current.firstName} ${shippingData.current.lastName}`,
        line1: shippingData.current.address,
        city: shippingData.current.city,
        state: shippingData.current.state,
        zip: shippingData.current.zip,
        country: shippingData.current.country,
      },
    };
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    clear();
    goTo(4);
    setTimeout(() => router.push("/account"), 6000);
  };

  if (!mounted) return <div className="container-edge h-[60vh]" />;
  if (step === 4) return <SuccessScreen />;

  if (lines.length === 0) {
    return (
      <div className="container-edge flex min-h-[70vh] flex-col items-center justify-center text-center">
        <ShoppingBag className="mb-6 h-16 w-16 text-ink-muted dark:text-paper/40" />
        <h1 className="text-display-lg font-bold tracking-tight">Nothing to check out</h1>
        <p className="mt-3 text-ink-muted dark:text-paper/60">Your bag is empty.</p>
        <Link href="/shop" className="btn-primary mt-8">Browse products</Link>
      </div>
    );
  }

  const variants = {
    enter:  (dir: number) => ({ opacity: 0, x: dir * 40 }),
    center: { opacity: 1, x: 0 },
    exit:   (dir: number) => ({ opacity: 0, x: dir * -40 }),
  };

  return (
    <div className="container-edge py-12 pt-28 lg:py-16 lg:pt-32">
      <h1 className="text-display-lg mb-10 font-bold tracking-tight">Checkout</h1>

      {/* Progress */}
      <div className="mb-12 flex items-center gap-2 sm:gap-4">
        {STEPS.map((s, i) => {
          const done   = step > s.id;
          const active = step === s.id;
          return (
            <div key={s.id} className="flex flex-1 items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{
                    backgroundColor: active || done ? "var(--accent)" : "rgba(0,0,0,0)",
                    scale: active ? 1.08 : 1,
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink dark:border-paper"
                >
                  {done ? (
                    <Check className="h-4 w-4 text-ink" />
                  ) : (
                    <s.icon className="h-4 w-4" />
                  )}
                </motion.div>
                <span className={`hidden text-sm font-medium sm:block ${active ? "" : "text-ink-muted dark:text-paper/50"}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="relative h-px flex-1 bg-ink/10 dark:bg-paper/10">
                  <motion.div
                    initial={false}
                    animate={{ width: step > s.id ? "100%" : "0%" }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-y-0 left-0 bg-accent"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        {/* Form area */}
        <div className="min-h-[320px] overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 0 && (
                <ShippingForm
                  defaultValues={shippingData.current ?? undefined}
                  onValid={(data) => {
                    shippingData.current = data;
                    goTo(1);
                  }}
                />
              )}
              {step === 2 && (
                <ReviewStep lines={lines} total={total} />
              )}
              <div style={{ display: step === 1 ? "block" : "none" }}>
                <Elements stripe={stripePromise}>
                  <PaymentForm
                    onValid={() => confirmCard()}
                    onBack={() => goTo(0)}
                    onStripeReady={(s, e) => {
                      stripeRef.current = s;
                      stripeElementsRef.current = e;
                    }}
                    onNameChange={(name) => { cardNameRef.current = name; }}
                  />
                </Elements>
              </div>
              
            </motion.div>
          </AnimatePresence>

          {/* Step controls — only shown for Review step; Shipping/Payment handle their own */}
          {step === 2 && (
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => goTo(1)}
                className="flex items-center gap-2 text-sm font-medium"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              {paymentError && <p className="text-sm text-red-500">{paymentError}</p>}
              <button onClick={placeOrder} disabled={isPlacing} className="btn-primary bg-accent text-ink">
                {isPlacing ? "Processing…" : `Place order — ${formatPrice(total)}`}
              </button>
            </div>
          )}

          {/* Back to cart — only on shipping step */}
          {step === 0 && (
            <div className="mt-8">
              <Link href="/cart" className="flex items-center gap-2 text-sm font-medium">
                <ArrowLeft className="h-4 w-4" /> Back to bag
              </Link>
            </div>
          )}
        </div>

        {/* Summary sidebar */}
        <div className="lg:sticky lg:top-28 lg:h-fit">
          <div className="rounded-2xl border border-ink/10 p-6 dark:border-paper/10">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider">Order Summary</h2>
            <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
              {lines.map((line) => (
                <div key={`${line.productId}-${line.color}-${line.size}`} className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={line.image} alt={line.name} className="h-14 w-14 flex-none rounded-lg object-cover" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium leading-tight">{line.name}</p>
                    <p className="text-xs text-ink-muted dark:text-paper/60">
                      {line.color} · {line.size} · Qty {line.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-medium">{formatPrice(line.price * line.quantity)}</span>
                </div>
              ))}
            </div>
            <dl className="mt-5 space-y-2 border-t border-ink/10 pt-5 text-sm dark:border-paper/10">
              <div className="flex justify-between">
                <dt className="text-ink-muted dark:text-paper/60">Subtotal</dt>
                <dd>{formatPrice(sub)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted dark:text-paper/60">Shipping</dt>
                <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted dark:text-paper/60">Tax</dt>
                <dd>{formatPrice(tax)}</dd>
              </div>
            </dl>
            <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-4 dark:border-paper/10">
              <span className="font-medium">Total</span>
              <span className="text-xl font-semibold">{formatPrice(total)}</span>
            </div>
          </div>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-ink-muted dark:text-paper/50">
            <Lock className="h-3 w-3" /> Secure checkout · Demo only
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Shared Field component ────────────────────────────────

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  className?: string;
}

const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, className = "", ...props }, ref) => {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-ink-muted dark:text-paper/50">
        {label}
      </span>
      <input
        ref={ref}
        {...props}
        aria-invalid={!!error}
        className={`w-full rounded-xl border bg-transparent px-4 py-3 text-sm outline-none transition-colors
          ${error
            ? "border-red-500 focus:border-red-500"
            : "border-ink/15 focus:border-ink dark:border-paper/20 dark:focus:border-paper"
          }`}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="mt-1 text-xs text-red-500"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
  </label>
  );
});
Field.displayName = "Field";
// ── Shipping Form ─────────────────────────────────────────

function ShippingForm({
  defaultValues,
  onValid,
}: {
  defaultValues?: Partial<ShippingData>;
  onValid: (data: ShippingData) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: defaultValues ?? {},
    mode: "onSubmit",
  });

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate id="shipping-form">
      <h2 className="mb-1 text-2xl font-semibold">Shipping details</h2>
      <p className="mb-6 text-sm text-ink-muted dark:text-paper/60">Where should we send it?</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name"        placeholder="Alex"          error={errors.firstName?.message} {...register("firstName")} />
        <Field label="Last name"         placeholder="Rivera"        error={errors.lastName?.message}  {...register("lastName")} />
        <Field label="Email" type="email" placeholder="you@email.com" error={errors.email?.message}    {...register("email")} className="sm:col-span-2" />
        <Field label="Address"           placeholder="123 Main St"   error={errors.address?.message}   {...register("address")} className="sm:col-span-2" />
        <Field label="City"              placeholder="Brooklyn"      error={errors.city?.message}      {...register("city")} />
        <Field label="State / Province"  placeholder="NY"            error={errors.state?.message}     {...register("state")} />
        <Field label="ZIP / Postal code" placeholder="11215"         error={errors.zip?.message}       {...register("zip")} />
        <Field label="Country"           placeholder="United States" error={errors.country?.message}   {...register("country")} />
      </div>
      <div className="mt-8 flex justify-end">
        <button type="submit" className="btn-primary">Continue</button>
      </div>
    </form>
  );
}

// ── Payment Form ──────────────────────────────────────────

const stripeElementStyle = {
  base: {
    fontSize: "14px",
    color: "#fafafa",
    fontFamily: "Inter, sans-serif",
    "::placeholder": { color: "#555555" },
  },
  invalid: { color: "#ef4444" },
};

function PaymentForm({
  onValid,
  onBack,
  onStripeReady,
  onNameChange,
}: {
  onValid: () => void;
  onBack: () => void;
  onStripeReady: (stripe: any, elements: any) => void;
  onNameChange: (name: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [nameOnCard, setNameOnCard] = useState("");
  const [cardError, setCardError] = useState<string | null>(null);

  useEffect(() => {
    if (stripe && elements) onStripeReady(stripe, elements);
  }, [stripe, elements]);

  const handleContinue = () => {
    if (!nameOnCard.trim()) { setCardError("Name on card required"); return; }
    setCardError(null);
    onNameChange(nameOnCard);
    onValid();
  };

  return (
    <div>
      <h2 className="mb-1 text-2xl font-semibold">Payment</h2>
      <p className="mb-6 text-sm text-ink-muted dark:text-paper/60">
        Secured by Stripe · Test mode
      </p>
      <div className="mb-4 flex gap-3">
        <div className="flex-1 rounded-xl border-2 border-ink p-4 text-center text-sm font-medium dark:border-paper">Card</div>
        <div className="flex-1 rounded-xl border border-ink/15 p-4 text-center text-sm text-ink-muted dark:border-paper/20 dark:text-paper/50">Apple Pay</div>
        <div className="flex-1 rounded-xl border border-ink/15 p-4 text-center text-sm text-ink-muted dark:border-paper/20 dark:text-paper/50">Google Pay</div>
      </div>
      <div className="grid gap-4">
        {/* Card Number */}
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-ink-muted dark:text-paper/50">Card number</span>
          <div className="w-full rounded-xl border border-ink/15 px-4 py-3 dark:border-paper/20">
            <CardNumberElement options={{ style: stripeElementStyle, disableLink: true }} />
          </div>
        </label>
        {/* Expiry + CVC */}
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-wider text-ink-muted dark:text-paper/50">Expiry</span>
            <div className="w-full rounded-xl border border-ink/15 px-4 py-3 dark:border-paper/20">
              <CardExpiryElement options={{ style: stripeElementStyle }} />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-wider text-ink-muted dark:text-paper/50">CVC</span>
            <div className="w-full rounded-xl border border-ink/15 px-4 py-3 dark:border-paper/20">
              <CardCvcElement options={{ style: stripeElementStyle }} />
            </div>
          </label>
        </div>
        {/* Name on card — regular input */}
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-wider text-ink-muted dark:text-paper/50">Name on card</span>
          <input
            value={nameOnCard}
            onChange={(e) => setNameOnCard(e.target.value)}
            placeholder="Alex Rivera"
            className="w-full rounded-xl border border-ink/15 bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-ink dark:border-paper/20 dark:focus:border-paper"
          />
        </label>
        {cardError && <p className="text-xs text-red-500">{cardError}</p>}
      </div>
      <div className="mt-8 flex items-center justify-between">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button type="button" onClick={handleContinue} className="btn-primary">Continue</button>
      </div>
    </div>
  );
}

// ── Review Step ───────────────────────────────────────────

function ReviewStep({
  lines,
  total,
}: {
  lines: { name: string; color: string; size: string; quantity: number }[];
  total: number;
}) {
  return (
    <div>
      <h2 className="mb-1 text-2xl font-semibold">Review &amp; confirm</h2>
      <p className="mb-6 text-sm text-ink-muted dark:text-paper/60">Everything look good?</p>
      <div className="space-y-3 rounded-2xl border border-ink/10 p-5 dark:border-paper/10">
        {lines.map((line, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>
              {line.name}{" "}
              <span className="text-ink-muted dark:text-paper/50">
                ({line.color}, {line.size}, ×{line.quantity})
              </span>
            </span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-ink-muted dark:text-paper/60">
        By placing your order you agree to our Terms &amp; Privacy Policy. This is a demo store — no payment will be processed and no order will ship.
      </p>
      <p className="mt-4 text-lg font-semibold">Total: {formatPrice(total)}</p>
    </div>
  );
}



function SuccessScreen() {
  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden text-center">
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-2 w-2"
          style={{
            backgroundColor: ["#d4ff3f", "#0a0a0a", "#b3202a", "#2746c9"][i % 4],
            left: `${(i * 2.5) % 100}%`,
            top: "-5%",
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", opacity: [1, 1, 0], rotate: 360 }}
          transition={{ duration: 2.5 + (i % 5) * 0.4, delay: (i % 10) * 0.05, ease: "easeIn" }}
        />
      ))}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-accent"
      >
        <Check className="h-12 w-12 text-ink" strokeWidth={3} />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 mt-8 text-display-lg font-bold tracking-tight"
      >
        Order confirmed.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 mt-3 max-w-md text-ink-muted dark:text-paper/60"
      >
        Thanks for your order. A confirmation is on its way to your inbox. Redirecting you to your account…
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="relative z-10 mt-8 flex gap-3"
      >
        <Link href="/account" className="btn-primary">View orders</Link>
        <Link href="/shop" className="btn-ghost">Keep shopping</Link>
      </motion.div>
    </div>
  );
}