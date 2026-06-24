import { connectDB } from "@/lib/mongodb";
import { ProductModel } from "@/models/Product";
import type { Product } from "@/types";

function mapProduct(doc: any): Product {
  const { _id, __v, ...rest } = doc;
  return { ...rest, id: _id.toString() } as Product;
}

export async function getAllProducts(): Promise<Product[]> {
  await connectDB();
  const docs = await ProductModel.find({}).lean();
  return docs.map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await connectDB();
  const doc = await ProductModel.findOne({ slug }).lean();
  return doc ? mapProduct(doc) : null;
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  await connectDB();
  const sameCategory = await ProductModel.find({
    category: product.category,
    _id: { $ne: product.id },
  })
    .limit(limit)
    .lean();

  let related = sameCategory.map(mapProduct);

  if (related.length < limit) {
    const others = await ProductModel.find({
      _id: { $ne: product.id },
      category: { $ne: product.category },
    })
      .limit(limit - related.length)
      .lean();
    related = related.concat(others.map(mapProduct));
  }

  return related.slice(0, limit);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  await connectDB();
  const docs = await ProductModel.find({ featured: true }).lean();
  return docs.map(mapProduct);
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  await connectDB();
  const docs = await ProductModel.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return docs.map(mapProduct);
}

export async function getBestSellers(limit = 8): Promise<Product[]> {
  await connectDB();
  const docs = await ProductModel.find({ rating: { $gte: 4.5 } })
    .sort({ reviewCount: -1 })
    .limit(limit)
    .lean();
  return docs.map(mapProduct);
}