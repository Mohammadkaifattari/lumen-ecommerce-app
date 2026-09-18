# LUMEN — Full-Stack Premium E-Commerce Platform

A high-end e-commerce platform combining the bold, athletic energy of Nike with the minimal, cinematic product-reveal animations of Apple. Built as a **production-ready full-stack application** with real backend, authentication, payments, and admin panel.

> **Stack:** Next.js 14 (App Router, Server Components) · TypeScript · Tailwind CSS · Framer Motion · GSAP ScrollTrigger · Zustand · MongoDB/Mongoose · NextAuth.js · Stripe · Pusher · Socket.IO · Cloudinary · Resend

---

## ✨ Highlights

### Storefront (Customer-Facing)
- **Cinematic homepage** — full-screen parallax hero with staggered headline reveal, GSAP scroll-triggered text/sections, Nike-style featured carousel, animated category tiles, and a pinned editorial "manifesto" block.
- **Premium product card** — hover image-swap, zoom, color dots, and a quick-add button that slides up.
- **Shop page** — animated filter/sort grid (category, price, color), skeleton loaders, URL-synced filters, mobile filter drawer, empty states.
- **Product detail** — crossfade gallery with thumbnails, color/size swatches, quantity stepper, **add-to-cart success micro-interaction**, low-stock indicator, scroll-reveal editorial banner, aggregate ratings + reviews, related products.
- **Cart** — slide-in drawer (accessible anywhere) **and** a full cart page, both with animated line add/remove, quantity updates, persistent storage, and working promo-code field (`WELCOME10`, `FLIGHT20`).
- **Checkout** — animated multi-step flow (Shipping → Payment → Review) with progress bar, Stripe integration, and confetti success screen.
- **Auth** — login/register with NextAuth.js (Email/Password + Google OAuth), JWT sessions, role-based redirects.
- **Account** — tabbed dashboard with order history (tracking timeline), wishlist grid, editable profile.
- **Live Chat** — real-time customer support via Socket.IO, persistent message history.
- **Global UX** — debounced live search overlay (⌘/Ctrl+K), dark-mode toggle (no FOUC), magnetic buttons, page transitions, responsive mobile-first layout, `prefers-reduced-motion` support.

### Admin Panel (`/admin`)
- **Dashboard** — real-time KPIs (revenue, orders, products, users, avg order value) + recent orders table.
- **Product Management** — full CRUD with Cloudinary image upload, category/stock/price management.
- **Order Management** — view all orders, update status (Processing/Shipped/Delivered/Cancelled).
- **User Management** — view all users, change roles (user/admin).
- **Analytics** — revenue charts (Recharts), top products leaderboard, monthly trends, breakdowns.
- **Live Chat** — multi-room real-time support interface with unread badges.
- **Real-Time Notifications** — Pusher-powered live alerts for new orders, chat messages, new users.
- **Premium Dark Theme** — custom design system with volt-lime accent (`#d4ff3f`) on dark backgrounds.

---

## 🔐 Authentication & Authorization

- **NextAuth.js v4** with JWT session strategy
- **Providers:** Credentials (bcrypt-hashed passwords) + Google OAuth
- **Role-based access:** `user` / `admin` enum in User model
- **Middleware protection:** `/admin/*` routes blocked for non-admin users
- **Auto-redirect:** Admin users → `/admin`, Regular users → `/account`

---

## 💳 Payments & Orders

- **Stripe Checkout** — server-side session creation, webhook handling for order confirmation
- **Order lifecycle:** Created → Processing → Shipped → Delivered / Cancelled
- **Real-time admin notifications** via Pusher on new orders and status changes
- **Order history** persisted in MongoDB with tracking timeline

---

## 🗄 Database (MongoDB)

**Collections:**
- `users` — name, email, hashed password, role, timestamps
- `products` — slug, name, tagline, description, price, compareAtPrice, category, images[], colors[], sizes[], stock, rating, reviewCount, badges[], featured
- `orders` — userId, items[], shipping, subtotal, tax, shippingCost, total, status, timestamps
- `messages` — roomId, text, sender (user/admin), time

---

## 🔔 Real-Time Features

| Feature | Technology | Channel |
|---------|------------|---------|
| New order alerts | Pusher | `admin-channel` |
| Order status updates | Pusher | `admin-channel` |
| Live chat messages | Socket.IO | Per-room + `admin-channel` |
| New user registrations | Pusher | `admin-channel` |
| Unread badges | Zustand + Pusher | Client-side store |

---

## 🖼 Image Management

- **Cloudinary** for product image uploads (admin panel)
- **Next.js Image** optimization with remote pattern allowlist
- Automatic transformation, CDN delivery, responsive sizing

---

## 📧 Email

- **Resend** for transactional emails (order confirmations, etc.)

---

## 🚀 Getting Started

Requires **Node.js 18.17+** (developed on Node 24).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create `.env.local` with:

```bash
# Database
MONGODB_URI=mongodb://...

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Images
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...

# Real-time
PUSHER_APP_ID=...
PUSHER_SECRET=...
NEXT_PUBLIC_PUSHER_KEY=...
NEXT_PUBLIC_PUSHER_CLUSTER=...

# Email
RESEND_API_KEY=re_...
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Lint with `next lint` |
| `npm run seed` | Seed products from mock data |
| `npm run seed:admin` | Create/update admin user |
| `npm run test:e2e` | Run Playwright smoke tests |
| `npm run test:e2e:ui` | Run tests in Playwright UI |

---

## 🧪 Testing & Auditing

### Playwright E2E Tests

```bash
npm run build
npm run start -- -p 3138
npm run test:e2e
```

Tests cover: homepage render, SEO, navbar navigation, quick-add → cart drawer, product add-to-cart size validation, ⌘K search + Esc-close, a11y basics.

### Lighthouse

```bash
npm run build && npm run start -- -p 3138
npx lighthouse http://localhost:3138/ --preset=desktop \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless --no-sandbox --disable-gpu"
```

---

## 🗂 Project Structure

```
src/
├─ app/                          # App Router pages
│  ├─ layout.tsx                 # Root layout: fonts, theme script, shell
│  ├─ page.tsx                   # Homepage
│  ├─ admin/                     # Premium dark-mode admin panel
│  │  ├─ layout.tsx              # Admin shell: sidebar, topbar, notifications
│  │  ├─ page.tsx                # Dashboard (server stats)
│  │  ├─ products/page.tsx       # Product CRUD
│  │  ├─ orders/page.tsx         # Order management
│  │  ├─ users/page.tsx          # User management
│  │  ├─ analytics/page.tsx      # Revenue charts & metrics
│  │  ├─ chat/page.tsx           # Live chat (Socket.IO)
│  │  └─ _components/            # Admin UI lib, DashboardClient, QueryProvider
│  ├─ api/                       # API Routes
│  │  ├─ admin/                  # Admin-only endpoints (users, analytics)
│  │  ├─ auth/                   # NextAuth + register
│  │  ├─ chat/                   # Chat messages
│  │  ├─ orders/                 # Orders CRUD + webhook
│  │  ├─ stripe/                 # Stripe checkout + webhook
│  │  └─ products/               # Product endpoints
│  ├─ shop/page.tsx              # Listing + filters
│  ├─ product/[slug]/            # Product detail (SSG, dynamic metadata, JSON-LD)
│  ├─ cart/ · checkout/          # Cart + multi-step Stripe checkout
│  ├─ login/ · register/         # Auth (NextAuth)
│  ├─ account/                   # Orders, wishlist, profile
│  ├─ error.tsx · loading.tsx    # Global error + loading fallbacks
│  ├─ sitemap.ts · robots.ts     # Generated SEO routes
│  ├─ not-found.tsx              # 404
│  └─ globals.css                # Tailwind + design tokens
├─ components/
│  ├─ layout/                    # Navbar, Footer, CartDrawer, SearchOverlay, PageTransition, ThemeProvider, AdminLayoutGuard
│  ├─ home/                      # Hero, FeaturedCarousel, CategoryShowcase, Manifesto, ProductRow
│  ├─ product/                   # ProductCard, ProductGallery, ProductConfigurator, ReviewsSection
│  ├─ shop/ · auth/ · chat/      # ShopBrowser, AuthForm, LiveChatWrapper
│  └─ ui/                        # Reveal, SplitText, Stars, Marquee, MagneticButton, BentoGrid
├─ store/                        # Zustand: cart, wishlist, ui, notifications
├─ lib/
│  ├─ mongodb.ts                 # Mongoose connection (cached)
│  ├─ auth.ts                    # NextAuth config
│  ├─ pusher.ts / pusherClient.ts # Pusher server/client
│  ├─ data.ts                    # Mock catalog (fallback/seed source)
│  ├─ utils.ts
│  └─ hooks/                     # useFocusTrap, usePrefersReducedMotion
├─ models/                       # Mongoose models (User, Product, Order, Message)
├─ types/                        # Shared domain types
scripts/
├─ seed.ts                       # Product seeding
└─ seed-admin.ts                 # Admin user creation
tests/smoke.spec.ts              # Playwright smoke tests
playwright.config.ts
```

---

## 🎨 Design System

- **Palette** — minimal: `ink` (near-black `#0a0a0a`), `paper` (off-white `#fafafa`), `accent` (volt lime `#d4ff3f`).
- **Admin Palette** — dark theme: `bg: #0d0d0d`, `card: #141414`, `border: #262626`, accent `#d4ff3f`.
- **Type** — Inter, with cinematic `display-xl`/`display-2xl` fluid sizes.
- **Motion** — two easing curves (`premium`, `expo`) reused across the app.
- Defined in `tailwind.config.ts` and `src/app/globals.css`.
- **Admin UI Library** — `src/app/admin/_components/AdminUI.tsx` (525 lines): design tokens, motion variants, layout primitives, form components, data display, modal.

---

## ♿ Accessibility

- **Focus trap + Esc-to-close** on cart drawer, search overlay (⌘K), mobile menu, modals — Tab/Shift-Tab cycle within overlay, focus returns to trigger on close.
- **ARIA roles** — overlays use `role="dialog"` + `aria-modal="true"` with descriptive `aria-label`s.
- **Icon-only buttons** all have descriptive `aria-label`s; decorative icons are `aria-hidden`.
- **Color contrast** — tuned to meet WCAG AA.
- **Keyboard** — every interactive element reachable and operable via keyboard.

---

## 🎞 Reduced Motion

`prefers-reduced-motion: reduce` honored at **two layers**:

1. **CSS** (`globals.css`) — caps all transition/animation durations for Framer Motion micro-interactions.
2. **JavaScript** (`usePrefersReducedMotion` hook) — conditionally **skips** GSAP scroll-driven animations entirely (Hero, Reveal, SplitText, RevealBlock, CategoryShowcase, Manifesto parallax).

---

## 🔌 SEO

- **Per-page metadata** via Next.js `generateMetadata` — dynamic title, description, Open Graph image per product.
- **JSON-LD `Product` schema** on each product page (name, image, price, availability, `aggregateRating`).
- **`sitemap.xml`** — dynamically generated, includes all static routes + one URL per product slug.
- **`robots.txt`** — allows content pages, blocks transactional/account routes.
- **Open Graph + Twitter** card metadata on root layout.

---

## 🛡 Error & Loading States

- **Global error boundary** (`error.tsx`) — recoverable "Hit a snag" screen with *Try again*.
- **Global loading fallback** (`loading.tsx`) — skeleton grid during route segment loads.
- **Skeleton loaders** on shop grid and product cards.
- **Empty states with icon + CTA** — empty cart, wishlist, no search results, no filter matches.

---

## 🔌 Vercel Deployment

1. Push to GitHub
2. Import in Vercel
3. Add **all environment variables** in Settings → Environment Variables
4. **Critical:** Set `NEXTAUTH_URL=https://your-project.vercel.app`
5. Deploy

> MongoDB Atlas must allow connections from Vercel IPs (or 0.0.0.0/0 for dev).

---

## ⚠️ Honest Limitations

- **Images** are remote Unsplash URLs (demo) — in production, host on your own CDN/Cloudinary.
- **Lighthouse scores** measured on localhost; real-world scores depend on hosting, CDN, image hosting.
- **Real-time features** (Socket.IO, Pusher) require sticky sessions or external Redis adapter for horizontal scaling.
- **Admin panel** is a single-page SPA per section — initial JS bundle larger than pure Server Components.
- **No automated CI/CD** configured — add GitHub Actions for lint/test/build on PR.

---

Built as a production-grade full-stack e-commerce platform demonstrating advanced frontend animation, App Router architecture, real-time features, authentication, payments, admin tooling, accessibility, and performance budgeting.