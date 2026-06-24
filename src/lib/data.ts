import type { Category, Order, Product, Review } from "@/types";

/**
 * Mock data layer.
 *
 * Shape mirrors the eventual MongoDB collections so the frontend MVP can be
 * swapped onto a real API later with minimal churn. All images use stable
 * Unsplash URLs that the next.config remotePatterns allow.
 */

const COLORS = {
  tripleBlack: { name: "Triple Black", hex: "#0a0a0a" },
  offWhite: { name: "Off White", hex: "#f1f1f0" },
  lime: { name: "Volt", hex: "#d4ff3f" },
  slate: { name: "Slate Grey", hex: "#5b6470" },
  sand: { name: "Sand", hex: "#d8c4a8" },
  crimson: { name: "Crimson", hex: "#b3202a" },
  royal: { name: "Royal", hex: "#2746c9" },
  forest: { name: "Forest", hex: "#1f3d2b" },
};

const REVIEW_POOL: Omit<Review, "id">[] = [
  { author: "Marcus T.", rating: 5, title: "Exceeded expectations", comment: "The build quality is unreal. Worth every cent — feels like it was engineered, not assembled.", date: "2026-05-12" },
  { author: "Priya S.", rating: 5, title: "Daily driver", comment: "Wore them straight out the box for a full day. Zero break-in. Lightweight and snappy.", date: "2026-05-03" },
  { author: "Diego R.", rating: 4, title: "Great, runs slightly small", comment: "Size up half a size. Otherwise perfect. The cushioning is on another level.", date: "2026-04-21" },
  { author: "Aiko M.", rating: 5, title: "Cinematic", comment: "These turn heads. The detail in the stitching is something you don't expect at this price.", date: "2026-04-09" },
  { author: "Liam K.", rating: 5, title: "Pro athlete approved", comment: "I train in these five days a week. Responsive, locked-in, and they still look fresh months in.", date: "2026-03-30" },
  { author: "Noor H.", rating: 4, title: "Premium feel", comment: "Materials are top tier. Knocked one star because shipping took a week, but the product is flawless.", date: "2026-03-18" },
];

function reviews(seed: number, count: number): Review[] {
  return Array.from({ length: count }).map((_, i) => ({
    ...REVIEW_POOL[(seed + i) % REVIEW_POOL.length],
    id: `rv_${seed}_${i}`,
  }));
}

function img(id: string, w = 1200, h = 1200) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
}

export const CATEGORIES: { id: Category; label: string; description: string; image: string }[] = [
  { id: "footwear",    label: "Footwear",    description: "Engineered for motion.",     image: img("photo-1542291026-7eec264c27ff", 800, 1067) },
  { id: "apparel",     label: "Apparel",     description: "Layered for performance.",   image: img("photo-1516826957135-700dedea698c", 800, 1067) },
  { id: "accessories", label: "Accessories", description: "The finishing detail.",       image: img("photo-1556306535-0f09a537f0a3", 800, 1067) },
  { id: "equipment",   label: "Equipment",   description: "Built for the grind.",        image: img("photo-1571019614242-c5c5dee9f50b", 800, 1067) },
];

export const PRODUCTS: Product[] = [
  // ── FOOTWEAR ──────────────────────────────────────────────
  {
    id: "p_001",
    slug: "aether-flight-1",
    name: "Aether Flight 1",
    tagline: "The flagship runner.",
    description:
      "The Aether Flight 1 redefines what a performance runner can be. A full-length carbon plate pairs with our reactive AetherFoam™ midsole for energy return you can feel in every stride.",
    price: 220,
    compareAtPrice: 260,
    category: "footwear",
     images: [
      { src: img("photo-1600269452121-4f2416e55c28"), alt: "Aether Flight 1 side profile" },
      { src: img("photo-1539185441755-769473a23570"), alt: "Aether Flight 1 top view" },
      { src: img("photo-1491553895911-0055eca6402d"), alt: "Aether Flight 1 heel detail" },
      { src: img("photo-1560769629-975ec94e6a86"), alt: "Aether Flight 1 sole" },
    ],
    colors: [COLORS.tripleBlack, COLORS.lime, COLORS.offWhite],
    sizes: ["7", "8", "9", "9.5", "10", "10.5", "11", "12"],
    stock: 4,
    rating: 4.8,
    reviewCount: 326,
    reviews: reviews(1, 4),
    badges: ["Best Seller"],
    featured: true,
    createdAt: "2026-01-15",
  },
  {
    id: "p_002",
    slug: "velocity-pro",
    name: "Velocity Pro",
    tagline: "Built for the marathoner in you.",
    description:
      "Tested over 10,000 km of road and trail, the Velocity Pro is a distance weapon. A wider base delivers stability when fatigue sets in.",
    price: 180,
    category: "footwear",
    images: [
      { src: img("photo-1460353581641-37baddab0fa2"), alt: "Velocity Pro side" },
      { src: img("photo-1575537302964-96cd47c06b1b"), alt: "Velocity Pro on foot" },
      { src: img("photo-1508738408489-c169f15ac65a"), alt: "Velocity Pro sole detail" },
    ],
    colors: [COLORS.slate, COLORS.crimson, COLORS.tripleBlack],
    sizes: ["7", "8", "9", "10", "11", "12", "13"],
    stock: 18,
    rating: 4.6,
    reviewCount: 142,
    reviews: reviews(2, 3),
    badges: ["New"],
    featured: true,
    createdAt: "2026-05-02",
  },
  {
    id: "p_003",
    slug: "summit-trainer",
    name: "Summit Trainer",
    tagline: "Versatility, dialed in.",
    description:
      "From box jumps to barbell, the Summit Trainer handles it. A flat, grippy outsole grounds you for lifts while the flexible forefoot lets you move freely.",
    price: 140,
    category: "footwear",
    images: [
      { src: img("photo-1543508282-6319a3e2621f"), alt: "Summit Trainer front" },
      { src: img("photo-1552346154-21d32810aba3"), alt: "Summit Trainer side" },
      { src: img("photo-1587563871167-1ee9c731aefb"), alt: "Summit Trainer detail" },
    ],
    colors: [COLORS.offWhite, COLORS.forest, COLORS.tripleBlack],
    sizes: ["8", "9", "10", "11", "12"],
    stock: 32,
    rating: 4.4,
    reviewCount: 88,
    reviews: reviews(3, 2),
    createdAt: "2026-02-20",
  },
  {
    id: "p_011",
    slug: "noir-low",
    name: "Noir Low",
    tagline: "Street-ready, gym-tested.",
    description:
      "A low-top lifestyle trainer that transitions seamlessly from the rack to the street. Cushioned for all-day wear, structured for lateral cuts.",
    price: 165,
    category: "footwear",
    images: [
      { src: img("photo-1551107696-a4b0c5a0d9a2"), alt: "Noir Low side" },
      { src: img("photo-1519002078-be7f2055d0a6"), alt: "Noir Low heel" },
      { src: img("photo-1584735175315-9d5df23be620"), alt: "Noir Low top view" },
    ],
    colors: [COLORS.tripleBlack, COLORS.offWhite],
    sizes: ["7", "8", "9", "9.5", "10", "10.5", "11", "12"],
    stock: 22,
    rating: 4.5,
    reviewCount: 108,
    reviews: reviews(5, 3),
    createdAt: "2026-04-12",
  },

  // ── APPAREL ───────────────────────────────────────────────
  {
    id: "p_004",
    slug: "lumen-tech-tee",
    name: "Lumen Tech Tee",
    tagline: "Weightless, ruthless on sweat.",
    description:
      "A proprietary moisture-wicking weave pulls sweat from your skin instantly. Laser-cut ventilation maps your body's hot zones. Zero chafe, all performance.",
    price: 65,
    category: "apparel",
   images: [
      { src: img("photo-1521572163474-6864f9cf17ab"), alt: "Lumen Tech Tee front" },
      { src: img("photo-1571455786673-9d9d6c194f90"), alt: "Lumen Tech Tee back" },
      { src: img("photo-1583743814966-8936f5b7be1a"), alt: "Lumen Tech Tee fabric detail" },
    ],
    colors: [COLORS.tripleBlack, COLORS.offWhite, COLORS.lime],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    stock: 120,
    rating: 4.7,
    reviewCount: 211,
    reviews: reviews(4, 3),
    badges: ["Best Seller"],
    featured: true,
    createdAt: "2026-03-10",
  },
  {
    id: "p_005",
    slug: "arc-track-jacket",
    name: "Arc Track Jacket",
    tagline: "Weather-sealed warmth.",
    description:
      "A tapered full-zip track jacket with bonded seams and DWR water-repellent finish. The brushed interior traps heat without bulk.",
    price: 145,
    compareAtPrice: 175,
    category: "apparel",
    images: [
      { src: img("photo-1622470953794-aa9c70b0fb9d"), alt: "Arc Track Jacket front" },
      { src: img("photo-1548036328-c9fa89d128fa"), alt: "Arc Track Jacket side" },
      { src: img("photo-1604237395850-2e9a7fa0fffa"), alt: "Arc Track Jacket back" },
    ],
    colors: [COLORS.tripleBlack, COLORS.slate, COLORS.sand],
    sizes: ["S", "M", "L", "XL"],
    stock: 9,
    rating: 4.5,
    reviewCount: 64,
    reviews: reviews(5, 2),
    badges: ["Sale"],
    createdAt: "2026-04-01",
  },
  {
    id: "p_006",
    slug: "drift-shorts",
    name: "Drift 7\" Shorts",
    tagline: "Move without limits.",
    description:
      "A 7-inch inseam in four-way stretch fabric with a built-in liner. Zip pocket, flat elastic waistband. Your new do-everything short.",
    price: 58,
    category: "apparel",
    images: [
      { src: img("photo-1560243563-062bfc001d68"), alt: "Drift Shorts front" },
      { src: img("photo-1591195853828-11db59a44f6b"), alt: "Drift Shorts side" },
    ],
    colors: [COLORS.tripleBlack, COLORS.royal, COLORS.slate],
    sizes: ["S", "M", "L", "XL"],
    stock: 75,
    rating: 4.3,
    reviewCount: 47,
    reviews: reviews(6, 2),
    createdAt: "2026-02-28",
  },
  {
    id: "p_012",
    slug: "drift-hoodie",
    name: "Drift Hoodie",
    tagline: "Heavyweight comfort, zero bulk.",
    description:
      "A heavyweight brushed-fleece hoodie with a relaxed fit and ribbed cuffs. Kangaroo pocket, adjustable drawcord hood, reinforced stitching at stress points.",
    price: 98,
    category: "apparel",
    images: [
      { src: img("photo-1556821840-3a63f95609a7"), alt: "Drift Hoodie front" },
      { src: img("photo-1579572331145-5e53b299c64e"), alt: "Drift Hoodie back" },
      { src: img("photo-1578768079052-aa76e52ff62e"), alt: "Drift Hoodie hood detail" },
    ],
    colors: [COLORS.tripleBlack, COLORS.slate, COLORS.sand],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 48,
    rating: 4.4,
    reviewCount: 56,
    reviews: reviews(6, 2),
    badges: ["New"],
    createdAt: "2026-05-25",
  },

  // ── ACCESSORIES ───────────────────────────────────────────
  {
    id: "p_007",
    slug: "horizon-cap",
    name: "Horizon Cap",
    tagline: "Built for the long run.",
    description:
      "A featherlight running cap with UPF 50+ protection and a moisture-channel sweatband. Adjustable back, zero bounce.",
    price: 38,
    category: "accessories",
    images: [
      { src: img("photo-1588850561407-ed78c282e89b"), alt: "Horizon Cap front" },
      { src: img("photo-1521369909029-2afed882baee"), alt: "Horizon Cap side" },
      { src: img("photo-1534215754734-18e55d13e346"), alt: "Horizon Cap back" },
    ],
    colors: [COLORS.offWhite, COLORS.tripleBlack, COLORS.lime],
    sizes: ["One Size"],
    stock: 200,
    rating: 4.6,
    reviewCount: 39,
    reviews: reviews(1, 2),
    badges: ["New"],
    createdAt: "2026-05-18",
  },
  {
    id: "p_008",
    slug: "pulse-bottle",
    name: "Pulse Insulated Bottle",
    tagline: "Cold for 24 hours.",
    description:
      "Triple-wall vacuum insulation. Leak-proof flip-top lid. Powder-coated grip. 750ml of uncompromising hydration.",
    price: 42,
    category: "accessories",
    images: [
      { src: img("photo-1602143407151-7111542de6e8"), alt: "Pulse Bottle front" },
      { src: img("photo-1589365278144-c9e705f843ba"), alt: "Pulse Bottle cap detail" },
      { src: img("photo-1504707748692-419802cf939d"), alt: "Pulse Bottle lifestyle" },
    ],
    colors: [COLORS.tripleBlack, COLORS.lime, COLORS.sand],
    sizes: ["750ml"],
    stock: 150,
    rating: 4.9,
    reviewCount: 178,
    reviews: reviews(2, 3),
    badges: ["Best Seller"],
    createdAt: "2026-01-30",
  },
  {
    id: "p_013",
    slug: "lumen-gym-bag",
    name: "Lumen Gym Bag",
    tagline: "Everything in its place.",
    description:
      "35L capacity with a vented shoe compartment, wet pocket, and laptop sleeve. Water-resistant 600D shell with padded carry handles and a removable shoulder strap.",
    price: 95,
    category: "accessories",
    images: [
      { src: img("photo-1553062407-98eeb64c6a62"), alt: "Lumen Gym Bag front" },
      { src: img("photo-1547949003-9792a18a2601"), alt: "Lumen Gym Bag open" },
      { src: img("photo-1622560480605-d83c853bc5c3"), alt: "Lumen Gym Bag detail" },
    ],
    colors: [COLORS.tripleBlack, COLORS.slate],
    sizes: ["35L"],
    stock: 60,
    rating: 4.7,
    reviewCount: 83,
    reviews: reviews(3, 2),
    badges: ["New"],
    createdAt: "2026-05-10",
  },

  // ── EQUIPMENT ─────────────────────────────────────────────
  {
    id: "p_009",
    slug: "forge-dumbbell-set",
    name: "Forge Adjustable Dumbbells",
    tagline: "A full rack, in one pair.",
    description:
      "Dial from 5 to 52.5 lbs per hand in seconds. Knurled steel handle, compact cradle. The last home-gym investment you'll make.",
    price: 549,
    compareAtPrice: 629,
    category: "equipment",
    images: [
      { src: img("photo-1638536532686-d610adfc8e5c"), alt: "Forge Dumbbells on rack" },
      { src: img("photo-1517836357463-d25dfeac3438"), alt: "Forge Dumbbells in use" },
      { src: img("photo-1583454110551-21f2fa2afe61"), alt: "Forge Dumbbells detail" },
    ],
    colors: [COLORS.tripleBlack, COLORS.slate],
    sizes: ["5–52.5 lb"],
    stock: 7,
    rating: 4.8,
    reviewCount: 92,
    reviews: reviews(3, 3),
    badges: ["Limited"],
    createdAt: "2026-03-22",
  },
  {
    id: "p_010",
    slug: "apex-jump-rope",
    name: "Apex Speed Rope",
    tagline: "Double-unders made easy.",
    description:
      "Precision-weighted with ball-bearing handles for frictionless rotation. Adjustable steel cable, compact for travel, built for daily use.",
    price: 49,
    category: "equipment",
    images: [
      { src: img("photo-1598289431512-b97b0917affc"), alt: "Apex Speed Rope coiled" },
      { src: img("photo-1598971861713-54ad16a7e72e"), alt: "Apex Speed Rope handle detail" },
    ],
    colors: [COLORS.tripleBlack, COLORS.lime],
    sizes: ["Adjustable"],
    stock: 85,
    rating: 4.7,
    reviewCount: 134,
    reviews: reviews(4, 2),
    createdAt: "2026-02-05",
  },
  {
    id: "p_014",
    slug: "obsidian-yoga-mat",
    name: "Obsidian Yoga Mat",
    tagline: "Grip that doesn't quit.",
    description:
      "6mm natural rubber base with a microfiber top layer that absorbs sweat and improves grip mid-flow. Alignment guides printed in UV-resistant ink. Includes carry strap.",
    price: 88,
    category: "equipment",
    images: [
      { src: img("photo-1601901528942-b86f0f90c293"), alt: "Obsidian Yoga Mat rolled" },
      { src: img("photo-1518611012118-696072aa579a"), alt: "Obsidian Yoga Mat flat" },
      { src: img("photo-1540497077202-7c8a3999166f"), alt: "Obsidian Yoga Mat in use" },
    ],
    colors: [COLORS.tripleBlack, COLORS.slate, COLORS.forest],
    sizes: ["Standard"],
    stock: 44,
    rating: 4.6,
    reviewCount: 71,
    reviews: reviews(5, 2),
    badges: ["New"],
    createdAt: "2026-04-18",
  },
];

// --- Mock orders (for the account demo) ---
export const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-7741",
    date: "2026-06-12",
    status: "Delivered",
    total: 285,
    shippingAddress: {
      fullName: "Alex Rivera",
      line1: "418 Pine Street, Apt 7B",
      city: "Brooklyn",
      state: "NY",
      zip: "11215",
      country: "USA",
    },
    items: [
      {
        productId: "p_001",
        slug: "aether-flight-1",
        name: "Aether Flight 1",
          image: img("photo-1600269452121-4f2416e55c28", 200, 200),
        price: 220,
        color: "Triple Black",
        size: "10.5",
        quantity: 1,
      },
      {
        productId: "p_007",
        slug: "horizon-cap",
        name: "Horizon Cap",
        image: img("photo-1588850561407-ed78c282e89b", 200, 200),
        price: 38,
        color: "Off White",
        size: "One Size",
        quantity: 1,
      },
    ],
  },
  {
    id: "ORD-7802",
    date: "2026-06-18",
    status: "Shipped",
    total: 65,
    shippingAddress: {
      fullName: "Alex Rivera",
      line1: "418 Pine Street, Apt 7B",
      city: "Brooklyn",
      state: "NY",
      zip: "11215",
      country: "USA",
    },
    items: [
      {
        productId: "p_004",
        slug: "lumen-tech-tee",
        name: "Lumen Tech Tee",
        image: img("photo-1521572163474-6864f9cf17ab", 200, 200),
        price: 65,
        color: "Triple Black",
        size: "M",
        quantity: 1,
      },
    ],
  },
];

export const MOCK_COUPONS = [
  { code: "WELCOME10", discountPercentage: 10, expiryDate: "2026-12-31", usageLimit: 1000 },
  { code: "FLIGHT20", discountPercentage: 20, expiryDate: "2026-07-31", usageLimit: 500 },
];

// --- Accessors (stand in for future API calls) ---
export function getAllProducts(): Product[] {
  return PRODUCTS;
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  )
    .slice(0, limit)
    .concat(
      PRODUCTS.filter((p) => p.id !== product.id && p.category !== product.category)
    )
    .slice(0, limit);
}

export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter((p) => p.featured);
}

export function getNewArrivals(limit = 8): Product[] {
  return [...PRODUCTS]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, limit);
}

export function getBestSellers(limit = 8): Product[] {
  return [...PRODUCTS]
    .filter((p) => p.rating >= 4.5)
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, limit);
}