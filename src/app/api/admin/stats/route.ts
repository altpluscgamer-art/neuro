import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
      totalUsers,
      totalScreenings,
      totalBookings,
      pendingConsultations,
      recentBookings,
      recentScreenings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.screeningResult.count(),
      prisma.booking.count(),
      prisma.consultationRequest.count({ where: { status: "new" } }),
      prisma.booking.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { user: true, slot: true } }),
      prisma.screeningResult.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { user: true } }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalScreenings,
      totalBookings,
      pendingConsultations,
      recentBookings,
      recentScreenings,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
