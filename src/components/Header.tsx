"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Brain, Menu, X, Send, ExternalLink } from "lucide-react";
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
    <header className="sticky top-0 z-50 border-b border-indigo-100 bg-white/90 backdrop-blur-md">
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

      {mobileOpen && (
        <div className="border-t border-indigo-100 bg-white lg:hidden">
          <nav className="mx-auto max-w-7xl space-y-1 px-4 pb-4 pt-2 sm:px-6">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="block rounded-lg px-3 py-2.5 text-base font-medium text-gray-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="flex items-center gap-3 pt-3">
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
          </nav>
        </div>
      )}
    </header>
  );
}
