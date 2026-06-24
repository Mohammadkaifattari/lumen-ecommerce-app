import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { OrderModel } from "@/models/Order";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { status } = await req.json();

    const order = await OrderModel.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    ).lean();

    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (global.io) {
    global.io.emit('order-status-updated', {
      orderId: params.id,
      status,
    });
  }

  return NextResponse.json(order);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}