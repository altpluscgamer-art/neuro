import { NextResponse } from "next/server";
import { sendDailyStats } from "@/lib/notifications";

// This endpoint is called by cron (server) at 20:00 daily
// Set up via: crontab -e
// 0 20 * * * curl -s -X POST https://mybestsite.com.ng/api/cron/daily-stats
export async function POST() {
  try {
    await sendDailyStats();
    return NextResponse.json({ ok: true, message: "Daily stats sent" });
  } catch (error) {
    console.error("Daily stats cron error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
