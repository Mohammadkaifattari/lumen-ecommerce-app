import { connectDB } from "@/lib/mongodb";
import { ProductModel } from "@/models/Product";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const product = await ProductModel.findOne({ slug: params.slug }).lean();

    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    const mapped = {
      ...(product as any),
      id: (product as any)._id.toString(),
      _id: undefined,
    };

    return Response.json(mapped);
  } catch (err: any) {
    return Response.json(
      { error: "Failed to fetch product", details: err.message },
      { status: 500 }
    );
  }
}