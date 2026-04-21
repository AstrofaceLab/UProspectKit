import { NextResponse } from "next/server";
import { Paddle, Environment } from "@paddle/paddle-node-sdk";
import { prisma } from "@/lib/prisma";

const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "sandbox" ? Environment.sandbox : Environment.production,
});

export async function POST(req: Request) {
  const signature = req.headers.get("paddle-signature") || "";
  const rawBody = await req.text();
  const secret = process.env.PADDLE_WEBHOOK_SECRET || "";

  try {
    if (!signature || !secret) {
      console.error("Missing signature or webhook secret");
      return NextResponse.json({ error: "Configuration error" }, { status: 400 });
    }

    const event = paddle.webhooks.unmarshal(rawBody, secret, signature);
    
    if (!event) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    console.log("Verified Paddle Event:", event.eventType);

    // Handle Subscription/Payment events
    // In Paddle Billing, subscription events usually contain the status
    if (
      event.eventType === "subscription.created" || 
      event.eventType === "subscription.updated" ||
      event.eventType === "subscription.activated"
    ) {
      const data = event.data as any;
      const userId = data.customData?.userId;
      const status = data.status;

      if (userId && (status === "active" || status === "trialing")) {
        await prisma.user.update({
          where: { id: userId },
          data: { isPro: true },
        });
        console.log(`User ${userId} successfully upgraded to PRO (Status: ${status})`);
      } else if (userId && (status === "canceled" || status === "past_due")) {
        await prisma.user.update({
          where: { id: userId },
          data: { isPro: false },
        });
        console.log(`User ${userId} downgraded from PRO (Status: ${status})`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Paddle Webhook Verification Failed:", err.message);
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }
}
