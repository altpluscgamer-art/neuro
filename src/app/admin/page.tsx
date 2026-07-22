import prisma from "@/lib/prisma";
import { BarChart3, Users, FileText, Calendar, Clock, TrendingUp, Eye, TrendingDown } from "lucide-react";

export default async function AdminDashboard() {
  const [
    usersCount,
    screeningCount,
    completedScreeningCount,
    pendingConsultations,
    upcomingBookings,
    totalArticles,
    totalCourses,
    todayStats,
    weekStats,
    allTimeStats,
  ] = await Promise.all([
    prisma.user.count({ where: { role: { not: "guest" } } }),
    prisma.screeningResult.count(),
    prisma.screeningResult.count({ where: { completed: true } }),
    prisma.consultationRequest.count({ where: { status: "new" } }),
    prisma.booking.count({ where: { status: "pending" } }),
    prisma.article.count({ where: { isPublished: true } }),
    prisma.course.count({ where: { isPublished: true } }),
    prisma.siteStat.findFirst({ where: { date: new Date().toISOString().split("T")[0] } }),
    prisma.siteStat.findMany({
      where: { date: { gte: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0] } },
      orderBy: { date: "asc" },
    }),
    prisma.siteStat.aggregate({ _sum: { visits: true } }),
  ]);

  const weekTotal = weekStats.reduce((sum, s) => sum + s.visits, 0);
  const todayVisits = todayStats?.visits || 0;

  const recentScreenings = await prisma.screeningResult.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  const recentConsultations = await prisma.consultationRequest.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  const stats = [
    { label: "Пользователей", value: usersCount, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Анкет пройдено", value: completedScreeningCount, icon: FileText, color: "bg-green-50 text-green-600" },
    { label: "Новых запросов", value: pendingConsultations, icon: Clock, color: "bg-amber-50 text-amber-600" },
    { label: "Записей", value: upcomingBookings, icon: Calendar, color: "bg-violet-50 text-violet-600" },
  ];

  const maxWeekVisits = Math.max(...weekStats.map((s) => s.visits), 1);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Панель управления</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-violet-600" />
          <h2 className="text-lg font-semibold text-gray-900">Аналитика посещений</h2>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Eye className="h-3.5 w-3.5" />
              Сегодня
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900">{todayVisits}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <TrendingUp className="h-3.5 w-3.5" />
              За неделю
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900">{weekTotal}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <BarChart3 className="h-3.5 w-3.5" />
              Всего посещений
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900">{allTimeStats._sum.visits || 0}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <FileText className="h-3.5 w-3.5" />
              Опубликованных статей
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900">{totalArticles}</p>
          </div>
        </div>

        {weekStats.length > 0 && (
          <div>
            <p className="mb-3 text-sm font-medium text-gray-600">Посещения за последние 7 дней</p>
            <div className="flex items-end gap-2" style={{ height: "120px" }}>
              {weekStats.map((s) => (
                <div key={s.id} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full items-end justify-center" style={{ height: "90px" }}>
                    <div
                      className="w-full max-w-[40px] rounded-t bg-violet-500 transition-[height]"
                      style={{ height: `${(s.visits / maxWeekVisits) * 100}%`, minHeight: "4px" }}
                      title={`${s.visits} посещений`}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {new Date(s.date + "T00:00:00").toLocaleDateString("ru-RU", { weekday: "short" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-violet-600" />
            <h2 className="text-lg font-semibold text-gray-900">Последние анкеты</h2>
          </div>
          {recentScreenings.length === 0 ? (
            <p className="text-sm text-gray-500">Нет данных</p>
          ) : (
            <ul className="space-y-3">
              {recentScreenings.map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.user?.name ?? s.parentName ?? "Аноним"}</p>
                    <p className="text-xs text-gray-500">Возраст ребёнка: {s.childAge}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      s.completed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {s.completed ? "Завершено" : "В процессе"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-violet-600" />
            <h2 className="text-lg font-semibold text-gray-900">Последние запросы</h2>
          </div>
          {recentConsultations.length === 0 ? (
            <p className="text-sm text-gray-500">Нет данных</p>
          ) : (
            <ul className="space-y-3">
              {recentConsultations.map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.email}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      c.status === "new"
                        ? "bg-blue-100 text-blue-700"
                        : c.status === "in_progress"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {c.status === "new" ? "Новый" : c.status === "in_progress" ? "В работе" : "Завершён"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
