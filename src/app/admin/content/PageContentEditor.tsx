"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Home, User, Shield, BookOpen, Video, ClipboardList, Calendar, Phone, FileText, Check, Send } from "lucide-react";
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
  | "legal"
  | "telegram";

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
  { id: "telegram", label: "Telegram", icon: Send },
];

type FieldType = "text" | "textarea";
interface FieldDef {
  key: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  group: string;
}

const fieldDefs: Record<PageTab, FieldDef[]> = {
  home: [
    { key: "page_home_badge", label: "Бейдж", type: "text", placeholder: "Нейропсихологическая помощь детям", group: "Hero-блок" },
    { key: "page_home_title", label: "Заголовок (H1)", type: "text", placeholder: "Помогаем детям развиваться...", group: "Hero-блок" },
    { key: "page_home_subtitle", label: "Подзаголовок", type: "textarea", placeholder: "Научно обоснованные методики...", group: "Hero-блок" },
    { key: "page_home_cta1_text", label: "Текст кнопки 1", type: "text", placeholder: "Пройти анкету", group: "Кнопки" },
    { key: "page_home_cta1_link", label: "Ссылка кнопки 1", type: "text", placeholder: "/screening", group: "Кнопки" },
    { key: "page_home_cta2_text", label: "Текст кнопки 2", type: "text", placeholder: "Записаться", group: "Кнопки" },
    { key: "page_home_cta2_link", label: "Ссылка кнопки 2", type: "text", placeholder: "/booking", group: "Кнопки" },
    { key: "page_home_services_title", label: "Заголовок", type: "text", placeholder: "Наши услуги", group: "Блок услуг" },
    { key: "page_home_services_subtitle", label: "Подзаголовок", type: "text", placeholder: "Комплексный подход...", group: "Блок услуг" },
    { key: "page_home_problems_title", label: "Заголовок", type: "text", placeholder: "С какими трудностями мы помогаем", group: "Блок проблем" },
    { key: "page_home_testimonials_title", label: "Заголовок", type: "text", placeholder: "Отзывы родителей", group: "Отзывы" },
    { key: "page_home_testimonials_subtitle", label: "Подзаголовок", type: "text", placeholder: "Истории семей...", group: "Отзывы" },
    { key: "page_home_cta_title", label: "Заголовок", type: "text", placeholder: "Готовы помочь вашему ребёнку?", group: "Финальный CTA" },
    { key: "page_home_cta_subtitle", label: "Подзаголовок", type: "textarea", placeholder: "Запишитесь на консультацию...", group: "Финальный CTA" },
  ],
  about: [
    { key: "page_about_title", label: "Заголовок", type: "text", placeholder: "Обо мне", group: "Заголовок" },
    { key: "page_about_subtitle", label: "Подзаголовок", type: "textarea", placeholder: "Квалифицированный нейропсихолог...", group: "Заголовок" },
    { key: "page_about_text1", label: "Абзац 1", type: "textarea", placeholder: "Я — детский нейропсихолог...", group: "Текст" },
    { key: "page_about_text2", label: "Абзац 2", type: "textarea", placeholder: "Работаю с детьми от 1 до 13 лет...", group: "Текст" },
    { key: "page_about_text3", label: "Абзац 3", type: "textarea", placeholder: "Использую методику А.Р. Лурии...", group: "Текст" },
    { key: "page_about_stat1_label", label: "Название", type: "text", placeholder: "Опыт работы", group: "Статистика 1" },
    { key: "page_about_stat1_value", label: "Значение", type: "text", placeholder: "10+ лет", group: "Статистика 1" },
    { key: "page_about_stat2_label", label: "Название", type: "text", placeholder: "Детей помогли", group: "Статистика 2" },
    { key: "page_about_stat2_value", label: "Значение", type: "text", placeholder: "500+", group: "Статистика 2" },
    { key: "page_about_stat3_label", label: "Название", type: "text", placeholder: "Методик", group: "Статистика 3" },
    { key: "page_about_stat3_value", label: "Значение", type: "text", placeholder: "7", group: "Статистика 3" },
    { key: "page_about_stat4_label", label: "Название", type: "text", placeholder: "Лет практики", group: "Статистика 4" },
    { key: "page_about_stat4_value", label: "Значение", type: "text", placeholder: "10", group: "Статистика 4" },
    { key: "page_about_principle1_title", label: "Название", type: "text", placeholder: "Индивидуальный подход", group: "Принцип 1" },
    { key: "page_about_principle1_desc", label: "Описание", type: "textarea", placeholder: "Каждый ребёнок уникален...", group: "Принцип 1" },
    { key: "page_about_principle2_title", label: "Название", type: "text", placeholder: "Научная база", group: "Принцип 2" },
    { key: "page_about_principle2_desc", label: "Описание", type: "textarea", placeholder: "Методики основаны на...", group: "Принцип 2" },
    { key: "page_about_principle3_title", label: "Название", type: "text", placeholder: "Игровая форма", group: "Принцип 3" },
    { key: "page_about_principle3_desc", label: "Описание", type: "textarea", placeholder: "Занятия проходят в игре...", group: "Принцип 3" },
    { key: "page_about_principle4_title", label: "Название", type: "text", placeholder: "Поддержка родителей", group: "Принцип 4" },
    { key: "page_about_principle4_desc", label: "Описание", type: "textarea", placeholder: "Я помогаю не только детям...", group: "Принцип 4" },
  ],
  services: [
    { key: "page_services_title", label: "Заголовок", type: "text", placeholder: "Услуги", group: "Заголовок" },
    { key: "page_services_subtitle", label: "Подзаголовок", type: "text", placeholder: "Комплексный подход...", group: "Заголовок" },
    { key: "page_services_step1_title", label: "Название", type: "text", placeholder: "Диагностика", group: "Шаг 1" },
    { key: "page_services_step1_desc", label: "Описание", type: "textarea", placeholder: "Выявляем сильные и слабые стороны", group: "Шаг 1" },
    { key: "page_services_step2_title", label: "Название", type: "text", placeholder: "План", group: "Шаг 2" },
    { key: "page_services_step2_desc", label: "Описание", type: "textarea", placeholder: "Составляем индивидуальный маршрут", group: "Шаг 2" },
    { key: "page_services_step3_title", label: "Название", type: "text", placeholder: "Занятия", group: "Шаг 3" },
    { key: "page_services_step3_desc", label: "Описание", type: "textarea", placeholder: "Игровая нейрокоррекция", group: "Шаг 3" },
    { key: "page_services_step4_title", label: "Название", type: "text", placeholder: "Поддержка", group: "Шаг 4" },
    { key: "page_services_step4_desc", label: "Описание", type: "textarea", placeholder: "Рекомендации для родителей", group: "Шаг 4" },
  ],
  materials: [
    { key: "page_materials_title", label: "Заголовок", type: "text", placeholder: "Материалы", group: "Заголовок" },
    { key: "page_materials_subtitle", label: "Подзаголовок", type: "text", placeholder: "Статьи о развитии детей...", group: "Заголовок" },
  ],
  courses: [
    { key: "page_courses_title", label: "Заголовок", type: "text", placeholder: "Курсы", group: "Заголовок" },
    { key: "page_courses_subtitle", label: "Подзаголовок", type: "text", placeholder: "Видео-курсы с упражнениями...", group: "Заголовок" },
  ],
  screening: [
    { key: "page_screening_title", label: "Заголовок", type: "text", placeholder: "Скрининг развития ребёнка", group: "Заголовок" },
    { key: "page_screening_subtitle", label: "Подзаголовок", type: "textarea", placeholder: "Ответьте на несколько вопросов...", group: "Заголовок" },
    { key: "page_screening_time", label: "Время прохождения", type: "text", placeholder: "5–7 минут", group: "Информация" },
    { key: "page_screening_disclaimer", label: "Дисклеймер", type: "textarea", placeholder: "Это не диагностика...", group: "Информация" },
  ],
  booking: [
    { key: "page_booking_title", label: "Заголовок", type: "text", placeholder: "Расписание", group: "Заголовок" },
    { key: "page_booking_subtitle", label: "Подзаголовок", type: "text", placeholder: "Выберите удобное время...", group: "Заголовок" },
  ],
  contacts: [
    { key: "site_phone", label: "Телефон", type: "text", placeholder: "+7 (999) 123-45-67", group: "Контакты" },
    { key: "site_email", label: "Email", type: "text", placeholder: "info@neuro.ru", group: "Контакты" },
    { key: "page_contacts_working_hours", label: "Режим работы", type: "text", placeholder: "с 9:00 до 19:00", group: "Контакты" },
    { key: "page_contacts_address", label: "Адрес", type: "text", placeholder: "г. Москва, ул. Примерная, д. 1", group: "Контакты" },
    { key: "social_instagram", label: "Instagram", type: "text", placeholder: "https://instagram.com/...", group: "Соцсети" },
    { key: "social_telegram", label: "Telegram", type: "text", placeholder: "https://t.me/...", group: "Соцсети" },
    { key: "social_whatsapp", label: "WhatsApp", type: "text", placeholder: "https://wa.me/...", group: "Соцсети" },
    { key: "social_vk", label: "ВКонтакте", type: "text", placeholder: "https://vk.com/...", group: "Соцсети" },
    { key: "social_youtube", label: "YouTube", type: "text", placeholder: "https://youtube.com/...", group: "Соцсети" },
  ],
  legal: [
    { key: "page_privacy_title", label: "Заголовок политики конфиденциальности", type: "text", placeholder: "Политика конфиденциальности", group: "Политика" },
    { key: "page_terms_title", label: "Заголовок пользовательского соглашения", type: "text", placeholder: "Пользовательское соглашение", group: "Соглашение" },
  ],
  telegram: [
    { key: "tg_home_title", label: "Название (заголовок карточки)", type: "text", placeholder: "Нейро", group: "Hero-карточка" },
    { key: "tg_home_description", label: "Описание", type: "textarea", placeholder: "Онлайн-платформа для родителей и детских нейропсихологов. Помощь детям от 1 до 13 лет: внимание, память, поведение, адаптация к школе, тревожность.", group: "Hero-карточка" },
    { key: "tg_home_screening_title", label: "Заголовок кнопки анкеты", type: "text", placeholder: "Пройти анкету", group: "Кнопка «Анкета»" },
    { key: "tg_home_screening_subtitle", label: "Подзаголовок кнопки анкеты", type: "text", placeholder: "5–7 минут, персональный отчёт", group: "Кнопка «Анкета»" },
    { key: "tg_home_booking_title", label: "Заголовок кнопки записи", type: "text", placeholder: "Записаться на приём", group: "Кнопка «Запись»" },
    { key: "tg_home_booking_subtitle", label: "Подзаголовок кнопки записи", type: "text", placeholder: "Выбрать удобное время", group: "Кнопка «Запись»" },
    { key: "tg_home_contacts_title", label: "Заголовок кнопки контактов", type: "text", placeholder: "Контакты", group: "Кнопка «Контакты»" },
    { key: "tg_home_contacts_subtitle", label: "Подзаголовок кнопки контактов", type: "text", placeholder: "Телефон, email, соцсети", group: "Кнопка «Контакты»" },
    { key: "tg_home_site_link", label: "Текст ссылки на сайт", type: "text", placeholder: "Открыть полную версию сайта", group: "Ссылка на сайт" },
  ],
};

const groupIcons: Record<string, string> = {
  "Hero-блок": "🏠",
  "Кнопки": "🔗",
  "Блок услуг": "🛠️",
  "Блок проблем": "⚠️",
  "Отзывы": "⭐",
  "Финальный CTA": "🎯",
  "Заголовок": "📋",
  "Текст": "📝",
  "Статистика 1": "📊",
  "Статистика 2": "📊",
  "Статистика 3": "📊",
  "Статистика 4": "📊",
  "Принцип 1": "✨",
  "Принцип 2": "✨",
  "Принцип 3": "✨",
  "Принцип 4": "✨",
  "Шаг 1": "1️⃣",
  "Шаг 2": "2️⃣",
  "Шаг 3": "3️⃣",
  "Шаг 4": "4️⃣",
  "Информация": "ℹ️",
  "Контакты": "📞",
  "Соцсети": "🌐",
  "Политика": "🔒",
  "Соглашение": "📄",
  "Hero-карточка": "🏠",
  "Кнопка «Анкета»": "📝",
  "Кнопка «Запись»": "📅",
  "Кнопка «Контакты»": "📞",
  "Ссылка на сайт": "🌐",
};

export default function PageContentEditor() {
  const [activeTab, setActiveTab] = useState<PageTab>("home");
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);

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
    setDirty(true);
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
      setDirty(false);
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
  const groups = [...new Set(fields.map((f) => f.group))];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Редактирование страниц</h2>
        <p className="text-sm text-gray-500">Текстовые блоки на всех страницах сайта. Редактируйте и сразу видите, как это будет выглядеть.</p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMessage(null); setDirty(false); }}
              className={clsx(
                "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-[color,background-color] active:scale-[0.97]",
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

      {/* Visual preview blocks */}
      <div className="space-y-4">
        {groups.map((groupName) => {
          const groupFields = fields.filter((f) => f.group === groupName);
          const icon = groupIcons[groupName] || "📋";

          return (
            <div key={groupName} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              {/* Group header */}
              <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
                <span className="text-base">{icon}</span>
                <span className="text-sm font-semibold text-gray-700">{groupName}</span>
                <span className="ml-auto text-xs text-gray-400">{groupFields.length} {groupFields.length === 1 ? "поле" : "полей"}</span>
              </div>

              {/* Preview + Edit */}
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Left: Live preview */}
                <div className="border-b border-gray-100 bg-cream p-4 lg:border-b-0 lg:border-r">
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Превью</div>
                  <div className="space-y-2">
                    {groupFields.map((field) => {
                      const val = content[field.key] ?? "";
                      const display = val || field.placeholder || "";
                      if (field.type === "textarea") {
                        return (
                          <div key={field.key}>
                            <span className="text-[10px] font-medium uppercase text-gray-400">{field.label}: </span>
                            <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">{display || "—"}</p>
                          </div>
                        );
                      }
                      return (
                        <div key={field.key} className="flex flex-wrap items-baseline gap-1">
                          <span className="text-[10px] font-medium uppercase text-gray-400">{field.label}:</span>
                          <span className="text-sm text-gray-700">{display || "—"}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Edit form */}
                <div className="p-4">
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-primary-600">Редактор</div>
                  <div className="space-y-3">
                    {groupFields.map((field) => (
                      <div key={field.key}>
                        <label className="mb-1 block text-xs font-medium text-gray-600">{field.label}</label>
                        {field.type === "textarea" ? (
                          <textarea
                            value={content[field.key] ?? ""}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-[border-color,box-shadow] active:scale-[0.99]"
                            style={{ fontSize: "16px" }}
                          />
                        ) : (
                          <input
                            type="text"
                            value={content[field.key] ?? ""}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-[border-color,box-shadow] active:scale-[0.99]"
                            style={{ fontSize: "16px" }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save bar */}
      <div className="sticky bottom-4 z-10 flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
        <button
          onClick={save}
          disabled={saving || !dirty}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-[color,transform] hover:bg-primary-700 active:scale-[0.97] disabled:opacity-50"
          style={{ touchAction: "manipulation", minHeight: "44px" }}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : dirty ? <Save className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          {saving ? "Сохранение..." : dirty ? "Сохранить" : "Сохранено"}
        </button>
        {message && (
          <span className={clsx("text-sm font-medium", message.type === "ok" ? "text-green-600" : "text-red-600")}>
            {message.text}
          </span>
        )}
        {dirty && (
          <span className="ml-auto text-xs text-amber-600">● Есть несохранённые изменения</span>
        )}
      </div>
    </div>
  );
}
