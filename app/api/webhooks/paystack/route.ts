import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest("hex");

    const signature = req.headers.get("x-paystack-signature");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    // Handle the event
    if (event.event === "charge.success" || event.event === "subscription.create") {
      const { customer, plan } = event.data;
      const email = customer.email;
      const customerId = customer.customer_code || customer.id?.toString();
      const planCode = plan?.plan_code;

      if (email) {
        await prisma.user.update({
          where: { email },
          data: {
            isPro: true,
            usageCount: 0,
            paystackCustomerId: customerId,
            paystackPlan: planCode,
          },
        });
        console.log(`User ${email} upgraded to Pro via Paystack`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
