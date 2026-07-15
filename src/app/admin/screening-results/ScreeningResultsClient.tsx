"use client";

import { useState } from "react";
import { FileText, ChevronDown, ChevronUp, Filter } from "lucide-react";

interface ScreeningResultWithUser {
  id: string;
  childAge: string;
  concerns: string;
  strengths: string;
  report: string;
  completed: boolean;
  createdAt: Date | string;
  userId: string | null;
  user: { name: string; email: string } | null;
}

export default function ScreeningResultsClient({
  results,
  defaultFrom,
  defaultTo,
}: {
  results: ScreeningResultWithUser[];
  defaultFrom: string;
  defaultTo: string;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filterUrl = () => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return `/admin/screening-results?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Результаты анкет</h1>

      {/* Filter */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Filter className="h-4 w-4" />
          Фильтр по дате
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">С</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">По</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
        <a
          href={filterUrl()}
          className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
        >
          Применить
        </a>
        {defaultFrom || defaultTo ? (
          <a
            href="/admin/screening-results"
            className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Сбросить
          </a>
        ) : null}
      </div>

      {/* Results list */}
      {results.length === 0 ? (
        <p className="py-8 text-center text-gray-500">Нет результатов</p>
      ) : (
        <div className="space-y-2">
          {results.map((r) => (
            <div key={r.id} className="rounded-xl border border-gray-200 bg-white">
              <button
                onClick={() => toggle(r.id)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex items-center gap-4">
                  <FileText className="h-5 w-5 text-violet-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.user?.name ?? "Аноним"}</p>
                    <p className="text-xs text-gray-500">
                      Возраст ребёнка: {r.childAge} · {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      r.completed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {r.completed ? "Завершено" : "В процессе"}
                  </span>
                  {expanded.has(r.id) ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>
              {expanded.has(r.id) && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-400">Проблемы</p>
                    <p className="mt-1 text-sm text-gray-700">{r.concerns}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-400">Сильные стороны</p>
                    <p className="mt-1 text-sm text-gray-700">{r.strengths}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-400">Отчёт</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{r.report}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
