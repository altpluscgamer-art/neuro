"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Brain,
  Phone,
  Mail,
  ExternalLink,
  Send,
  MessageCircle,
  Share2,
  PlayCircle,
  ArrowRight,
} from "lucide-react";

type Settings = Record<string, string>;

const navLinks = [
  { href: "/about", label: "Обо мне" },
  { href: "/services", label: "Услуги" },
  { href: "/materials", label: "Материалы" },
  { href: "/courses", label: "Курсы" },
  { href: "/booking", label: "Записаться" },
  { href: "/screening", label: "Анкета" },
];

const socialKeys = [
  { key: "social_instagram", icon: ExternalLink, label: "Instagram" },
  { key: "social_telegram", icon: Send, label: "Telegram" },
  { key: "social_whatsapp", icon: MessageCircle, label: "WhatsApp" },
  { key: "social_vk", icon: Share2, label: "VK" },
  { key: "social_youtube", icon: PlayCircle, label: "YouTube" },
] as const;

export default function Footer() {
  const [settings, setSettings] = useState<Settings>({});

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {});
  }, []);

  const activeSocials = socialKeys.filter((s) => settings[s.key]);

  return (
    <footer className="border-t border-indigo-100 bg-indigo-950 text-indigo-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
              <Brain className="h-6 w-6 text-teal-400" />
              Нейро
            </Link>
            <p className="text-sm leading-relaxed text-indigo-300">
              Онлайн-платформа для родителей и детских нейропсихологов.
              Помогаем раскрыть потенциал каждого ребёнка через научно обоснованные методики.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-teal-400">
              Навигация
            </h3>
            <ul className="space-y-2">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-indigo-200 transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-teal-400">
              Контакты
            </h3>
            <ul className="space-y-3">
              {settings.site_phone && (
                <li>
                  <a
                    href={`tel:${settings.site_phone.replace(/[^\d+]/g, "")}`}
                    className="flex items-center gap-2 text-sm text-indigo-200 transition-colors hover:text-white"
                  >
                    <Phone className="h-4 w-4 text-teal-400" />
                    {settings.site_phone}
                  </a>
                </li>
              )}
              {settings.site_email && (
                <li>
                  <a
                    href={`mailto:${settings.site_email}`}
                    className="flex items-center gap-2 text-sm text-indigo-200 transition-colors hover:text-white"
                  >
                    <Mail className="h-4 w-4 text-teal-400" />
                    {settings.site_email}
                  </a>
                </li>
              )}
            </ul>

            {activeSocials.length > 0 && (
              <div className="mt-6 flex items-center gap-3">
                {activeSocials.map((s) => (
                  <a
                    key={s.key}
                    href={settings[s.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-indigo-800/50 p-2 text-indigo-300 transition-colors hover:bg-indigo-800 hover:text-white"
                    aria-label={s.label}
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {settings.social_telegram && (
          <div className="mt-8 flex items-center justify-center">
            <a
              href={settings.social_telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500/10 px-5 py-2.5 text-sm font-medium text-sky-300 ring-1 ring-sky-500/30 transition-colors hover:bg-sky-500/20 hover:text-sky-200"
            >
              <Send className="h-4 w-4" />
              Наш Telegram-канал
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        )}

        <div className="mt-10 border-t border-indigo-800 pt-6 text-center text-xs text-indigo-400">
          &copy; {new Date().getFullYear()} Нейро. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
