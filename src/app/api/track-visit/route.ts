import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const existing = await prisma.siteStat.findFirst({ where: { date: today } });

    if (existing) {
      await prisma.siteStat.update({
        where: { id: existing.id },
        data: { visits: { increment: 1 } },
      });
    } else {
      await prisma.siteStat.create({ data: { date: today, visits: 1 } });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
