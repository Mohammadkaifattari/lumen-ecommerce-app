Samajh gaya — tumhe poore project ka ek structured reference document chahiye jo future conversations mein context ke taur pe use ho. Yeh ek research/documentation task hai, code changes nahi. Pehle main project ko thoroughly scan karta hoon taaki summary bilkul accurate ho (khaas karke baad ke improvements ke baad current state confirm karne ke liye).

Main sahi details verify karne ke liye parallel mein 3 Explore agents launch kar raha hoon.

Explore
Scan config + stack + structure
Explore
Inventory all components + routes
Explore
Scan data layer + stores + validation + TODOs
Teesre agent ke findings ne kuch important cheezein saaf ki hain jo meri pehli audit se aage badh chuki hain — ab 14 products hain (12 nahi), Zod + React Hook Form implement ho chuke hain (src/lib/validation.ts), CustomCursor, Newsletter homepage section, size filter, aur ProductCard tilt sab maujood hain. Project meri soch se zyada mature hai. Yeh raha complete, accurate snapshot — jo future conversations mein context ke taur pe use kar sakte ho:

🛒 LUMEN — Project Context & Codebase Snapshot
Roman Urdu: Yeh document poore Next.js frontend ka structured reference hai. Har section ke 1-line se upar Roman Urdu mein, content English/code mein. Future AI conversations mein context ke taur pe isay paste kar sakte ho.

1. Tech Stack
Roman Urdu: Project ka core stack — frontend poori tarah real hai, backend abhi mock hai. Package versions exact package.json se uthaye gaye hain.

Category	Package	Version	Status
Framework	next	14.2.15	✅ App Router
React	react / react-dom	^18.3.1	✅
Styling	tailwindcss	^3.4.13	✅
Animation	framer-motion	^11.11.9	✅
Animation	gsap	^3.12.5	✅ ScrollTrigger
State	zustand	^4.5.5	✅
Forms	react-hook-form	^7.80.0	✅
Validation	zod	^4.4.3	✅ + @hookform/resolvers ^5.4.0
Icons	lucide-react	^0.451.0	✅
Utils	clsx / tailwind-merge	^2.1.1 / ^2.5.4	✅
Testing	@playwright/test	^1.61.0	✅ dev
Auditing	lighthouse	^13.4.0	✅ dev
DB (MongoDB)	—	—	❌ Not installed
Auth (NextAuth)	—	—	❌ Not installed
Payments (Stripe)	—	—	❌ Not installed
Realtime (Socket.IO)	—	—	❌ Not installed
Email (Resend/Nodemailer)	—	—	❌ Not installed
Scripts: dev, build, start, lint, test:e2e, test:e2e:ui

2. Folder Structure
Roman Urdu: src/ ke andar 5 main folders — har folder ka apna clear role hai. 2 level deep breakdown.


text
src/
├── app/                      # Next.js App Router — routes + layout + SEO files
│   ├── layout.tsx            # Root layout (Inter font, theme script, Navbar/Footer/CartDrawer/SearchOverlay/PageTransition/ThemeProvider/CustomCursor)
│   ├── page.tsx              # Route: / (homepage)
│   ├── loading.tsx           # Global loading skeleton
│   ├── error.tsx             # Global error boundary
│   ├── not-found.tsx         # 404
│   ├── sitemap.ts            # /sitemap.xml (static + product URLs)
│   ├── robots.ts             # /robots.txt
│   ├── account/page.tsx      # Route: /account (client)
│   ├── cart/page.tsx         # Route: /cart (client)
│   ├── checkout/page.tsx     # Route: /checkout (client, RHF + Zod)
│   ├── login/page.tsx        # Route: /login
│   ├── register/page.tsx     # Route: /register
│   ├── shop/page.tsx         # Route: /shop (Suspense wrapper)
│   ├── product/[slug]/page.tsx  # Route: /product/:slug (SSG + JSON-LD)
│   └── globals.css           # Tailwind + design tokens + a11y CSS
├── components/
│   ├── layout/               # Shell: Navbar, Footer, CartDrawer, SearchOverlay, PageTransition, ThemeProvider
│   ├── home/                 # Homepage sections: Hero, FeaturedCarousel, CategoryShowcase, Manifesto, ProductRow, Newsletter
│   ├── product/              # ProductCard, ProductGallery, ProductConfigurator, ReviewsSection
│   ├── shop/                 # ShopBrowser
│   ├── auth/                 # AuthForm
│   └── ui/                   # Reveal, SplitText, RevealBlock, Stars, Marquee, MagneticButton, CustomCursor
├── lib/
│   ├── data.ts               # Mock catalog (14 products, helpers)
│   ├── utils.ts              # cn, formatPrice, slugify, seededPick, debounce
│   ├── validation.ts         # Zod schemas (shipping/payment/login/register)
│   └── hooks/
│       ├── useFocusTrap.ts
│       ├── usePrefersReducedMotion.ts
│       └── useDebounce.ts
├── store/                    # Zustand: cart.ts, wishlist.ts, ui.ts
└── types/
    └── index.ts              # 9 shared domain types (mirror future DB schema)
tests/smoke.spec.ts           # 10 Playwright tests
playwright.config.ts          # targets localhost:3138
Top-level configs: next.config.mjs (Unsplash remotePatterns only), tsconfig.json (@/* → ./src/*), tailwind.config.ts, postcss.config.js, .eslintrc.json (next/core-web-vitals), global.d.ts.

3. Design System
Roman Urdu: Tailwind config se exact tokens — minimal black/white/lime palette, cinematic fluid type scale, do premium easing curves, aur CSS animations. Design decisions single source of truth hain.

Colors
Token	DEFAULT	soft	muted / deep / dark
ink	#0a0a0a	#161616	muted: #6b6b6b
paper	#fafafa	#f1f1f0	dark: #0a0a0a
accent	#d4ff3f	#e8ff8a	deep: #a8cc1f
Typography
Font: Inter (var(--font-inter)) for both sans and display
Fluid display sizes:
Key	Size	Line	Tracking
display-2xl	clamp(3.5rem, 12vw, 11rem)	0.9	-0.04em
display-xl	clamp(2.5rem, 8vw, 7rem)	0.95	-0.035em
display-lg	clamp(2rem, 5vw, 4.5rem)	1	-0.03em
Easing Curves
Key	Value
premium	cubic-bezier(0.22, 1, 0.36, 1)
expo	cubic-bezier(0.16, 1, 0.3, 1)
Custom Keyframes / Animations
fade-up, marquee (30s linear infinite), shimmer (1.6s skeleton sweep)
darkMode: "class"
Global CSS Utilities (globals.css)
@layer components: .btn-primary, .btn-ghost, .container-edge (max-w 1600px, px-5 sm:px-8 lg:px-12), .eyebrow (uppercase tracking-[0.25em])
@layer utilities: .text-balance, .text-pretty, .no-scrollbar, .reveal-mask, .skeleton (shimmer)
prefers-reduced-motion media query caps all durations to 0.01ms
@media (pointer: fine) hides native cursor (pairs with CustomCursor)
4. Completed Features List
Roman Urdu: Har route/page ka current implementation status — jo features actually working hain, woh marked hain. Yeh meri pehli audit se zyada hai (Zod, CustomCursor, Newsletter section, size filter, tilt sab add ho chuke hain).

Routes & Pages
Route	Type	What's built
/	Server	✅ Hero (parallax + staggered headline), Marquee, FeaturedCarousel, CategoryShowcase, ProductRow (New Arrivals), Manifesto, Newsletter section, ProductRow (Best Sellers)
/shop	Server + Client	✅ Grid, filter sidebar (category, size, color, price slider), sort (featured/newest/price/rating), skeleton loaders, mobile filter drawer, URL-synced ?category=, empty state
/product/:slug	SSG	✅ Gallery w/ thumbnails, color/size/qty swatches, add-to-cart micro-interaction, stock indicator, scroll-reveal editorial banner, reviews w/ distribution, related products, JSON-LD Product schema, dynamic generateMetadata
/cart	Client	✅ Line items, qty +/-, remove, promo codes (WELCOME10/FLIGHT20), order summary (subtotal/discount/shipping/tax/total), empty state
/checkout	Client	✅ 3-step wizard (Shipping→Payment→Review) using RHF + Zod, progress bar, confetti SuccessScreen, order summary
/account	Client	✅ Tabbed: Orders (expandable + tracking timeline), Wishlist (grid), Profile (editable form)
/login, /register	Server + Client	✅ Animated AuthForm (mode flip, mock auth, Google button, success state)
/error, /loading, /404	—	✅ Global error boundary, loading skeleton, not-found
/sitemap.xml, /robots.txt	Route handlers	✅ Dynamic
Cross-Cutting
Feature	Status
Dark mode toggle	✅ No-FOUC (inline script) + persisted to localStorage
Search	✅ ⌘/Ctrl+K overlay, debounced (useDebounce), focus trap, Esc-close
Cart drawer	✅ Slide-in, focus trap, Esc-close, persistent (localStorage)
Accessibility	✅ Focus trap on all overlays, role="dialog"/aria-modal, descriptive aria-labels on icon buttons, decorative icons aria-hidden
Reduced motion	✅ Two layers: CSS cap + usePrefersReducedMotion JS guards (Hero, Reveal, SplitText, Manifesto, CategoryShowcase, CustomCursor)
SEO	✅ Per-product generateMetadata, JSON-LD, sitemap, robots, OG/Twitter
Performance	✅ next/image with priority/sizes on Hero (LCP), ProductCard, Gallery, CategoryShowcase
Validation	✅ Zod schemas: shippingSchema, paymentSchema, loginSchema, registerSchema
Magnetic buttons	✅ MagneticButton
Custom cursor	✅ CustomCursor (dot + lagging ring, mix-blend-difference)
ProductCard tilt	✅ 3D tilt-on-mouse-move + shine overlay
Tests	✅ 10 Playwright smoke tests
Page transitions	✅ AnimatePresence on route change
Loading skeletons	✅ (not spinners)
5. Components Inventory
Roman Urdu: Har component ka 1-line purpose — layout, home, product, shop, auth, ui folders ka complete map.

components/layout/ (shell — har page pe chalti hain)
Component	Purpose
Navbar	Fixed top nav: scroll-aware blur, centered wordmark, magnetic underline links, search/theme/cart actions, animated cart badge, mobile menu w/ focus trap
Footer	Newsletter callout + link columns (Shop/Support/Company)
CartDrawer	Right slide-in cart: line items, qty, remove, subtotal, checkout link, focus trap
SearchOverlay	⌘K command-palette search, debounced, focus trap, Esc-close
PageTransition	Wraps <main>, re-keys on pathname for fade+slide transition, scrolls to top
ThemeProvider	Syncs theme store w/ .dark class, persists to localStorage
components/home/ (homepage sections)
Component	Purpose
Hero	Full-screen parallax hero w/ GSAP staggered headline word-slam
FeaturedCarousel	Horizontal snap-scroll carousel of featured products + "View All" tail card
CategoryShowcase	Editorial image tiles per category w/ GSAP scroll-scrubbed zoom
Manifesto	Pinned parallax editorial section ("The LUMEN Standard")
ProductRow	Reusable 4-up grid w/ eyebrow/title + CTA
Newsletter	Email signup w/ mock async submit + success state
components/product/
Component	Purpose
ProductCard (+ ProductCardSkeleton)	3D tilt card w/ hover image-swap, shine, badges, wishlist, quick-add, color dots
ProductGallery	Sticky image gallery w/ thumbnail switch + crossfade
ProductConfigurator	Buy-box: color/size/qty selectors, add-to-cart morph, stock indicator, trust badges
ReviewsSection	Aggregate rating distribution bars + expandable review cards
components/shop/, auth/, ui/
Component	Purpose
ShopBrowser	Shop UI: filter sidebar, sort, skeleton grid, mobile drawer, URL-sync
AuthForm	Animated login/register flip, mock auth, Google button
Reveal	GSAP scroll reveal (variants: fade-up/fade/scale/clip/blur)
SplitText (+ RevealBlock)	Per-word GSAP staggered text reveal / simple fade block
Stars	Star rating w/ partial-fill overlay
Marquee	Pure-CSS horizontal marquee (only server component in ui/)
MagneticButton	Button that drifts toward cursor (Framer spring)
CustomCursor	Two-element cursor (dot + lagging ring, mix-blend-difference)
6. State Management (Zustand)
Roman Urdu: Teen stores — cart (persistent), wishlist (persistent), ui (theme + search). Cart aur wishlist localStorage pe survive karte hain, ui store nahi.

store/cart.ts → useCart (persisted: lumen-cart)
Field/Action	Description
lines: CartLine[]	cart line items
isOpen, lastAddedAt	drawer state (NOT persisted — partialize keeps only lines)
add(product, {color, size, qty?})	merges if same product+color+size, opens drawer
remove, updateQuantity, clear	mutations
open/close/toggle	drawer visibility
count(), subtotal()	derived
store/wishlist.ts → useWishlist (persisted: lumen-wishlist)
Field/Action	Description
ids: string[]	wishlist product IDs (whole state persisted)
toggle(id), has(id), clear()	mutations
store/ui.ts → useUI (NOT persisted)
Field/Action	Description
theme: "light" | "dark"	toggled via toggleTheme/setTheme (applies .dark class)
searchOpen	overlay visibility
setSearchOpen(open)	controls search overlay
7. Data Layer (lib/data.ts)
Roman Urdu: Mock catalog — 14 products, 4 categories, 8 colors, 2 mock orders, 2 coupons. Future mein MongoDB se replace hona hai, types already schema mirror karte hain.

Item	Count / Detail
PRODUCTS	14 (footwear 4, apparel 4, accessories 3, equipment 3)
Featured products	4 (p_001, p_002, p_004, p_008)
Products w/ compareAtPrice	3 (p_001, p_005, p_009)
CATEGORIES	4: footwear, apparel, accessories, equipment
COLORS (private)	8: tripleBlack, offWhite, lime, slate, sand, crimson, royal, forest
REVIEW_POOL (private)	6 reusable reviews
MOCK_ORDERS	2 (ORD-7741 Delivered, ORD-7802 Shipped)
MOCK_COUPONS	2 (WELCOME10 10%, FLIGHT20 20%)
Accessor functions: getAllProducts, getProductBySlug, getRelatedProducts, getFeaturedProducts, getNewArrivals, getBestSellers

utils.ts: cn, formatPrice (USD 0 decimals), slugify, seededPick, debounce

8. Validation Schemas (lib/validation.ts)
Roman Urdu: Zod schemas waise maujood hain — shipping, payment, login, register. Checkout page pe RHF ke saath use hoti hain @hookform/resolvers ke through.

Schema	Inferred Type	Fields & Rules
shippingSchema	ShippingData	firstName, lastName, city, state, country (min 1); email (.email()); address (min 5); zip (/^\d{4,10}$/)
paymentSchema	PaymentData	cardNumber (strips spaces, exactly 16 digits); expiry (MM / YY + not-expired refine); cvc (/^\d{3,4}$/); nameOnCard (min 2)
loginSchema	LoginData	email (.email()); password (min 1)
registerSchema	RegisterData	name (min 2); email; password (min 8); confirmPassword; refine ensures match
9. Known Issues / TODOs
Roman Urdu: Clean hai — koi TODO/FIXME/HACK comment nahi. Sirf ek console.error (error boundary mein, intentional) aur bohot saare "demo"/"mock" markers — jo expected hain ek frontend MVP mein.

No TODO/FIXME/HACK/XXX comments anywhere in src/ or tests/
1 console.error — src/app/error.tsx:21 (intentional, error logging — has a comment noting Sentry hook point)
No console.log/warn/info
Mock markers (expected): data.ts (data layer), AuthForm.tsx (mock auth), Newsletter.tsx/Footer.tsx (mock submit), checkout/page.tsx (demo Stripe), ReviewsSection.tsx (derived distribution)
No Phase 2 markers in code (only in README)
10. What's NOT Done Yet (Backend Gap)
Roman Urdu: Frontend ~95% complete hai. Saara backend half missing hai — yeh ek "frontend MVP on mock data" hai. Original spec ka backend portion abhi tak implement nahi.

Missing Area	Detail
MongoDB + Mongoose	No DB, no models, no connection. Types in types/index.ts mirror schema but nothing persists server-side
NextAuth.js	Auth is mock (AuthForm simulates delay, no session/cookie/JWT)
Stripe	Checkout is pure UI mock — no SDK, no sessions, no webhooks, no real charge
Socket.IO	Not installed. No real-time stock, no admin notifications, no live chat, no order-status push
Admin Panel	0 of 6 sub-features (no dashboard, no product CRUD, no order management, no customers, no live notifications, no coupon management)
Email (Resend/Nodemailer)	No email sending (order confirmations, shipping updates)
Image storage (Cloudinary/S3)	All images are hardcoded Unsplash URLs (only those 2 domains whitelisted in next.config.mjs)
API Routes / Server Actions	None exist — everything reads from in-memory data.ts
Order persistence	Checkout clears cart + shows confetti, but orders aren't saved anywhere; account orders are canned MOCK_ORDERS
Cart DB sync	localStorage only — no DB sync for logged-in users
Deployment	Code is Vercel-ready, but nothing deployed; no Atlas DB
Persistence Reality Check
State	Persists?	Across devices?
Cart contents	✅ localStorage	❌
Wishlist	✅ localStorage	❌
Theme	✅ localStorage	❌
Orders	❌ resets on reload	❌
Auth	❌ mock only	❌
📌 Summary for Future Context
LUMEN is a polished Next.js 14 App Router frontend (animations, a11y, SEO, perf, tests — all genuinely strong) sitting on mock data in src/lib/data.ts. Everything a user can see and click works beautifully. Everything requiring a server/DB/payments/realtime is faked or absent. The types in src/types/index.ts are deliberately shaped to match the future MongoDB schema, so backend integration is structurally prepared. To make it "full-stack per original spec", the work is concentrated entirely in: (1) MongoDB + NextAuth + Stripe, (2) Admin Panel, (3) Socket.IO real-time, (4) email + image hosting.

Yeh summary aapki future AI conversations mein seedha context ke taur pe use karne ke liye ready hai. Agar chahiye toh isay ek PROJECT_CONTEXT.md file mein persist kar dun taake repo ke andar rahe — woh e