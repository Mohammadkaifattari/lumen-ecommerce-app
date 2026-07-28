import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { OrderModel } from "@/models/Order";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

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

    // Order confirmation email
    const userEmail = (session.user as any).email;
    const userName = (session.user as any).name ?? "Customer";
    if (userEmail) {
      await getResend().emails.send({
        from: "LUMEN <onboarding@resend.dev>",
        to: userEmail,
        subject: "Order Confirmed — LUMEN",
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px">
            <h2 style="letter-spacing:0.2em;margin-bottom:4px">LUMEN</h2>
            <p style="color:#666;margin-top:0">Premium Store</p>
            <h3>Order Confirmed ✓</h3>
            <p>Hi ${userName},</p>
            <p>Your order <strong>#${order._id}</strong> has been received and is now being processed.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              ${body.items.map((item: any) => `
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #eee">${item.name} <span style="color:#999">(${item.color}, ${item.size})</span></td>
                  <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">×${item.quantity}</td>
                </tr>
              `).join("")}
            </table>
            <p style="font-size:18px;font-weight:600">Total: $${body.total.toFixed(2)}</p>
            <a href="${process.env.NEXTAUTH_URL}/account" style="display:inline-block;background:#000;color:#fff;padding:12px 28px;border-radius:999px;text-decoration:none;margin-top:8px">View Order</a>
            <p style="color:#999;font-size:12px;margin-top:32px">LUMEN — You'll receive shipping updates by email.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true, orderId: order._id });  } catch (err) {
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