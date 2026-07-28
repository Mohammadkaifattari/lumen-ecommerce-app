import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-04-30.basil" as any,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(amount * 100), // cents mein
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}