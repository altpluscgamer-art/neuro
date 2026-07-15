"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Brain, Menu, X, Send, ExternalLink } from "lucide-react";

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
  const [socialLinks, setSocialLinks] = useState<{
    telegram?: string;
    instagram?: string;
  }>({});

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) =>
        setSocialLinks({
          telegram: data.social_telegram,
          instagram: data.social_instagram,
        })
      )
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-[100] border-b border-indigo-100 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-indigo-700"
        >
          <Brain className="h-7 w-7 text-indigo-600" />
          <span>Нейро</span>
        </Link>

        {/* Desktop nav */}
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

        {/* Mobile menu button + desktop social */}
        <div className="flex items-center gap-2">
          {socialLinks.telegram && (
            <a
              href={socialLinks.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-lg p-2.5 text-sky-500 hover:bg-sky-50 sm:inline-flex"
              aria-label="Telegram"
            >
              <Send className="h-5 w-5" />
            </a>
          )}
          {socialLinks.instagram && (
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-lg p-2.5 text-pink-500 hover:bg-pink-50 sm:inline-flex"
              aria-label="Instagram"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          )}

          {/* Mobile menu toggle */}
          <label
            htmlFor="nav-toggle"
            className="inline-flex cursor-pointer items-center justify-center rounded-lg p-2.5 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 lg:hidden"
            style={{ minHeight: "44px", minWidth: "44px" }}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </label>
          <input
            id="nav-toggle"
            type="checkbox"
            className="peer sr-only"
            checked={mobileOpen}
            onChange={(e) => setMobileOpen(e.target.checked)}
          />
        </div>
      </div>

      {/* Mobile nav - rendered immediately, toggled by CSS + React state */}
      <div
        className={`border-t border-indigo-100 bg-white lg:hidden ${
          mobileOpen ? "block" : "hidden"
        }`}
      >
        <nav className="mx-auto max-w-7xl space-y-1 px-4 pb-4 pt-2 sm:px-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block rounded-lg px-3 py-3 text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
              onClick={() => setMobileOpen(false)}
              style={{ minHeight: "44px" }}
            >
              {label}
            </Link>
          ))}
          {(socialLinks.telegram || socialLinks.instagram) && (
            <div className="flex items-center gap-3 pt-3">
              {socialLinks.telegram && (
                <a
                  href={socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-2.5 text-sky-500 hover:bg-sky-50"
                  aria-label="Telegram"
                >
                  <Send className="h-5 w-5" />
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-2.5 text-pink-500 hover:bg-pink-50"
                  aria-label="Instagram"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
