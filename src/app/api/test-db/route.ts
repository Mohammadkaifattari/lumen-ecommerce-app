import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();
    return Response.json({ status: "✅ MongoDB connected successfully" });
  } catch (err: any) {
    return Response.json(
      { status: "❌ Connection failed", error: err.message },
      { status: 500 }
    );
  }
}