import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { notifyBookingCreated } from "@/lib/notifications";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const bookings = await prisma.booking.findMany({
      include: { user: true, slot: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(bookings);
  } catch {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slotId, childName, childAge, notes, parentName, parentEmail, parentPhone } = body;

    if (!slotId || !childName || childAge == null) {
      return NextResponse.json(
        { error: "slotId, childName, and childAge are required" },
        { status: 400 }
      );
    }

    let userId: string;

    const session = await getServerSession(authOptions);
    if (session?.user) {
      userId = session.user.id;
    } else if (parentEmail) {
      const existing = await prisma.user.findUnique({ where: { email: parentEmail } });
      if (existing) {
        userId = existing.id;
      } else {
        const hashed = await bcrypt.hash(Math.random().toString(36), 10);
        const newUser = await prisma.user.create({
          data: {
            email: parentEmail,
            name: parentName || childName,
            password: hashed,
            phone: parentPhone || null,
            role: "parent",
          },
        });
        userId = newUser.id;
      }
    } else {
      const guestUser = await prisma.user.findFirst({ where: { email: "guest@neuro.local" } });
      if (guestUser) {
        userId = guestUser.id;
      } else {
        const newGuest = await prisma.user.create({
          data: { email: "guest@neuro.local", name: "Гость", password: "guest", role: "guest" },
        });
        userId = newGuest.id;
      }
    }

    const booking = await prisma.$transaction(async (tx) => {
      const slot = await tx.scheduleSlot.findUnique({ where: { id: slotId } });
      if (!slot) throw new Error("Slot not found");
      if (!slot.isActive) throw new Error("Slot is not active");
      if (slot.bookedSeats >= slot.totalSeats) throw new Error("No available seats");

      const created = await tx.booking.create({
        data: {
          userId,
          slotId,
          childName,
          childAge: parseInt(childAge, 10),
          notes: notes || null,
          status: "pending",
        },
      });
      await tx.scheduleSlot.update({
        where: { id: slotId },
        data: { bookedSeats: { increment: 1 } },
      });
      return created;
    });

    // Notify admin via Telegram
    const slot = await prisma.scheduleSlot.findUnique({ where: { id: slotId } });
    if (slot) {
      notifyBookingCreated({
        id: booking.id,
        childName,
        childAge: parseInt(childAge, 10),
        slotTitle: slot.title,
        slotDate: slot.date,
        slotTime: `${slot.timeStart}–${slot.timeEnd}`,
        parentName: parentName || childName,
        parentPhone: parentPhone || "",
        parentEmail: parentEmail || "",
        notes: notes || null,
      }).catch(() => {});
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Slot not found") {
        return NextResponse.json({ error: "Slot not found" }, { status: 404 });
      }
      if (error.message === "Slot is not active") {
        return NextResponse.json({ error: "Slot is not active" }, { status: 400 });
      }
      if (error.message === "No available seats") {
        return NextResponse.json({ error: "No available seats" }, { status: 400 });
      }
    }
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
