import { NextResponse } from "next/server";
import { Paddle, Environment } from "@paddle/paddle-node-sdk";
import { prisma } from "@/lib/prisma";

// ─── Validate secrets at module load ──────────────────────────────────────────
if (!process.env.PADDLE_API_KEY) {
  console.error("❌ PADDLE_API_KEY is not set. Webhooks will fail.");
}
if (!process.env.PADDLE_WEBHOOK_SECRET) {
  console.error("❌ PADDLE_WEBHOOK_SECRET is not set. Signature verification will fail.");
}

const paddle = new Paddle(process.env.PADDLE_API_KEY || "", {
  environment:
    process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "sandbox"
      ? Environment.sandbox
      : Environment.production,
});

export async function POST(req: Request) {
  const signature = req.headers.get("paddle-signature") || "";
  const rawBody = await req.text();
  const secret = process.env.PADDLE_WEBHOOK_SECRET || "";

  // ─── Step 1: Reject unsigned or misconfigured requests ─────────────
  if (!signature) {
    console.error("Paddle webhook received without signature header.");
    return NextResponse.json(
      { error: "Missing signature." },
      { status: 401 }
    );
  }

  if (!secret) {
    console.error("PADDLE_WEBHOOK_SECRET is not configured on the server.");
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    );
  }

  // ─── Step 2: Verify signature via Paddle SDK ───────────────────────
  let event;
  try {
    event = await paddle.webhooks.unmarshal(rawBody, secret, signature);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Paddle webhook signature verification FAILED:", message);
    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 401 }
    );
  }

  if (!event) {
    return NextResponse.json(
      { error: "Could not parse event." },
      { status: 400 }
    );
  }

  console.log("✅ Verified Paddle Event:", event.eventType);

  // ─── Step 3: Handle subscription events with idempotency ───────────
  try {
    if (
      event.eventType === "subscription.created" ||
      event.eventType === "subscription.updated" ||
      event.eventType === "subscription.activated"
    ) {
      const data = event.data as unknown as Record<string, unknown>;
      const customData = data.customData as Record<string, string> | undefined;
      const userId = customData?.userId;
      const status = data.status as string | undefined;

      if (!userId) {
        console.warn("Paddle event missing customData.userId — skipping.");
        return NextResponse.json({ success: true, skipped: true });
      }

      // Idempotency: Check current state before mutating
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { isPro: true },
      });

      if (!existingUser) {
        console.warn(`Paddle webhook: User ${userId} not found in database.`);
        // Return 200 to prevent Paddle from retrying for a non-existent user
        return NextResponse.json({ success: true, skipped: true });
      }

      if (status === "active" || status === "trialing") {
        if (existingUser.isPro) {
          console.log(`User ${userId} is already PRO — idempotent no-op.`);
        } else {
          await prisma.user.update({
            where: { id: userId },
            data: { isPro: true },
          });
          console.log(`User ${userId} upgraded to PRO (Status: ${status}).`);
        }
      } else if (status === "canceled" || status === "past_due" || status === "paused") {
        if (!existingUser.isPro) {
          console.log(`User ${userId} is already free-tier — idempotent no-op.`);
        } else {
          await prisma.user.update({
            where: { id: userId },
            data: { isPro: false },
          });
          console.log(`User ${userId} downgraded from PRO (Status: ${status}).`);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Paddle webhook handler error:", message);
    // Return 500 so Paddle retries the event
    return NextResponse.json(
      { error: "Internal processing error." },
      { status: 500 }
    );
  }
}
