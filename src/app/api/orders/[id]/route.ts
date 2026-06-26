import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { OrderModel } from "@/models/Order";
import { UserModel } from "@/models/User";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    ).lean() as any;

    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { pusherServer } = await import('@/lib/pusher');
    await pusherServer.trigger('orders-channel', 'order-status-updated', {
      orderId: params.id,
      status,
    });
    await pusherServer.trigger('admin-channel', 'order-updated', {
      orderId: params.id,
      status,
      total: order.total,
    });

    // User email
    if (order.userId) {
      const user = await UserModel.findById(order.userId).lean() as any;
      if (user?.email) {
        await resend.emails.send({
          from: "LUMEN <onboarding@resend.dev>",
          to: user.email,
          subject: `Your order status: ${status}`,
          html: `
            <div style="font-family:sans-serif;max-width:500px;margin:auto">
              <h2 style="letter-spacing:0.2em">LUMEN</h2>
              <p>Hi ${user.name},</p>
              <p>Your order <strong>#${params.id}</strong> has been updated to: <strong>${status}</strong></p>
              <p>Total: $${order.total.toFixed(2)}</p>
              <br/>
              <a href="${process.env.NEXTAUTH_URL}/account" style="background:#000;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none">View Order</a>
              <br/><br/>
              <p style="color:#999;font-size:12px">LUMEN — Premium Store</p>
            </div>
          `,
        });
      }
    }

    return NextResponse.json(order);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}