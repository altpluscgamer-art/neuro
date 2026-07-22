import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

export async function GET() {
  const authError = await checkAdmin();
  if (authError) return authError;
  try {
    const testimonials = await prisma.testimonial.findMany({ orderBy: { order: "asc" }, take: 50 });
    return NextResponse.json(testimonials);
  } catch {
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await checkAdmin();
  if (authError) return authError;
  try {
    const body = await request.json();
    const { author, text, rating, order, isActive } = body;
    if (!author || !text) {
      return NextResponse.json({ error: "author and text are required" }, { status: 400 });
    }
    const testimonial = await prisma.testimonial.create({
      data: { author, text, rating: rating ?? 5, order: order ?? 0, isActive: !!isActive },
    });
    return NextResponse.json(testimonial, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
  }
}
