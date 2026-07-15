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

    const bookings = await prisma.booking.findMany({
      include: { user: true, slot: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, slotId, childName, childAge, notes, status } = body;

    if (!slotId || !childName || childAge == null) {
      return NextResponse.json({ error: "slotId, childName, and childAge are required" }, { status: 400 });
    }

    const slot = await prisma.scheduleSlot.findUnique({ where: { id: slotId } });
    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }
    if (!slot.isActive) {
      return NextResponse.json({ error: "Slot is not active" }, { status: 400 });
    }
    if (slot.bookedSeats >= slot.totalSeats) {
      return NextResponse.json({ error: "No available seats" }, { status: 400 });
    }

    const bookingData: any = {
      slotId,
      childName,
      childAge,
      notes,
      status: status ?? "pending",
    };

    if (userId) {
      bookingData.userId = userId;
    } else {
      const session = await getServerSession(authOptions);
      if (session?.user) {
        bookingData.userId = (session.user as any).id;
      } else {
        const guestUser = await prisma.user.findFirst({ where: { email: "guest@neuro.local" } });
        if (!guestUser) {
          const newGuest = await prisma.user.create({
            data: { email: `guest-${Date.now()}@neuro.local`, name: childName, password: "guest", role: "guest" },
          });
          bookingData.userId = newGuest.id;
        } else {
          bookingData.userId = guestUser.id;
        }
      }
    }

    const booking = await prisma.booking.create({ data: bookingData });

    await prisma.scheduleSlot.update({
      where: { id: slotId },
      data: { bookedSeats: { increment: 1 } },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
