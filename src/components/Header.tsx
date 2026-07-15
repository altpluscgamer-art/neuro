"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Brain, Menu, X, LogIn, Send, ExternalLink } from "lucide-react";
import { clsx } from "clsx";

type Settings = Record<string, string>;

const navLinks = [
  { href: "/about", label: "Обо мне" },
  { href: "/services", label: "Услуги" },
  { href: "/materials", label: "Материалы" },
  { href: "/courses", label: "Курсы" },
  { href: "/booking", label: "Записаться" },
  { href: "/screening", label: "Анкета" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({});

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-indigo-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-indigo-700">
          <Brain className="h-7 w-7 text-indigo-600" />
          <span>Нейро</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {settings.social_telegram && (
            <a
              href={settings.social_telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center justify-center rounded-lg p-2 text-sky-500 transition-colors hover:bg-sky-50 sm:inline-flex"
              aria-label="Telegram"
            >
              <Send className="h-5 w-5" />
            </a>
          )}
          {settings.social_instagram && (
            <a
              href={settings.social_instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center justify-center rounded-lg p-2 text-pink-500 transition-colors hover:bg-pink-50 sm:inline-flex"
              aria-label="Instagram"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          )}

          <Link
            href="/auth/login"
            className="hidden items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 sm:inline-flex"
          >
            <LogIn className="h-4 w-4" />
            Войти
          </Link>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div
        className={clsx(
          "overflow-hidden border-t border-indigo-100 transition-[max-height] duration-300 ease-in-out lg:hidden",
          mobileOpen ? "max-h-96" : "max-h-0 border-t-0"
        )}
      >
        <nav className="mx-auto max-w-7xl space-y-1 px-4 pb-4 pt-2 sm:px-6 lg:px-8">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="flex items-center gap-2 pt-2">
            {settings.social_telegram && (
              <a
                href={settings.social_telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg p-2 text-sky-500 transition-colors hover:bg-sky-50"
                aria-label="Telegram"
              >
                <Send className="h-5 w-5" />
              </a>
            )}
            {settings.social_instagram && (
              <a
                href={settings.social_instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg p-2 text-pink-500 transition-colors hover:bg-pink-50"
                aria-label="Instagram"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            )}
          </div>
          <Link
            href="/auth/login"
            className="mt-2 flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            onClick={() => setMobileOpen(false)}
          >
            <LogIn className="h-4 w-4" />
            Войти
          </Link>
        </nav>
      </div>
    </header>
  );
}
