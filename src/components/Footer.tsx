import Link from "next/link";
import { Brain, Phone, Mail } from "lucide-react";

const navLinks = [
  { href: "/about", label: "Обо мне" },
  { href: "/services", label: "Услуги" },
  { href: "/materials", label: "Материалы" },
  { href: "/courses", label: "Курсы" },
  { href: "/booking", label: "Записаться" },
  { href: "/questionnaire", label: "Анкета" },
];

export default function Footer() {
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
              <li>
                <a
                  href="tel:+79991234567"
                  className="flex items-center gap-2 text-sm text-indigo-200 transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 text-teal-400" />
                  +7 (999) 123-45-67
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@neuro.ru"
                  className="flex items-center gap-2 text-sm text-indigo-200 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4 text-teal-400" />
                  info@neuro.ru
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-indigo-800 pt-6 text-center text-xs text-indigo-400">
          &copy; {new Date().getFullYear()} Нейро. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
