import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/mongodb";
import { OrderModel } from "@/models/Order";
import { Resend } from "resend";
export const runtime = "nodejs";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil" as any,
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;

    await connectDB();
    const order = await OrderModel.findOne({
      stripePaymentIntentId: intent.id,
    }).lean() as any;

    if (order) {
      await OrderModel.findByIdAndUpdate(order._id, { status: "Processing" });

      const { pusherServer } = await import("@/lib/pusher");
      await pusherServer.trigger("admin-channel", "new-order", {
        orderId: order._id,
        total: order.total,
      });
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent;
    console.error("Payment failed:", intent.id);
  }

  return NextResponse.json({ received: true });
}

