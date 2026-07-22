"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  Brain,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  Send,
  MessageCircle,
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
  { key: "social_telegram", icon: Send, label: "Telegram" },
  { key: "social_instagram", icon: ExternalLink, label: "Instagram" },
  { key: "social_whatsapp", icon: MessageCircle, label: "WhatsApp" },
  { key: "social_youtube", icon: PlayCircle, label: "YouTube" },
] as const;

const touchAction: CSSProperties = { touchAction: "manipulation" };

export default function Footer() {
  const [settings, setSettings] = useState<Settings>({});

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {});
  }, []);

  const activeSocials = socialKeys.filter((s) => settings[s.key]);
  const phone = settings.site_phone;
  const email = settings.site_email;

  return (
    <footer className="bg-primary-950 text-primary-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* About */}
          <div>
            <Link
              href="/"
              className="mb-4 flex items-center gap-2 text-lg font-bold text-white"
              style={touchAction}
            >
              <Brain className="h-6 w-6 text-accent-400" />
              Нейро
            </Link>
            <p className="text-sm leading-relaxed text-primary-300">
              Онлайн-платформа для родителей и детских нейропсихологов.
              Помогаем раскрыть потенциал каждого ребёнка через научно
              обоснованные методики.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent-300">
              Навигация
            </h3>
            <ul className="space-y-2">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-primary-200 transition-colors hover:text-white"
                    style={touchAction}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent-300">
              Контакты
            </h3>
            <ul className="space-y-3">
              {phone && (
                <li>
                  <a
                    href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                    className="flex items-center gap-2 text-sm text-primary-200 transition-colors hover:text-white"
                    style={touchAction}
                  >
                    <Phone className="h-4 w-4 text-accent-400" />
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-2 text-sm text-primary-200 transition-colors hover:text-white"
                    style={touchAction}
                  >
                    <Mail className="h-4 w-4 text-accent-400" />
                    {email}
                  </a>
                </li>
              )}
              <li className="flex items-center gap-2 text-sm text-primary-200">
                <Clock className="h-4 w-4 text-accent-400" />
                Режим работы: с 9:00 до 19:00
              </li>
            </ul>

            {activeSocials.length > 0 && (
              <div className="mt-6 flex items-center gap-3">
                {activeSocials.map((s) => (
                  <a
                    key={s.key}
                    href={settings[s.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-primary-800/50 p-2 text-primary-300 transition-colors hover:bg-primary-800 hover:text-white"
                    style={touchAction}
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
              className="inline-flex items-center gap-2 rounded-xl bg-accent-400/10 px-5 py-2.5 text-sm font-medium text-accent-300 ring-1 ring-accent-400/30 transition-colors hover:bg-accent-400/20 hover:text-accent-200"
              style={touchAction}
            >
              <Send className="h-4 w-4" />
              Наш Telegram-канал
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        )}

        <div className="mt-10 border-t border-primary-800 pt-6 text-center text-xs text-primary-200">
          <div className="mb-3 flex items-center justify-center gap-4">
            <Link
              href="/privacy"
              className="text-primary-200 transition-colors hover:text-white"
              style={touchAction}
            >
              Политика конфиденциальности
            </Link>
            <Link
              href="/terms"
              className="text-primary-200 transition-colors hover:text-white"
              style={touchAction}
            >
              Условия использования
            </Link>
          </div>
          <p>&copy; {new Date().getFullYear()} Нейро. Все права защищены.</p>
          <p className="mt-1 text-primary-300">
            Онлайн-платформа для родителей и детских специалистов
          </p>
        </div>
      </div>
    </footer>
  );
}
