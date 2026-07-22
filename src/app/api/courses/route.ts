import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, slug, description, excerpt, price, videoUrl, image, lessons, isPublished } = body;

    if (!title || !slug || !description || !excerpt) {
      return NextResponse.json({ error: "Title, slug, description, and excerpt are required" }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        excerpt,
        price: price ?? 0,
        videoUrl,
        image,
        lessons: lessons ?? 1,
        isPublished: isPublished ?? false,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
