import mongoose, { Schema, models, model } from "mongoose";

const ProductColorSchema = new Schema(
  {
    name: { type: String, required: true },
    hex: { type: String, required: true },
  },
  { _id: false }
);

const ProductImageSchema = new Schema(
  {
    src: { type: String, required: true },
    alt: { type: String, required: true },
  },
  { _id: false }
);

const ReviewSchema = new Schema(
  {
    id: { type: String, required: true },
    author: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    comment: { type: String, required: true },
    date: { type: String, required: true },
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    category: {
      type: String,
      required: true,
      enum: ["footwear", "apparel", "accessories", "equipment"],
      index: true,
    },
    images: { type: [ProductImageSchema], required: true },
    colors: { type: [ProductColorSchema], required: true },
    sizes: { type: [String], required: true },
    stock: { type: Number, required: true, default: 0 },
    rating: { type: Number, required: true, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, required: true, default: 0 },
    reviews: { type: [ReviewSchema], default: [] },
    badges: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true } // adds createdAt + updatedAt automatically
);

// Re-use the model across hot reloads in dev instead of recompiling it.
export const ProductModel =
  models.Product || model("Product", ProductSchema);