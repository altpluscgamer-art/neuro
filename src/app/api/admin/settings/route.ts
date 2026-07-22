import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllSettings, setSetting } from "@/lib/settings";

const SENSITIVE_KEYS = [
  "telegram_bot_token",
  "smtp_pass",
  "yookassa_secret_key",
  "yookassa_shop_id",
];

function maskSettings(settings: Record<string, string>): Record<string, string> {
  const filtered: Record<string, string> = {};
  for (const [key, value] of Object.entries(settings)) {
    filtered[key] = SENSITIVE_KEYS.includes(key) ? (value ? "••••••••" : "") : value;
  }
  return filtered;
}

export async function GET(request: Request) {
  const settings = await getAllSettings();
  const { searchParams } = new URL(request.url);
  const full = searchParams.get("full") === "true";

  if (full) {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(settings);
  }

  return NextResponse.json(maskSettings(settings));
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { settings } = body as { settings: Record<string, string> };

    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ error: "settings object is required" }, { status: 400 });
    }

    for (const [key, value] of Object.entries(settings)) {
      await setSetting(key, String(value));
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
