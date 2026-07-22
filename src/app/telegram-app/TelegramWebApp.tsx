"use client";

import { useState, useEffect } from "react";
import { Brain, ClipboardList, Calendar, Phone, Home, Send, ExternalLink } from "lucide-react";
import { clsx } from "clsx";

type Tab = "home" | "screening" | "booking" | "contacts";

const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Главная", icon: Home },
  { id: "screening", label: "Анкета", icon: ClipboardList },
  { id: "booking", label: "Запись", icon: Calendar },
  { id: "contacts", label: "Контакты", icon: Phone },
];

export default function TelegramWebApp() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [slots, setSlots] = useState<Slot[]>([]);
  const [tgReady, setTgReady] = useState(false);

  useEffect(() => {
    // Load Telegram WebApp SDK
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js";
    script.async = true;
    script.onload = () => {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        setTgReady(true);
        // Apply Telegram theme or our brand
        tg.setHeaderColor("#6A7450");
        tg.setBackgroundColor("#FAF5EF");
      }
    };
    document.body.appendChild(script);

    // Fetch settings
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {});

    // Check URL param for initial tab
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab") as Tab;
    if (tab && tabs.some((t) => t.id === tab)) {
      setActiveTab(tab);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "booking") {
      fetch("/api/admin/schedule")
        .then((r) => r.json())
        .then((data: Slot[]) => {
          setSlots((data || []).filter((s) => s.isActive && s.totalSeats - s.bookedSeats > 0));
        })
        .catch(() => {});
    }
  }, [activeTab]);

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="min-h-screen bg-cream flex flex-col" style={{ paddingBottom: "60px" }}>
      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* HOME TAB */}
        {activeTab === "home" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-primary-600 p-5 text-white">
              <div className="mb-3 flex items-center gap-2">
                <Brain className="h-7 w-7" />
                <span className="text-xl font-bold">Нейро</span>
              </div>
              <p className="text-sm leading-relaxed text-primary-50">
                Онлайн-платформа для родителей и детских нейропсихологов. Помощь детям от 1 до 13 лет: внимание, память, поведение, адаптация к школе, тревожность.
              </p>
            </div>

            <button
              onClick={() => setActiveTab("screening")}
              className="w-full rounded-xl border-2 border-primary-200 bg-white p-4 text-left transition-[transform,box-shadow] active:scale-[0.97]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
                  <ClipboardList className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Пройти анкету</p>
                  <p className="text-sm text-gray-500">5–7 минут, персональный отчёт</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("booking")}
              className="w-full rounded-xl border-2 border-primary-200 bg-white p-4 text-left transition-[transform,box-shadow] active:scale-[0.97]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50">
                  <Calendar className="h-6 w-6 text-accent-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Записаться на приём</p>
                  <p className="text-sm text-gray-500">Выбрать удобное время</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("contacts")}
              className="w-full rounded-xl border-2 border-primary-200 bg-white p-4 text-left transition-[transform,box-shadow] active:scale-[0.97]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50">
                  <Phone className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Контакты</p>
                  <p className="text-sm text-gray-500">Телефон, email, соцсети</p>
                </div>
              </div>
            </button>

            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-xl bg-primary-100 p-4 text-center font-medium text-primary-700 transition-[background-color] active:scale-[0.97]"
            >
              <ExternalLink className="mr-1 inline h-4 w-4" />
              Открыть полную версию сайта
            </a>
          </div>
        )}

        {/* SCREENING TAB */}
        {activeTab === "screening" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-5 border border-gray-200">
              <div className="mb-4 flex items-center gap-2">
                <ClipboardList className="h-6 w-6 text-primary-600" />
                <h2 className="text-lg font-bold text-gray-900">Скрининг развития</h2>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-gray-600">
                Ответьте на несколько вопросов и получите персональные рекомендации по развитию ребёнка на основе нейропсихологической методики А.Р. Лурии.
              </p>
              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">1</span>
                  Возраст ребёнка
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">2</span>
                  Что вас беспокоит
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">3</span>
                  Частота проявлений
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">4</span>
                  Сильные стороны
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">5</span>
                  Контакты для отчёта
                </div>
              </div>
              <p className="mb-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
                Это не диагностика и не медицинское заключение, а образовательный скрининг.
              </p>
              <a
                href={`${siteUrl}/screening`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-xl bg-primary-600 py-3 text-center font-semibold text-white transition-[background-color] active:scale-[0.97]"
              >
                Начать анкету
              </a>
            </div>
          </div>
        )}

        {/* BOOKING TAB */}
        {activeTab === "booking" && (
          <div className="space-y-3">
            <div className="mb-2 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary-600" />
              <h2 className="text-lg font-bold text-gray-900">Расписание</h2>
            </div>
            {slots.length === 0 ? (
              <div className="rounded-xl bg-white p-6 text-center border border-gray-200">
                <Calendar className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-500">Нет доступных слотов</p>
                <p className="mt-1 text-xs text-gray-400">Расписание будет обновлено позже</p>
              </div>
            ) : (
              slots.map((slot) => {
                const available = slot.totalSeats - slot.bookedSeats;
                return (
                  <div key={slot.id} className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{slot.timeStart} – {slot.timeEnd}</p>
                        <p className="text-sm text-gray-600">{slot.title}</p>
                        <p className="mt-1 text-xs text-gray-400">{formatDate(slot.date)}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                          {available} из {slot.totalSeats}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`${siteUrl}/booking?slot=${slot.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 block w-full rounded-lg bg-primary-600 py-2 text-center text-sm font-semibold text-white transition-[background-color] active:scale-[0.97]"
                    >
                      Записаться
                    </a>
                  </div>
                );
              })
            )}
            <a
              href={`${siteUrl}/booking`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-xl bg-primary-100 py-2.5 text-center text-sm font-medium text-primary-700 active:scale-[0.97]"
            >
              Открыть полную запись
            </a>
          </div>
        )}

        {/* CONTACTS TAB */}
        {activeTab === "contacts" && (
          <div className="space-y-3">
            <div className="mb-2 flex items-center gap-2">
              <Phone className="h-6 w-6 text-primary-600" />
              <h2 className="text-lg font-bold text-gray-900">Контакты</h2>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
              {settings.site_phone && (
                <a href={`tel:${settings.site_phone}`} className="flex items-center gap-3 text-gray-700">
                  <Phone className="h-5 w-5 text-primary-600" />
                  <span className="text-sm font-medium">{settings.site_phone}</span>
                </a>
              )}
              {settings.site_email && (
                <a href={`mailto:${settings.site_email}`} className="flex items-center gap-3 text-gray-700">
                  <ExternalLink className="h-5 w-5 text-primary-600" />
                  <span className="text-sm font-medium">{settings.site_email}</span>
                </a>
              )}
              {settings.page_contacts_working_hours && (
                <div className="flex items-center gap-3 text-gray-500">
                  <Calendar className="h-5 w-5 text-primary-600" />
                  <span className="text-sm">{settings.page_contacts_working_hours}</span>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="mb-3 text-sm font-semibold text-gray-700">Социальные сети</p>
              <div className="grid grid-cols-2 gap-2">
                {settings.social_telegram && (
                  <a href={settings.social_telegram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg bg-sky-50 p-2.5 text-sm font-medium text-sky-700 active:scale-[0.97]">
                    <Send className="h-4 w-4" /> Telegram
                  </a>
                )}
                {settings.social_instagram && (
                  <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg bg-pink-50 p-2.5 text-sm font-medium text-pink-700 active:scale-[0.97]">
                    <ExternalLink className="h-4 w-4" /> Instagram
                  </a>
                )}
                {settings.social_whatsapp && (
                  <a href={settings.social_whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg bg-green-50 p-2.5 text-sm font-medium text-green-700 active:scale-[0.97]">
                    <Phone className="h-4 w-4" /> WhatsApp
                  </a>
                )}
                {settings.social_youtube && (
                  <a href={settings.social_youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-sm font-medium text-red-700 active:scale-[0.97]">
                    <ExternalLink className="h-4 w-4" /> YouTube
                  </a>
                )}
              </div>
            </div>

            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-xl bg-primary-600 py-3 text-center font-semibold text-white transition-[background-color] active:scale-[0.97]"
            >
              <ExternalLink className="mr-1 inline h-4 w-4" />
              Открыть полную версию сайта
            </a>
          </div>
        )}
      </div>

      {/* Bottom tab bar — fixed */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-gray-200 bg-white" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex flex-1 flex-col items-center gap-0.5 py-2 transition-[color,background-color] active:scale-[0.97]",
                active ? "text-primary-600" : "text-gray-400"
              )}
              style={{ minHeight: "56px" }}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type Slot = {
  id: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  type: string;
  title: string;
  totalSeats: number;
  bookedSeats: number;
  isActive: boolean;
};

function formatDate(dateStr: string): string {
  try {
    const parts = dateStr.split("-");
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return d.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "long" });
  } catch {
    return dateStr;
  }
}
