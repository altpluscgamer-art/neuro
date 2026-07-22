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
    const services = await prisma.service.findMany({ orderBy: { order: "asc" }, take: 50 });
    return NextResponse.json(services);
  } catch {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await checkAdmin();
  if (authError) return authError;
  try {
    const body = await request.json();
    const { title, slug, description, icon, order, isActive } = body;
    if (!title || !slug || !description) {
      return NextResponse.json({ error: "title, slug, description are required" }, { status: 400 });
    }
    const service = await prisma.service.create({
      data: { title, slug, description, icon: icon || null, order: order ?? 0, isActive: !!isActive },
    });
    return NextResponse.json(service, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
