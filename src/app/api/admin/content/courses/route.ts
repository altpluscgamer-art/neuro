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
    const courses = await prisma.course.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    return NextResponse.json(courses);
  } catch {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await checkAdmin();
  if (authError) return authError;
  try {
    const body = await request.json();
    const { title, slug, description, excerpt, price, lessons, isPublished } = body;
    if (!title || !slug || !description) {
      return NextResponse.json({ error: "title, slug, description are required" }, { status: 400 });
    }
    const course = await prisma.course.create({
      data: { title, slug, description, excerpt: excerpt || "", price: price ?? 0, lessons: lessons ?? 1, isPublished: !!isPublished },
    });
    return NextResponse.json(course, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
