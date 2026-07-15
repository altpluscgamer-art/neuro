import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

export async function GET() {
  const authError = await checkAdmin();
  if (authError) return authError;

  try {
    const [services, articles, courses, testimonials] = await Promise.all([
      prisma.service.findMany({ orderBy: { order: "asc" } }),
      prisma.article.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.course.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.testimonial.findMany({ orderBy: { order: "asc" } }),
    ]);

    return NextResponse.json({ services, articles, courses, testimonials });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const authError = await checkAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { type, id, ...data } = body;

    if (!type || !id) {
      return NextResponse.json({ error: "type and id are required" }, { status: 400 });
    }

    const validTypes = ["service", "article", "course", "testimonial"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    let result;
    switch (type) {
      case "service": {
        const existing = await prisma.service.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
        result = await prisma.service.update({ where: { id }, data });
        break;
      }
      case "article": {
        const existing = await prisma.article.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
        result = await prisma.article.update({ where: { id }, data });
        break;
      }
      case "course": {
        const existing = await prisma.course.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
        result = await prisma.course.update({ where: { id }, data });
        break;
      }
      case "testimonial": {
        const existing = await prisma.testimonial.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
        result = await prisma.testimonial.update({ where: { id }, data });
        break;
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Unique constraint violation" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authError = await checkAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!type || !id) {
      return NextResponse.json({ error: "type and id are required" }, { status: 400 });
    }

    const validTypes = ["service", "article", "course", "testimonial"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    switch (type) {
      case "service": {
        const existing = await prisma.service.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
        await prisma.service.delete({ where: { id } });
        break;
      }
      case "article": {
        const existing = await prisma.article.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
        await prisma.article.delete({ where: { id } });
        break;
      }
      case "course": {
        const existing = await prisma.course.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
        await prisma.course.delete({ where: { id } });
        break;
      }
      case "testimonial": {
        const existing = await prisma.testimonial.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
        await prisma.testimonial.delete({ where: { id } });
        break;
      }
    }

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete content" }, { status: 500 });
  }
}
