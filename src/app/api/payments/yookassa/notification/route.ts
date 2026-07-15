import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import prisma from "@/lib/prisma";
import { getSetting } from "@/lib/settings";

export async function POST(request: Request) {
  try {
    const secretKey = await getSetting("yookassa_secret_key");
    if (!secretKey) {
      return NextResponse.json({ error: "YooKassa not configured" }, { status: 500 });
    }

    const body = await request.text();

    const signature = request.headers.get("x-yookassa-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 403 });
    }

    const expectedSignature = createHmac("sha256", secretKey).update(body).digest("hex");
    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const event = JSON.parse(body);
    const payment = event.object;

    if (!payment?.metadata?.paymentId) {
      return NextResponse.json({ error: "Missing paymentId in metadata" }, { status: 400 });
    }

    if (payment.status === "succeeded") {
      await prisma.payment.update({
        where: { id: payment.metadata.paymentId },
        data: {
          status: "succeeded",
          providerId: payment.id,
        },
      });
    } else if (payment.status === "canceled") {
      await prisma.payment.update({
        where: { id: payment.metadata.paymentId },
        data: {
          status: "canceled",
          providerId: payment.id,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Notification processing failed" }, { status: 500 });
  }
}
