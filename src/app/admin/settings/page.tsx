"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Mail,
  CreditCard,
  BarChart3,
  Megaphone,
  Share2,
  Star,
  Phone,
  Eye,
  EyeOff,
  Save,
  Loader2,
} from "lucide-react";
import { clsx } from "clsx";

interface FieldDef {
  key: string;
  label: string;
  sensitive?: boolean;
  type?: "boolean" | "textarea";
  placeholder?: string;
}

const tabs = [
  { id: "telegram", label: "Telegram", icon: Settings },
  { id: "smtp", label: "Email/SMTP", icon: Mail },
  { id: "payment", label: "Оплата", icon: CreditCard },
  { id: "analytics", label: "Аналитика", icon: BarChart3 },
  { id: "ads", label: "Реклама", icon: Megaphone },
  { id: "social", label: "Соцсети", icon: Share2 },
  { id: "reviews", label: "Отзывы", icon: Star },
  { id: "contacts", label: "Контакты", icon: Phone },
] as const;

type TabId = (typeof tabs)[number]["id"];

const tabFields: Record<TabId, FieldDef[]> = {
  telegram: [
    { key: "telegram_bot_token", label: "Bot Token", sensitive: true, placeholder: "123456:ABC-DEF..." },
    { key: "telegram_chat_id", label: "Chat ID", placeholder: "-1001234567890" },
    { key: "telegram_channel_link", label: "Ссылка на канал", placeholder: "https://t.me/neuro_platform" },
    { key: "telegram_webhook_enabled", label: "Webhook включён", type: "boolean" },
    { key: "telegram_auto_sync", label: "Авто-синхронизация статей", type: "boolean" },
  ],
  smtp: [
    { key: "smtp_host", label: "SMTP-сервер", placeholder: "smtp.yandex.ru" },
    { key: "smtp_port", label: "Порт", placeholder: "465" },
    { key: "smtp_user", label: "Пользователь", placeholder: "noreply@example.com" },
    { key: "smtp_pass", label: "Пароль", sensitive: true },
    { key: "smtp_from", label: "Отправитель", placeholder: "noreply@example.com" },
  ],
  payment: [
    { key: "yookassa_shop_id", label: "Shop ID", placeholder: "123456" },
    { key: "yookassa_secret_key", label: "Секретный ключ", sensitive: true, placeholder: "test_..." },
    { key: "yookassa_test_mode", label: "Тестовый режим", type: "boolean" },
  ],
  analytics: [
    { key: "metrica_id", label: "Номер счётчика", placeholder: "12345678" },
    { key: "metrica_enabled", label: "Метрика включена", type: "boolean" },
  ],
  ads: [
    { key: "ads_yandex_enabled", label: "Реклама Яндекс включена", type: "boolean" },
    { key: "ads_yandex_client_id", label: "Yandex Client ID", placeholder: "R-A-123456-1" },
    { key: "ads_google_enabled", label: "Реклама Google включена", type: "boolean" },
    { key: "ads_google_client_id", label: "Google Client ID", placeholder: "ca-pub-1234567890" },
    { key: "ads_custom_html", label: "Произвольный HTML-блок", type: "textarea", placeholder: "<div>...</div>" },
  ],
  social: [
    { key: "social_instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
    { key: "social_telegram", label: "Telegram", placeholder: "https://t.me/..." },
    { key: "social_whatsapp", label: "WhatsApp", placeholder: "https://wa.me/..." },
    { key: "social_vk", label: "ВКонтакте", placeholder: "https://vk.com/..." },
    { key: "social_youtube", label: "YouTube", placeholder: "https://youtube.com/..." },
  ],
  reviews: [
    { key: "reviews_yandex_url", label: "Yandex Maps", placeholder: "https://yandex.ru/maps/org/..." },
    { key: "reviews_google_url", label: "Google Maps", placeholder: "https://maps.google.com/..." },
    { key: "reviews_auto_sync", label: "Авто-синхронизация отзывов", type: "boolean" },
  ],
  contacts: [
    { key: "site_phone", label: "Телефон", placeholder: "+7 (999) 123-45-67" },
    { key: "site_email", label: "Email", placeholder: "info@example.com" },
  ],
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("telegram");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (typeof data === "object" && !data.error) setSettings(data);
      })
      .catch(() => setMessage({ type: "err", text: "Ошибка загрузки настроек" }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = useCallback((key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleToggle = useCallback((key: string) => {
    setSettings((prev) => ({ ...prev, [key]: prev[key] === "true" ? "false" : "true" }));
  }, []);

  const toggleVisibility = useCallback((key: string) => {
    setVisibleFields((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const saveTab = useCallback(async () => {
    setSaving(true);
    setMessage(null);
    const fields = tabFields[activeTab];
    const toSave: Record<string, string> = {};
    for (const f of fields) {
      const val = settings[f.key];
      toSave[f.key] = val ?? (f.type === "boolean" ? "false" : "");
    }
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: toSave }),
      });
      if (!res.ok) throw new Error();
      setMessage({ type: "ok", text: "Настройки сохранены" });
    } catch {
      setMessage({ type: "err", text: "Ошибка сохранения" });
    } finally {
      setSaving(false);
    }
  }, [activeTab, settings]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  const fields = tabFields[activeTab];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex min-w-max">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMessage(null); }}
                  className={clsx(
                    "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                    active
                      ? "border-violet-600 text-violet-700"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 space-y-5">
          {fields.map((field) => {
            if (field.type === "boolean") {
              const checked = settings[field.key] === "true";
              return (
                <div key={field.key} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">{field.label}</label>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    onClick={() => handleToggle(field.key)}
                    className={clsx(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                      checked ? "bg-violet-600" : "bg-gray-200"
                    )}
                  >
                    <span
                      className={clsx(
                        "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform",
                        checked ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              );
            }

            if (field.type === "textarea") {
              return (
                <div key={field.key}>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">{field.label}</label>
                  <textarea
                    value={settings[field.key] ?? ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={6}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
                  />
                </div>
              );
            }

            const isPassword = field.sensitive;
            const visible = visibleFields[field.key];

            return (
              <div key={field.key}>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">{field.label}</label>
                <div className="relative">
                  <input
                    type={isPassword && !visible ? "password" : "text"}
                    value={settings[field.key] ?? ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className={clsx(
                      "w-full rounded-lg border border-gray-300 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500",
                      isPassword ? "pl-3 pr-10" : "px-3"
                    )}
                  />
                  {isPassword && (
                    <button
                      type="button"
                      onClick={() => toggleVisibility(field.key)}
                      aria-label={visible ? "Скрыть" : "Показать"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={saveTab}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700 active:bg-violet-800 disabled:opacity-60"
              style={{ touchAction: "manipulation", minHeight: "44px" }}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Сохранить
            </button>

            {message && (
              <span
                className={clsx(
                  "text-sm font-medium",
                  message.type === "ok" ? "text-green-600" : "text-red-600"
                )}
              >
                {message.text}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
