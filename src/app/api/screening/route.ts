import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateReport } from "@/lib/screening-logic";

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
      userId: bodyUserId,
    } = body;

    if (!childAge || typeof childAge !== "string") {
      return NextResponse.json(
        { error: "childAge is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(concerns) || !Array.isArray(strengths)) {
      return NextResponse.json(
        { error: "concerns and strengths must be arrays" },
        { status: 400 }
      );
    }

    if (strengths.length === 0) {
      return NextResponse.json(
        { error: "At least one strength is required" },
        { status: 400 }
      );
    }

    const report = generateReport(
      childAge,
      concerns,
      concernFrequencies || {},
      strengths
    );

    const session = await getServerSession(authOptions);
    const sessionUserId = session?.user
      ? (session.user as { id?: string }).id
      : undefined;
    const userId = bodyUserId ?? sessionUserId ?? null;

    const result = await prisma.screeningResult.create({
      data: {
        userId,
        childAge,
        concerns: JSON.stringify(concerns),
        concernFrequencies: concernFrequencies
          ? JSON.stringify(concernFrequencies)
          : null,
        strengths: JSON.stringify(strengths),
        report: JSON.stringify(report),
        parentName: parentName || null,
        parentPhone: parentPhone || null,
        parentEmail: parentEmail || null,
        messenger: messenger || null,
        completed: true,
      },
    });

    return NextResponse.json({ id: result.id, report });
  } catch (error) {
    console.error("Screening API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
