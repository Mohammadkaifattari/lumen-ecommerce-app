import { connectDB } from "@/lib/mongodb";
import { ProductModel } from "@/models/Product";
import { getAllProducts } from "@/lib/data";

export async function GET() {
  try {
    await connectDB();

    const products = getAllProducts();

    // Clear existing products so re-running this is idempotent.
    await ProductModel.deleteMany({});

    // Strip the mock `id` field — Mongo will generate its own _id.
    const docs = products.map(({ id, ...rest }) => rest);

    const inserted = await ProductModel.insertMany(docs);

    return Response.json({
      status: `✅ Seeded ${inserted.length} products`,
    });
  } catch (err: any) {
    return Response.json(
      { status: "❌ Seeding failed", error: err.message },
      { status: 500 }
    );
  }
}