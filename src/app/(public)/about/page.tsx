import type { Metadata } from "next";
import Link from "next/link";
import SEOHead from "@/components/SEOHead";
import ExternalReviews from "@/components/ExternalReviews";
import { getAllSettings } from "@/lib/settings";
import {
  GraduationCap,
  Award,
  Heart,
  Star,
  Clock,
  Users,
  ArrowRight,
  BookOpen,
  Send,
  ExternalLink,
  MessageCircle,
  Shield,
  Sparkles,
  PlayCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Обо мне",
  description:
    "Детский нейропсихолог с многолетним опытом. Нейропсихологический подход по методике А.Р. Лурии для детей от 1 до 13 лет.",
  openGraph: {
    title: "Обо мне — Нейро",
    description:
      "Детский нейропсихолог с многолетним опытом. Нейропсихологический подход по методике А.Р. Лурии для детей от 1 до 13 лет.",
  },
};

const stats = [
  { icon: Clock, value: "10+ лет", label: "Опыт работы" },
  { icon: Users, value: "500+", label: "Детей помогли" },
  { icon: BookOpen, value: "15+", label: "Методик" },
  { icon: Award, value: "10", label: "Лет практики" },
];

const principles = [
  {
    icon: Users,
    title: "Индивидуальный подход",
    desc: "Каждая программа составляется с учётом особенностей, потребностей и темпа конкретного ребёнка.",
  },
  {
    icon: BookOpen,
    title: "Научная база",
    desc: "Работа строится на методике А.Р. Лурии и современных исследованиях в области нейропсихологии.",
  },
  {
    icon: Heart,
    title: "Игровая форма",
    desc: "Занятия проходят в игровой форме — ребёнку интересно и комфортно, а развитие происходит естественно.",
  },
  {
    icon: Shield,
    title: "Поддержка родителей",
    desc: "Объясняю результаты диагностики и даю конкретные рекомендации, чтобы семья могла помогать дома.",
  },
];

const socialKeys = [
  { key: "social_instagram", icon: ExternalLink, label: "Instagram" },
  { key: "social_telegram", icon: Send, label: "Telegram" },
  { key: "social_whatsapp", icon: MessageCircle, label: "WhatsApp" },
  { key: "social_vk", icon: ExternalLink, label: "VK" },
  { key: "social_youtube", icon: PlayCircle, label: "YouTube" },
] as const;

export default async function AboutPage() {
  const settings = await getAllSettings();
  const activeSocials = socialKeys.filter((s) => settings[s.key]);

  return (
    <>
      <SEOHead
        type="website"
        title="Нейро — Обо мне"
        description="Детский нейропсихолог с многолетним опытом. Нейропсихологический подход по методике А.Р. Лурии для детей от 1 до 13 лет."
        url="/about"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: "Мария Иванова",
            jobTitle: "Детский нейропсихолог",
            description:
              "Детский нейропсихолог с более чем 10-летним опытом помощи детям от 1 до 13 лет и их семьям",
            knowsAbout: [
              "Нейропсихологическая диагностика",
              "Нейропсихологическая коррекция",
              "Детская психология",
              "Методика замещающего онтогенеза",
              "Методика А.Р. Лурии",
            ],
          }).replace(/</g, "\\u003c"),
        }}
      />

      <section className="bg-gradient-to-br from-primary-50 via-cream to-accent-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700">
              <GraduationCap className="h-4 w-4" />
              Детский нейропсихолог
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-primary-950 sm:text-5xl">
              Обо мне
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              Помогаю детям развиваться, а родителям&nbsp;&mdash; понимать
              особенности своего ребёнка и уверенно его поддерживать.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 text-lg leading-relaxed text-gray-600">
            <p>
              Меня зовут{" "}
              <span className="font-semibold text-primary-800">
                Мария Иванова
              </span>{" "}
              &mdash; детский нейропсихолог. Каждый день я вижу, как правильно
              подобранная поддержка помогает детям раскрыть свои способности,
              стать увереннее и успешнее.
            </p>
            <p>
              Я работаю с детьми от 1 до 13 лет, опираясь на
              нейропсихологическую методику{" "}
              <span className="font-semibold text-primary-800">
                А.Р. Лурии
              </span>
              . Этот подход позволяет точно определить, какие именно функции
              мозга нуждаются в развитии, и выстроить работу от сильных сторон
              ребёнка, а не от его трудностей.
            </p>
            <p>
              Занятия проходят в игровой форме&nbsp;&mdash; дети воспринимают их
              как увлекательное приключение, а не как лечение. Я внимательно
              изучаю особенности каждого ребёнка и обязательно поддерживаю
              родителей, объясняя, что происходит и как помогать дома.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-cream py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-primary-100 bg-white p-6 text-center shadow-sm"
              >
                <s.icon className="mx-auto mb-3 h-8 w-8 text-primary-600" />
                <p className="text-3xl font-bold text-primary-950">
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-950 sm:text-4xl">
              Принципы моей работы
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              На чём строится помощь каждому ребёнку и его семье
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-primary-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 inline-flex rounded-xl bg-primary-50 p-3">
                  <p.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-primary-950">
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-950 sm:text-4xl">
              Отзывы родителей
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Что говорят семьи, с которыми мы работали
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-accent-400 text-accent-400"
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-500">
                5.0 средняя оценка
              </span>
            </div>
          </div>

          <ExternalReviews />
        </div>
      </section>

      {activeSocials.length > 0 && (
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight text-primary-950 sm:text-3xl">
              Мы в социальных сетях
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Подписывайтесь, чтобы получать полезные материалы и новости
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {activeSocials.map((s) => (
                <a
                  key={s.key}
                  href={settings[s.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-primary-100 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-primary-300 hover:text-primary-700"
                >
                  <s.icon className="h-5 w-5 text-primary-600" />
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Запишитесь на консультацию
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-primary-100">
            Вместе мы найдём лучший путь развития для вашего ребёнка.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-primary-700 shadow-lg transition-colors hover:bg-primary-50"
            >
              Записаться на консультацию
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/screening"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-primary-300 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:border-primary-200 hover:bg-primary-700"
            >
              <Sparkles className="h-5 w-5" />
              Пройти анкету
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
