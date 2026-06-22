// Domain types — mirror the MongoDB schema shape described in the spec,
// so the frontend MVP can later be wired to a real API without churn.

export type Category =
  | "footwear"
  | "apparel"
  | "accessories"
  | "equipment";

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductImage {
  src: string;
  alt: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  date: string; // ISO
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  compareAtPrice?: number; // for "sale" display
  category: Category;
  images: ProductImage[];
  colors: ProductColor[];
  sizes: string[];
  stock: number;
  rating: number; // 0-5
  reviewCount: number;
  reviews?: Review[];
  badges?: string[]; // e.g. "New", "Best Seller", "Limited"
  featured?: boolean;
  createdAt: string; // ISO
}

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
}

export interface Address {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  date: string;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  total: number;
  items: CartLine[];
  shippingAddress: Address;
}

export interface Coupon {
  code: string;
  discountPercentage: number;
  expiryDate: string;
  usageLimit: number;
}
