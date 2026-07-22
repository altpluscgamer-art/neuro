"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Home, User, BookOpen, Phone, Calendar, FileText, Shield, ClipboardList, Video } from "lucide-react";
import { clsx } from "clsx";

type PageTab =
  | "home"
  | "about"
  | "services"
  | "materials"
  | "courses"
  | "screening"
  | "booking"
  | "contacts"
  | "legal";

const tabs: { id: PageTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Главная", icon: Home },
  { id: "about", label: "Обо мне", icon: User },
  { id: "services", label: "Услуги", icon: Shield },
  { id: "materials", label: "Материалы", icon: BookOpen },
  { id: "courses", label: "Курсы", icon: Video },
  { id: "screening", label: "Анкета", icon: ClipboardList },
  { id: "booking", label: "Запись", icon: Calendar },
  { id: "contacts", label: "Контакты", icon: Phone },
  { id: "legal", label: "Правовые", icon: FileText },
];

type FieldDef = { key: string; label: string; type?: "text" | "textarea"; placeholder?: string };

const fieldDefs: Record<PageTab, FieldDef[]> = {
  home: [
    { key: "page_home_badge", label: "Бейдж в hero", type: "text", placeholder: "Нейропсихологическая помощь детям" },
    { key: "page_home_title", label: "Заголовок (H1)", type: "text", placeholder: "Помогаем детям развиваться, а родителям — понимать" },
    { key: "page_home_subtitle", label: "Подзаголовок", type: "textarea", placeholder: "Научно обоснованные методики для диагностики и развития детей от 1 до 13 лет..." },
    { key: "page_home_cta1_text", label: "Текст кнопки 1", type: "text", placeholder: "Пройти анкету" },
    { key: "page_home_cta1_link", label: "Ссылка кнопки 1", type: "text", placeholder: "/screening" },
    { key: "page_home_cta2_text", label: "Текст кнопки 2", type: "text", placeholder: "Записаться" },
    { key: "page_home_cta2_link", label: "Ссылка кнопки 2", type: "text", placeholder: "/booking" },
    { key: "page_home_services_title", label: "Заголовок блока услуг", type: "text", placeholder: "Наши услуги" },
    { key: "page_home_services_subtitle", label: "Подзаголовок блока услуг", type: "text", placeholder: "Комплексный подход к развитию и поддержке вашего ребёнка" },
    { key: "page_home_problems_title", label: "Заголовок блока проблем", type: "text", placeholder: "С какими трудностями мы помогаем" },
    { key: "page_home_testimonials_title", label: "Заголовок отзывов", type: "text", placeholder: "Отзывы родителей" },
    { key: "page_home_testimonials_subtitle", label: "Подзаголовок отзывов", type: "text", placeholder: "Истории семей, которым мы помогли" },
    { key: "page_home_cta_title", label: "Заголовок финального CTA", type: "text", placeholder: "Готовы помочь вашему ребёнку?" },
    { key: "page_home_cta_subtitle", label: "Подзаголовок финального CTA", type: "textarea", placeholder: "Запишитесь на консультацию или пройдите скрининг-анкету..." },
  ],
  about: [
    { key: "page_about_title", label: "Заголовок", type: "text", placeholder: "Обо мне" },
    { key: "page_about_subtitle", label: "Подзаголовок", type: "textarea", placeholder: "Квалифицированный детский нейропсихолог..." },
    { key: "page_about_text1", label: "Абзац 1", type: "textarea", placeholder: "Я — детский нейропсихолог..." },
    { key: "page_about_text2", label: "Абзац 2", type: "textarea", placeholder: "Работаю с детьми от 1 до 13 лет..." },
    { key: "page_about_text3", label: "Абзац 3", type: "textarea", placeholder: "Использую методику А.Р. Лурии..." },
    { key: "page_about_stat1_label", label: "Статистика 1 — название", type: "text", placeholder: "Опыт работы" },
    { key: "page_about_stat1_value", label: "Статистика 1 — значение", type: "text", placeholder: "10+ лет" },
    { key: "page_about_stat2_label", label: "Статистика 2 — название", type: "text", placeholder: "Детей помогли" },
    { key: "page_about_stat2_value", label: "Статистика 2 — значение", type: "text", placeholder: "500+" },
    { key: "page_about_stat3_label", label: "Статистика 3 — название", type: "text", placeholder: "Методик" },
    { key: "page_about_stat3_value", label: "Статистика 3 — значение", type: "text", placeholder: "7" },
    { key: "page_about_stat4_label", label: "Статистика 4 — название", type: "text", placeholder: "Лет практики" },
    { key: "page_about_stat4_value", label: "Статистика 4 — значение", type: "text", placeholder: "10" },
    { key: "page_about_principle1_title", label: "Принцип 1 — название", type: "text", placeholder: "Индивидуальный подход" },
    { key: "page_about_principle1_desc", label: "Принцип 1 — описание", type: "textarea", placeholder: "Каждый ребёнок уникален..." },
    { key: "page_about_principle2_title", label: "Принцип 2 — название", type: "text", placeholder: "Научная база" },
    { key: "page_about_principle2_desc", label: "Принцип 2 — описание", type: "textarea", placeholder: "Методики основаны на..." },
    { key: "page_about_principle3_title", label: "Принцип 3 — название", type: "text", placeholder: "Игровая форма" },
    { key: "page_about_principle3_desc", label: "Принцип 3 — описание", type: "textarea", placeholder: "Занятия проходят в игре..." },
    { key: "page_about_principle4_title", label: "Принцип 4 — название", type: "text", placeholder: "Поддержка родителей" },
    { key: "page_about_principle4_desc", label: "Принцип 4 — описание", type: "textarea", placeholder: "Я помогаю не только детям..." },
  ],
  services: [
    { key: "page_services_title", label: "Заголовок", type: "text", placeholder: "Услуги" },
    { key: "page_services_subtitle", label: "Подзаголовок", type: "text", placeholder: "Комплексный подход к развитию и поддержке вашего ребёнка" },
    { key: "page_services_step1_title", label: "Шаг 1 — название", type: "text", placeholder: "Диагностика" },
    { key: "page_services_step1_desc", label: "Шаг 1 — описание", type: "textarea", placeholder: "Выявляем сильные и слабые стороны" },
    { key: "page_services_step2_title", label: "Шаг 2 — название", type: "text", placeholder: "План" },
    { key: "page_services_step2_desc", label: "Шаг 2 — описание", type: "textarea", placeholder: "Составляем индивидуальный маршрут" },
    { key: "page_services_step3_title", label: "Шаг 3 — название", type: "text", placeholder: "Занятия" },
    { key: "page_services_step3_desc", label: "Шаг 3 — описание", type: "textarea", placeholder: "Игровая нейрокоррекция" },
    { key: "page_services_step4_title", label: "Шаг 4 — название", type: "text", placeholder: "Поддержка" },
    { key: "page_services_step4_desc", label: "Шаг 4 — описание", type: "textarea", placeholder: "Рекомендации для родителей" },
  ],
  materials: [
    { key: "page_materials_title", label: "Заголовок", type: "text", placeholder: "Материалы" },
    { key: "page_materials_subtitle", label: "Подзаголовок", type: "text", placeholder: "Статьи о развитии детей, нейропсихологии и практических рекомендациях" },
  ],
  courses: [
    { key: "page_courses_title", label: "Заголовок", type: "text", placeholder: "Курсы" },
    { key: "page_courses_subtitle", label: "Подзаголовок", type: "text", placeholder: "Видео-курсы с практическими упражнениями для развития ребёнка" },
  ],
  screening: [
    { key: "page_screening_title", label: "Заголовок", type: "text", placeholder: "Скрининг развития ребёнка" },
    { key: "page_screening_subtitle", label: "Подзаголовок", type: "textarea", placeholder: "Ответьте на несколько вопросов, чтобы получить персональные рекомендации..." },
    { key: "page_screening_time", label: "Время прохождения", type: "text", placeholder: "5–7 минут" },
    { key: "page_screening_disclaimer", label: "Дисклеймер", type: "textarea", placeholder: "Это не диагностика и не медицинское заключение..." },
  ],
  booking: [
    { key: "page_booking_title", label: "Заголовок", type: "text", placeholder: "Расписание" },
    { key: "page_booking_subtitle", label: "Подзаголовок", type: "text", placeholder: "Выберите удобное время для консультации или занятия" },
  ],
  contacts: [
    { key: "site_phone", label: "Телефон", type: "text", placeholder: "+7 (999) 123-45-67" },
    { key: "site_email", label: "Email", type: "text", placeholder: "info@neuro.ru" },
    { key: "page_contacts_working_hours", label: "Режим работы", type: "text", placeholder: "с 9:00 до 19:00" },
    { key: "page_contacts_address", label: "Адрес", type: "text", placeholder: "г. Москва, ул. Примерная, д. 1" },
    { key: "social_instagram", label: "Instagram", type: "text", placeholder: "https://instagram.com/..." },
    { key: "social_telegram", label: "Telegram", type: "text", placeholder: "https://t.me/..." },
    { key: "social_whatsapp", label: "WhatsApp", type: "text", placeholder: "https://wa.me/..." },
    { key: "social_vk", label: "ВКонтакте", type: "text", placeholder: "https://vk.com/..." },
    { key: "social_youtube", label: "YouTube", type: "text", placeholder: "https://youtube.com/..." },
  ],
  legal: [
    { key: "page_privacy_title", label: "Заголовок политики конфиденциальности", type: "text", placeholder: "Политика конфиденциальности" },
    { key: "page_terms_title", label: "Заголовок пользовательского соглашения", type: "text", placeholder: "Пользовательское соглашение" },
  ],
};

export default function PageContentEditor() {
  const [activeTab, setActiveTab] = useState<PageTab>("home");
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/page-content")
      .then((r) => r.json())
      .then((data) => {
        if (typeof data === "object" && !data.error) setContent(data);
      })
      .catch(() => setMessage({ type: "err", text: "Ошибка загрузки" }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    const fields = fieldDefs[activeTab];
    const toSave: Record<string, string> = {};
    for (const f of fields) {
      toSave[f.key] = content[f.key] ?? "";
    }
    try {
      const res = await fetch("/api/admin/page-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: toSave }),
      });
      if (!res.ok) throw new Error();
      setMessage({ type: "ok", text: "Сохранено" });
    } catch {
      setMessage({ type: "err", text: "Ошибка сохранения" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const fields = fieldDefs[activeTab];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Редактирование страниц</h2>
        <p className="text-sm text-gray-500">Текстовые блоки, заголовки и описания на всех страницах сайта</p>
      </div>

      {/* Tab navigation — scrollable on mobile */}
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMessage(null); }}
              className={clsx(
                "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                activeTab === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
              style={{ minHeight: "40px" }}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">{field.label}</label>
            {field.type === "textarea" ? (
              <textarea
                value={content[field.key] ?? ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                style={{ fontSize: "16px" }}
              />
            ) : (
              <input
                type="text"
                value={content[field.key] ?? ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                style={{ fontSize: "16px" }}
              />
            )}
          </div>
        ))}

        <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 active:bg-primary-800 disabled:opacity-60"
            style={{ touchAction: "manipulation", minHeight: "44px" }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Сохранить
          </button>
          {message && (
            <span className={clsx("text-sm font-medium", message.type === "ok" ? "text-green-600" : "text-red-600")}>
              {message.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
