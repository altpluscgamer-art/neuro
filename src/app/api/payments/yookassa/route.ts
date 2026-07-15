import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getSetting } from "@/lib/settings";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, userId } = body;

    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const [shopId, secretKey, testMode] = await Promise.all([
      getSetting("yookassa_shop_id"),
      getSetting("yookassa_secret_key"),
      getSetting("yookassa_test_mode"),
    ]);

    if (!shopId || !secretKey) {
      return NextResponse.json({ error: "YooKassa not configured" }, { status: 500 });
    }

    const internalUserId = userId ?? (session.user as any).id;

    const payment = await prisma.payment.create({
      data: {
        userId: internalUserId,
        courseId,
        amount: course.price,
        status: "pending",
        provider: "yookassa",
      },
    });

    const credentials = Buffer.from(`${shopId}:${secretKey}`).toString("base64");

    const yookassaBody: Record<string, any> = {
      amount: {
        value: String(course.price),
        currency: "RUB",
      },
      confirmation: {
        type: "redirect",
        return_url: "https://neuro.ru/courses",
      },
      capture: true,
      description: `Оплата курса: ${course.title}`,
      metadata: {
        paymentId: payment.id,
      },
    };

    if (testMode === "true") {
      yookassaBody.test = true;
    }

    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
        "Idempotence-Key": payment.id,
      },
      body: JSON.stringify(yookassaBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "failed" },
      });
      return NextResponse.json(
        { error: "YooKassa payment creation failed", details: errorData },
        { status: 502 }
      );
    }

    const result = await response.json();

    const confirmationUrl = result.confirmation?.confirmation_url;
    const providerId = result.id;

    await prisma.payment.update({
      where: { id: payment.id },
      data: { providerId },
    });

    return NextResponse.json({
      confirmationUrl,
      paymentId: payment.id,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
