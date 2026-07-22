import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: any = { isPublished: true };
    if (category) where.category = category;

    const articles = await prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
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
    const { title, slug, excerpt, content, category, image, isPublished } = body;

    if (!title || !slug || !content || !excerpt) {
      return NextResponse.json({ error: "Title, slug, excerpt, and content are required" }, { status: 400 });
    }

    const article = await prisma.article.create({
      data: { title, slug, excerpt, content, category, image, isPublished: isPublished ?? false },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
  }
}
