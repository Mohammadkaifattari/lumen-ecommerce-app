import { connectDB } from "@/lib/mongodb";
import { ProductModel } from "@/models/Product";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();
    const products = await ProductModel.find({}).lean();

    // Map Mongo's _id to a string `id` field so the frontend shape stays the same.
    const mapped = products.map((p: any) => ({
      ...p,
      id: p._id.toString(),
      _id: undefined,
    }));

    return Response.json(mapped);
  } catch (err: any) {
    return Response.json(
      { error: "Failed to fetch products", details: err.message },
      { status: 500 }
    );
  }
}
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const productData = {
      ...body,
      tagline: body.tagline || body.name,
      colors: body.colors || [],
      sizes: body.sizes || [],
      rating: body.rating || 0,
      reviewCount: body.reviewCount || 0,
      images: (body.images || []).map((src: string) =>
        typeof src === "string" ? { src, alt: body.name } : src
      ),
    };
    const product = await ProductModel.create(productData);
    return Response.json({ ...product.toObject(), id: product._id.toString(), _id: undefined });
  } catch (err: any) {
    return Response.json(
      { error: "Failed to create product", details: err.message },
      { status: 500 }
    );
  }
}