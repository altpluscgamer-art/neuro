"use client";

import { useState, useEffect, type CSSProperties } from "react";
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

const touchAction: CSSProperties = { touchAction: "manipulation" };

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
    <header className="sticky top-0 z-[100] border-b border-primary-100 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-primary-700"
          style={touchAction}
        >
          <Brain className="h-7 w-7 text-primary-600" />
          <span>Нейро</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-700"
              style={touchAction}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop social + mobile menu button */}
        <div className="flex items-center gap-2">
          {socialLinks.telegram && (
            <a
              href={socialLinks.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-lg p-2.5 text-primary-600 transition-colors hover:bg-primary-50 hover:text-primary-700 sm:inline-flex"
              style={touchAction}
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
              className="hidden rounded-lg p-2.5 text-accent-500 transition-colors hover:bg-accent-50 hover:text-accent-600 sm:inline-flex"
              style={touchAction}
              aria-label="Instagram"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex items-center justify-center rounded-lg p-2.5 text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-700 lg:hidden"
            style={{ ...touchAction, minHeight: "44px", minWidth: "44px" }}
            aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav - conditionally rendered */}
      {mobileOpen && (
        <div className="border-t border-primary-100 bg-white lg:hidden">
          <nav className="mx-auto max-w-7xl space-y-1 px-4 pb-4 pt-2 sm:px-6">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="block rounded-lg px-3 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-700"
                onClick={() => setMobileOpen(false)}
                style={{ ...touchAction, minHeight: "44px" }}
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
                    className="rounded-lg p-2.5 text-primary-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
                    style={touchAction}
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
                    className="rounded-lg p-2.5 text-accent-500 transition-colors hover:bg-accent-50 hover:text-accent-600"
                    style={touchAction}
                    aria-label="Instagram"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
