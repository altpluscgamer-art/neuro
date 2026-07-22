import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

    const [todayStat, weekStats, monthStats, allTimeStats] = await Promise.all([
      prisma.siteStat.findFirst({ where: { date: today } }),
      prisma.siteStat.findMany({ where: { date: { gte: weekAgo } }, orderBy: { date: "asc" } }),
      prisma.siteStat.findMany({ where: { date: { gte: monthAgo } }, orderBy: { date: "asc" } }),
      prisma.siteStat.aggregate({ _sum: { visits: true } }),
    ]);

    const weekTotal = weekStats.reduce((sum, s) => sum + s.visits, 0);
    const monthTotal = monthStats.reduce((sum, s) => sum + s.visits, 0);
    const yesterdayStat = await prisma.siteStat.findFirst({ where: { date: yesterday } });
    const todayVisits = todayStat?.visits || 0;
    const yesterdayVisits = yesterdayStat?.visits || 0;
    const diff = todayVisits - yesterdayVisits;

    const last7Days = weekStats.map((s) => ({ date: s.date, visits: s.visits }));

    return NextResponse.json({
      today: todayVisits,
      yesterday: yesterdayVisits,
      todayDiff: diff,
      weekTotal,
      monthTotal,
      allTime: allTimeStats._sum.visits || 0,
      last7Days,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
