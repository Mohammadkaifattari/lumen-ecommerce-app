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

export async function DELETE(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const deleted = await ProductModel.findOneAndDelete({ slug: params.slug });
    if (!deleted) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }
    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json(
      { error: "Failed to delete product", details: err.message },
      { status: 500 }
    );
  }
}
  export async function PUT(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const body = await req.json();
    const updated = await ProductModel.findOneAndUpdate(
      { slug: params.slug },
      body,
      { new: true }
    );
    if (!updated) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }
    return Response.json({ ...updated.toObject(), id: updated._id.toString(), _id: undefined });
  } catch (err: any) {
    return Response.json(
      { error: "Failed to update product", details: err.message },
      { status: 500 }
    );
  }
}