import prisma from "@/lib/prisma";
import { BarChart3, Users, FileText, Calendar, Clock, TrendingUp } from "lucide-react";

export default async function AdminDashboard() {
  const [usersCount, screeningCount, pendingConsultations, upcomingBookings] =
    await Promise.all([
      prisma.user.count(),
      prisma.screeningResult.count(),
      prisma.consultationRequest.count({ where: { status: "new" } }),
      prisma.booking.count({ where: { status: "pending" } }),
    ]);

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
    { label: "Результатов анкет", value: screeningCount, icon: FileText, color: "bg-green-50 text-green-600" },
    { label: "Новых запросов", value: pendingConsultations, icon: Clock, color: "bg-amber-50 text-amber-600" },
    { label: "Предстоящих записей", value: upcomingBookings, icon: Calendar, color: "bg-violet-50 text-violet-600" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Панель управления</h1>

      {/* Stats cards */}
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

      {/* Quick actions */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Быстрые действия</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="/admin/schedule"
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
          >
            <Calendar className="h-4 w-4" />
            Управление расписанием
          </a>
          <a
            href="/admin/content"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <FileText className="h-4 w-4" />
            Управление контентом
          </a>
          <a
            href="/admin/consultation-requests"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <TrendingUp className="h-4 w-4" />
            Обработать запросы
          </a>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent screenings */}
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
                    <p className="text-sm font-medium text-gray-900">{s.user?.name ?? "Аноним"}</p>
                    <p className="text-xs text-gray-500">Возраст ребёнка: {s.childAge}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      s.completed
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {s.completed ? "Завершено" : "В процессе"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent consultations */}
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
                    {c.status === "new"
                      ? "Новый"
                      : c.status === "in_progress"
                      ? "В работе"
                      : "Завершён"}
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
