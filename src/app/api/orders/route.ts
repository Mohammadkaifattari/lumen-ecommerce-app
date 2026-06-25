import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { OrderModel } from "@/models/Order";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }
    const body = await req.json();
    await connectDB();

    const order = await OrderModel.create({
      userId: session?.user?.id ?? null,
      status: "Processing",
      total: body.total,
      items: body.items,
      shippingAddress: body.shippingAddress,
    });

    // Socket.IO — admin ko notify karo
const { pusherServer } = await import('@/lib/pusher');
await pusherServer.trigger('admin-channel', 'new-order', {
  orderId: order._id,
  total: body.total,
  items: body.items,
});

return NextResponse.json({ success: true, orderId: order._id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ orders: [] });
    }

    await connectDB();

    const isAdmin = (session.user as any).role === 'admin';
    const orders = isAdmin
      ? await OrderModel.find({}).sort({ createdAt: -1 }).lean()
      : await OrderModel.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ orders });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ orders: [] }, { status: 500 });
  }
}