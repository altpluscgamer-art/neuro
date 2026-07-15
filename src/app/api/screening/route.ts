import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateReport } from "@/lib/screening-logic";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      childAge,
      concerns,
      concernFrequencies,
      strengths,
      parentName,
      parentPhone,
      parentEmail,
      messenger,
    } = body;

    if (!childAge || typeof childAge !== "string") {
      return NextResponse.json({ error: "childAge is required" }, { status: 400 });
    }
    if (!Array.isArray(concerns) || !Array.isArray(strengths)) {
      return NextResponse.json({ error: "concerns and strengths must be arrays" }, { status: 400 });
    }
    if (strengths.length === 0) {
      return NextResponse.json({ error: "At least one strength is required" }, { status: 400 });
    }

    const report = generateReport(childAge, concerns, concernFrequencies || {}, strengths);

    let userId: string | null = null;

    const session = await getServerSession(authOptions);
    if (session?.user) {
      userId = (session.user as { id?: string }).id ?? null;
    } else if (parentEmail) {
      const existing = await prisma.user.findUnique({ where: { email: parentEmail } });
      if (existing) {
        userId = existing.id;
        if (parentName && existing.name !== parentName) {
          await prisma.user.update({ where: { id: existing.id }, data: { name: parentName, phone: parentPhone || existing.phone } });
        }
      } else {
        const hashed = await bcrypt.hash(Math.random().toString(36), 10);
        const newUser = await prisma.user.create({
          data: { email: parentEmail, name: parentName || "Родитель", password: hashed, phone: parentPhone || null, role: "parent" },
        });
        userId = newUser.id;
      }
    }

    const result = await prisma.screeningResult.create({
      data: {
        userId,
        childAge,
        concerns: JSON.stringify(concerns),
        concernFrequencies: concernFrequencies ? JSON.stringify(concernFrequencies) : null,
        strengths: JSON.stringify(strengths),
        report: JSON.stringify(report),
        parentName: parentName || null,
        parentPhone: parentPhone || null,
        parentEmail: parentEmail || null,
        messenger: messenger || null,
        completed: true,
      },
    });

    return NextResponse.json({ id: result.id, report, userId });
  } catch (error) {
    console.error("Screening API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
