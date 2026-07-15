import type { Metadata } from "next";
import Link from "next/link";
import SEOHead from "@/components/SEOHead";
import {
  GraduationCap,
  Award,
  Heart,
  Star,
  Clock,
  Users,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Обо мне",
  description:
    "Квалифицированный детский нейропсихолог с многолетним опытом работы. Образование, дипломы и отзывы родителей.",
  openGraph: {
    title: "Обо мне — Нейро",
    description:
      "Квалифицированный детский нейропсихолог с многолетним опытом работы. Образование, дипломы и отзывы родителей.",
  },
};

const credentials = [
  {
    icon: GraduationCap,
    title: "Образование",
    items: [
      "Магистратура по клинической психологии, МГУ им. М.В. Ломоносова",
      "Дополнительное образование: нейропсихология детского возраста",
      "Повышение квалификации: нейропсихологическая диагностика и коррекция",
    ],
  },
  {
    icon: Award,
    title: "Дипломы и сертификаты",
    items: [
      "Сертификат нейропсихолога (Институт нейропсихологии им. А.Р. Лурии)",
      "Диплом по специальной психологии и коррекционной педагогике",
      "Сертификат по методике замещающего онтогенеза",
    ],
  },
];

const stats = [
  { icon: Clock, value: "10+", label: "лет опыта" },
  { icon: Users, value: "500+", label: "семей" },
  { icon: Star, value: "4.9", label: "средний рейтинг" },
  { icon: BookOpen, value: "30+", label: "программ" },
];

const placeholderTestimonials = [
  {
    text: "После курса нейропсихологической коррекции сын стал гораздо внимательнее на уроках. Спасибо за индивидуальный подход!",
    author: "Анна М., мама Артёма, 7 лет",
  },
  {
    text: "Наконец-то поняла, почему дочке было сложно с чтением. Рекомендации оказались очень конкретными и полезными.",
    author: "Елена К., мама Софии, 9 лет",
  },
  {
    text: "Профессиональный и очень тёплый подход. Ребёнок с удовольствием занимался, что для нас было настоящим открытием.",
    author: "Дмитрий В., папа Миши, 5 лет",
  },
];

export default function AboutPage() {
  return (
    <>
      <SEOHead
        type="website"
        title="Нейро — Обо мне"
        description="Квалифицированный детский нейропсихолог с многолетним опытом работы. Образование, дипломы и отзывы родителей."
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
              "Детский нейропсихолог с более чем 10-летним опытом помощи детям и их семьям",
            knowsAbout: [
              "Нейропсихологическая диагностика",
              "Нейропсихологическая коррекция",
              "Детская психология",
              "Методика замещающего онтогенеза",
            ],
            alumniOf: {
              "@type": "CollegeOrUniversity",
              name: "МГУ им. М.В. Ломоносова",
            },
            credential: [
              "Сертификат нейропсихолога (Институт нейропсихологии им. А.Р. Лурии)",
              "Диплом по специальной психологии и коррекционной педагогике",
              "Сертификат по методике замещающего онтогенеза",
            ],
          }).replace(/</g, "\\u003c"),
        }}
      />

      <section className="bg-gradient-to-br from-primary-50 via-white to-accent-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-primary-950 sm:text-5xl">
                Обо мне
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-gray-600">
                Меня зовут <span className="font-semibold text-primary-800">Мария Иванова</span>. Я&nbsp;&mdash; детский нейропсихолог
                с более чем 10-летним опытом помощи детям и их семьям. Моя
                миссия&nbsp;&mdash; помочь каждому ребёнку раскрыть свой
                потенциал, а родителям&nbsp;&mdash; лучше понимать особенности
                развития своего ребёнка.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-gray-600">
                Я верю, что каждый ребёнок уникален, и нет
                &laquo;правильного&raquo; или &laquo;неправильного&raquo;
                пути развития. Мой подход основан на научно доказанных
                методиках, уважении к личности ребёнка и тесном
                сотрудничестве с родителями.
              </p>
              <Link
                href="/booking"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-colors hover:bg-primary-700"
              >
                Записаться на консультацию
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm"
                >
                  <s.icon className="mx-auto mb-2 h-7 w-7 text-primary-600" />
                  <p className="text-2xl font-bold text-primary-950">
                    {s.value}
                  </p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            {credentials.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-gray-100 bg-gradient-to-br from-primary-50/50 to-white p-6 shadow-sm"
              >
                <div className="mb-4 inline-flex rounded-xl bg-primary-100 p-3">
                  <c.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h2 className="mb-4 text-xl font-semibold text-primary-950">
                  {c.title}
                </h2>
                <ul className="space-y-3">
                  {c.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm leading-relaxed text-gray-600"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary-50/50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-950 sm:text-4xl">
              Мой подход
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Три принципа, на которых строится моя работа
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Heart,
                title: "Эмпатия и уважение",
                desc: "Каждый ребёнок принимается таким, какой он есть. Мы идём от его сильных сторон и опираемся на них.",
              },
              {
                icon: Award,
                title: "Научный подход",
                desc: "Все методики имеют доказанную эффективность. Я постоянно слежу за современными исследованиями.",
              },
              {
                icon: Users,
                title: "Партнёрство с семьёй",
                desc: "Родители — главные союзники в развитии ребёнка. Я обучаю и поддерживаю всю семью.",
              },
            ].map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 inline-flex rounded-xl bg-accent-50 p-3">
                  <p.icon className="h-6 w-6 text-accent-600" />
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

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-950 sm:text-4xl">
              Отзывы родителей
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Что говорят семьи, с которыми мы работали
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {placeholderTestimonials.map((t, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="mb-4 text-sm leading-relaxed text-gray-600">
                  &laquo;{t.text}&raquo;
                </p>
                <p className="text-sm font-semibold text-primary-800">
                  {t.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Начните путь к развитию сегодня
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-primary-100">
            Запишитесь на первую консультацию — вместе мы найдём лучший путь
            для вашего ребёнка.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-primary-700 shadow-lg transition-colors hover:bg-primary-50"
            >
              Записаться
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/screening"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-primary-300 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:border-primary-200 hover:bg-primary-700"
            >
              Пройти анкету
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
