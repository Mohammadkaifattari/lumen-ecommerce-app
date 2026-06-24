import { connectDB } from "@/lib/mongodb";
import { ProductModel } from "@/models/Product";

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