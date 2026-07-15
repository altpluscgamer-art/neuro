import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const reviews = await prisma.externalReview.findMany({
    orderBy: { syncedAt: "desc" },
  });
  return NextResponse.json({ reviews });
}
