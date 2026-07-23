import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notifyConsultationRequest } from "@/lib/notifications";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const requests = await prisma.consultationRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(requests);
  } catch {
    return NextResponse.json({ error: "Failed to fetch consultation requests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, name, email, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    const consultationRequest = await prisma.consultationRequest.create({
      data: { userId: userId || null, name, email, phone: phone || null, message, status: "new" },
    });

    notifyConsultationRequest({
      id: consultationRequest.id,
      name,
      email,
      phone: phone || null,
      message,
    }).catch(() => {});

    return NextResponse.json(consultationRequest, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create consultation request" }, { status: 500 });
  }
}
