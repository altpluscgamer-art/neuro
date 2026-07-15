"use client";

import { useState } from "react";
import { FileText, ChevronDown, ChevronUp, Filter, Phone, Mail, Send, Download } from "lucide-react";

interface ScreeningResultWithUser {
  id: string;
  childAge: string;
  concerns: string;
  concernFrequencies: string | null;
  strengths: string;
  report: string;
  completed: boolean;
  createdAt: Date | string;
  userId: string | null;
  parentName: string | null;
  parentPhone: string | null;
  parentEmail: string | null;
  messenger: string | null;
  user: { name: string; email: string } | null;
}

const concernLabels: Record<string, string> = {
  "плохо концентрируется": "Плохо концентрируется",
  "трудно сидеть на месте": "Трудно сидеть на месте",
  "тревожится": "Тревожится",
  "быстро устаёт": "Быстро устаёт",
  "плохо читает": "Плохо читает",
  "плохо пишет": "Плохо пишет",
  "не запоминает": "Не запоминает",
  "есть сложности с речью": "Сложности с речью",
  "плохо засыпает": "Плохо засыпает",
  "истерики": "Истерики",
  "не хочет идти в школу": "Не хочет идти в школу",
  "агрессия": "Агрессия",
};

const strengthLabels: Record<string, string> = {
  "любит рисовать": "Любит рисовать",
  "любит конструировать": "Любит конструировать",
  "общительный": "Общительный",
  "любознательный": "Любознательный",
  "богатая речь": "Богатая речь",
  "хорошая память": "Хорошая память",
  "спортивный": "Спортивный",
  "музыкальный": "Музыкальный",
};

const ageLabels: Record<string, string> = {
  "1-2": "1–2 года",
  "2-3": "2–3 года",
  "3-5": "3–5 лет",
  "5-7": "5–7 лет",
  "7-10": "7–10 лет",
  "10-13": "10–13 лет",
};

const messengerLabels: Record<string, string> = {
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  email: "Email",
};

function safeParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

interface ReportData {
  strengthsSection?: { title?: string; intro?: string; items?: { label: string; description: string }[] };
  concernsSection?: { title?: string; intro?: string; areas?: { concern: string; area: string; description: string }[] };
  homeActivitiesSection?: { title?: string; intro?: string; activities?: { title: string; description: string }[] };
  materialsSection?: { title?: string; links?: { title: string; description: string; href: string }[] };
  specialistRecommendation?: { show: boolean; title?: string; text?: string; urgency?: string };
  neuropsychProfile?: {
    title?: string;
    intro?: string;
    profile?: {
      block1?: { label?: string; score: number; maxScore: number; status?: string };
      block2?: { label?: string; score: number; maxScore: number; status?: string };
      block3?: { label?: string; score: number; maxScore: number; status?: string };
    };
  };
  syndromes?: {
    title?: string;
    intro?: string;
    syndromes?: { name: string; block: number; description: string; severity: string; matchedSymptoms: string[] }[];
  };
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
        {(defaultFrom || defaultTo) ? (
          <a
            href="/admin/screening-results"
            className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Сбросить
          </a>
        ) : null}
      </div>

      {results.length === 0 ? (
        <p className="py-8 text-center text-gray-500">Нет результатов</p>
      ) : (
        <div className="space-y-2">
          {results.map((r) => {
            const concerns = safeParse<string[]>(r.concerns, []);
            const strengths = safeParse<string[]>(r.strengths, []);
            const freqs = safeParse<Record<string, string>>(r.concernFrequencies, {});
            const report = safeParse<ReportData>(r.report, {});

            const name = r.parentName || r.user?.name || "Аноним";
            const dateStr = new Date(r.createdAt).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div key={r.id} className="rounded-xl border border-gray-200 bg-white">
                <button
                  onClick={() => toggle(r.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                  style={{ minHeight: "44px" }}
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-5 w-5 text-violet-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{name}</p>
                      <p className="text-xs text-gray-500">
                        Возраст: {ageLabels[r.childAge] || r.childAge} · {dateStr}
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
                  <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                    {/* Contact info */}
                    {(r.parentPhone || r.parentEmail || r.messenger) && (
                      <div className="rounded-lg bg-violet-50 p-3 space-y-1">
                        <p className="text-xs font-semibold uppercase text-violet-600">Контакты родителя</p>
                        {r.parentPhone && (
                          <p className="flex items-center gap-2 text-sm text-gray-700">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            {r.parentPhone}
                          </p>
                        )}
                        {r.parentEmail && (
                          <p className="flex items-center gap-2 text-sm text-gray-700">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            {r.parentEmail}
                          </p>
                        )}
                        {r.messenger && (
                          <p className="flex items-center gap-2 text-sm text-gray-700">
                            <Send className="h-3.5 w-3.5 text-gray-400" />
                            {messengerLabels[r.messenger] || r.messenger}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Concerns */}
                    {concerns.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">Что беспокоит</p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {concerns.map((c) => (
                            <span
                              key={c}
                              className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200"
                            >
                              {concernLabels[c] || c}
                              {freqs[c] && (
                                <span className="text-amber-400">· {freqs[c]}</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Strengths */}
                    {strengths.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">Сильные стороны</p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {strengths.map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200"
                            >
                              {strengthLabels[s] || s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Neuropsych profile */}
                    {report.neuropsychProfile?.profile && (
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">
                          {report.neuropsychProfile.title || "Нейропсихологический профиль"}
                        </p>
                        <div className="mt-2 space-y-2">
                          {(["block1", "block2", "block3"] as const).map((key) => {
                            const block = report.neuropsychProfile!.profile![key];
                            if (!block) return null;
                            const ratio = block.maxScore > 0 ? block.score / block.maxScore : 0;
                            const healthPct = Math.round((1 - ratio) * 100);
                            const color =
                              ratio >= 0.65 ? "bg-red-500" : ratio >= 0.4 ? "bg-orange-500" : ratio >= 0.2 ? "bg-yellow-500" : "bg-emerald-500";
                            return (
                              <div key={key}>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600">{block.label || key}</span>
                                  <span className="text-gray-400">{block.score}/{block.maxScore}</span>
                                </div>
                                <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
                                  <div className={`h-2 rounded-full ${color}`} style={{ width: `${healthPct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Syndromes */}
                    {report.syndromes?.syndromes && report.syndromes.syndromes.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">
                          {report.syndromes.title || "Выявленные синдромы"}
                        </p>
                        <div className="mt-1.5 space-y-2">
                          {report.syndromes.syndromes.map((syn, i) => (
                            <div key={i} className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-orange-800">{syn.name}</span>
                                <span className="rounded-full bg-orange-200 px-2 py-0.5 text-xs text-orange-700">
                                  {syn.severity}
                                </span>
                                <span className="text-xs text-orange-400">Блок {syn.block}</span>
                              </div>
                              <p className="mt-1 text-xs text-orange-700">{syn.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Strengths section from report */}
                    {report.strengthsSection?.items && report.strengthsSection.items.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">
                          {report.strengthsSection.title || "Сильные стороны (детально)"}
                        </p>
                        <div className="mt-1.5 space-y-1.5">
                          {report.strengthsSection.items.map((item) => (
                            <div key={item.label} className="rounded-lg bg-emerald-50 p-2.5">
                              <p className="text-sm font-medium text-emerald-800">{item.label}</p>
                              <p className="text-xs text-emerald-700">{item.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Concerns section from report */}
                    {report.concernsSection?.areas && report.concernsSection.areas.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">
                          {report.concernsSection.title || "На что обратить внимание"}
                        </p>
                        <div className="mt-1.5 space-y-1.5">
                          {report.concernsSection.areas.map((area) => (
                            <div key={area.concern} className="rounded-lg bg-amber-50 p-2.5">
                              <p className="text-xs font-semibold text-amber-600">{area.area}</p>
                              <p className="text-sm font-medium text-amber-800">{area.concern}</p>
                              <p className="text-xs text-amber-700">{area.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Home activities */}
                    {report.homeActivitiesSection?.activities && report.homeActivitiesSection.activities.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">
                          {report.homeActivitiesSection.title || "Рекомендации для дома"}
                        </p>
                        <div className="mt-1.5 space-y-1.5">
                          {report.homeActivitiesSection.activities.map((act, i) => (
                            <div key={i} className="rounded-lg bg-indigo-50 p-2.5">
                              <div className="flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-200 text-xs font-bold text-indigo-700">
                                  {i + 1}
                                </span>
                                <p className="text-sm font-medium text-indigo-800">{act.title}</p>
                              </div>
                              <p className="mt-1 pl-7 text-xs text-indigo-700">{act.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Materials */}
                    {report.materialsSection?.links && report.materialsSection.links.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">
                          {report.materialsSection.title || "Полезные материалы"}
                        </p>
                        <div className="mt-1.5 space-y-1">
                          {report.materialsSection.links.map((link) => (
                            <a
                              key={link.href}
                              href={link.href}
                              className="block rounded-lg bg-teal-50 p-2 text-xs text-teal-700 hover:bg-teal-100"
                            >
                              <span className="font-medium">{link.title}</span>
                              <span className="block text-teal-500">{link.description}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Specialist recommendation */}
                    {report.specialistRecommendation?.show && (
                      <div
                        className={`rounded-lg p-3 ${
                          report.specialistRecommendation.urgency === "high"
                            ? "bg-red-50 ring-1 ring-red-200"
                            : "bg-amber-50 ring-1 ring-amber-200"
                        }`}
                      >
                        <p className={`text-sm font-semibold ${
                          report.specialistRecommendation.urgency === "high" ? "text-red-800" : "text-amber-800"
                        }`}>
                          {report.specialistRecommendation.title || "Рекомендация специалиста"}
                        </p>
                        <p className={`mt-1 text-xs ${
                          report.specialistRecommendation.urgency === "high" ? "text-red-700" : "text-amber-700"
                        }`}>
                          {report.specialistRecommendation.text}
                        </p>
                      </div>
                    )}

                    {/* PDF download */}
                    <div className="pt-2">
                      <a
                        href={`/api/screening/pdf/${r.id}`}
                        download
                        className="inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100"
                      >
                        <Download className="h-4 w-4" />
                        Скачать PDF-отчёт
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
