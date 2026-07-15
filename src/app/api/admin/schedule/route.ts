import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const slots = await prisma.scheduleSlot.findMany({
      orderBy: { date: "asc" },
    });
    return NextResponse.json(slots);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch schedule slots" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { date, timeStart, timeEnd, type, title, totalSeats, isActive } = body;

    if (!date || !timeStart || !timeEnd || !type || !title) {
      return NextResponse.json({ error: "date, timeStart, timeEnd, type, and title are required" }, { status: 400 });
    }

    const slot = await prisma.scheduleSlot.create({
      data: {
        date,
        timeStart,
        timeEnd,
        type,
        title,
        totalSeats: totalSeats ?? 1,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create schedule slot" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, date, timeStart, timeEnd, type, title, totalSeats, bookedSeats, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Slot id is required" }, { status: 400 });
    }

    const existing = await prisma.scheduleSlot.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    const slot = await prisma.scheduleSlot.update({
      where: { id },
      data: { date, timeStart, timeEnd, type, title, totalSeats, bookedSeats, isActive },
    });

    return NextResponse.json(slot);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update schedule slot" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Slot id is required" }, { status: 400 });
    }

    const existing = await prisma.scheduleSlot.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    await prisma.scheduleSlot.delete({ where: { id } });
    return NextResponse.json({ message: "Slot deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete schedule slot" }, { status: 500 });
  }
}
