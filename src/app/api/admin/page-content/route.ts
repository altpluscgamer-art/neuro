import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { startsWith: "page_" } },
    });
    const result: Record<string, string> = {};
    for (const s of settings) result[s.key] = s.value;
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch page content" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const authError = await checkAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { content } = body as { content: Record<string, string> };

    if (!content || typeof content !== "object") {
      return NextResponse.json({ error: "content object is required" }, { status: 400 });
    }

    for (const [key, value] of Object.entries(content)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save page content" }, { status: 500 });
  }
}
