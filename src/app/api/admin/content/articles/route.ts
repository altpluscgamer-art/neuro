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
    const articles = await prisma.article.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    return NextResponse.json(articles);
  } catch {
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await checkAdmin();
  if (authError) return authError;
  try {
    const body = await request.json();
    const { title, slug, excerpt, content, category, isPublished } = body;
    if (!title || !slug || !excerpt || !content) {
      return NextResponse.json({ error: "title, slug, excerpt, content are required" }, { status: 400 });
    }
    const article = await prisma.article.create({
      data: { title, slug, excerpt, content, category: category || null, isPublished: !!isPublished },
    });
    return NextResponse.json(article, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
  }
}
