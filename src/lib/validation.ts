import { z } from "zod";

// ── Shipping ──────────────────────────────────────────────
export const shippingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName:  z.string().min(1, "Last name is required"),
  email:     z.string().min(1, "Email is required").email("Invalid email address"),
  address:   z.string().min(5, "Enter a valid address"),
  city:      z.string().min(1, "City is required"),
  state:     z.string().min(1, "State is required"),
  zip:       z.string().regex(/^\d{4,10}$/, "Invalid postal code"),
  country:   z.string().min(1, "Country is required"),
});

export type ShippingData = z.infer<typeof shippingSchema>;

// ── Payment ───────────────────────────────────────────────
export const paymentSchema = z.object({
  cardNumber: z
    .string()
    .transform((v) => v.replace(/\s/g, ""))
    .pipe(z.string().regex(/^\d{16}$/, "Card number must be 16 digits")),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\s*\/\s*\d{2}$/, "Use MM / YY format")
    .refine((v) => {
      const [m, y] = v.split("/").map((s) => parseInt(s.trim(), 10));
      const now = new Date();
      const expYear = 2000 + y;
      const expMonth = m;
      return (
        expYear > now.getFullYear() ||
        (expYear === now.getFullYear() && expMonth >= now.getMonth() + 1)
      );
    }, "Card has expired"),
  cvc:        z.string().regex(/^\d{3,4}$/, "CVC must be 3–4 digits"),
  nameOnCard: z.string().min(2, "Name on card is required"),
});

export type PaymentData = z.infer<typeof paymentSchema>;

// ── Auth ──────────────────────────────────────────────────
export const loginSchema = z.object({
  email:    z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name:            z.string().min(2, "Name must be at least 2 characters"),
    email:           z.string().min(1, "Email is required").email("Invalid email address"),
    password:        z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path:    ["confirmPassword"],
  });

export type RegisterData = z.infer<typeof registerSchema>;