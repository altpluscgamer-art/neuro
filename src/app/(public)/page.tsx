import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  Brain,
  Sparkles,
  Heart,
  BookOpen,
  Video,
  Calendar,
  ArrowRight,
  Star,
  Users,
  Shield,
  GraduationCap,
  AlertCircle,
  MessageCircle,
  Activity,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Brain,
  Sparkles,
  Heart,
  BookOpen,
  Video,
  Calendar,
  Users,
  Shield,
};

function ServiceIcon({ name }: { name: string | null }) {
  const Icon = (name && iconMap[name]) || Brain;
  return <Icon className="h-8 w-8 text-primary-600" />;
}

type ServiceRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type TestimonialRow = {
  id: string;
  author: string;
  text: string;
  rating: number;
  order: number;
  isActive: boolean;
  createdAt: Date;
};

const stats = [
  { icon: Users, value: "1–13 лет", label: "возраст детей" },
  { icon: Sparkles, value: "7 шагов", label: "в анкете-скрининге" },
  { icon: Brain, value: "Методика А.Р. Лурии", label: "научный подход" },
  { icon: Video, value: "Онлайн и очно", label: "формат работы" },
];

const problemCategories = [
  {
    icon: Brain,
    title: "Внимание и память",
    desc: "Трудности с концентрацией, удержанием информации и переключением внимания.",
  },
  {
    icon: Heart,
    title: "Поведение и эмоции",
    desc: "Импульсивность, вспышки гнева и сложности с саморегуляцией.",
  },
  {
    icon: GraduationCap,
    title: "Адаптация к школе",
    desc: "Трудности привыкания к школьным требованиям, режиму и нагрузке.",
  },
  {
    icon: AlertCircle,
    title: "Тревожность",
    desc: "Повышенная тревога, страхи и школьная тревожность у ребёнка.",
  },
  {
    icon: BookOpen,
    title: "Трудности обучения",
    desc: "Проблемы с чтением, письмом, счётом и усвоением учебного материала.",
  },
  {
    icon: MessageCircle,
    title: "Речевое развитие",
    desc: "Задержка речи, бедный словарный запас и сложности с формулированием мыслей.",
  },
  {
    icon: Activity,
    title: "Моторное развитие",
    desc: "Неловкость, проблемы с мелкой и крупной моторикой, координацией движений.",
  },
  {
    icon: Shield,
    title: "Задержки развития",
    desc: "Отставание в развитии, требующее специального подхода и поддержки.",
  },
];

export default async function HomePage() {
  const [services, testimonials]: [ServiceRow[], TestimonialRow[]] =
    await Promise.all([
      prisma.service.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      }),
      prisma.testimonial.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
        take: 6,
      }),
    ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-cream to-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700">
              <Brain className="h-4 w-4" />
              Нейропсихологическая помощь детям
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-primary-950 sm:text-5xl lg:text-6xl">
              Помогаем детям развиваться, а родителям&nbsp;&mdash; понимать
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-gray-600 sm:text-xl">
              Научно обоснованные методики для диагностики и развития детей от 1
              до 13 лет. Помогаем выявить трудности и подобрать эффективный
              путь развития&nbsp;&mdash; онлайн и очно.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/screening"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-colors hover:bg-primary-700"
              >
                <Sparkles className="h-5 w-5" />
                Пройти анкету
              </Link>
              <Link
                href="/booking"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary-200 bg-white px-6 py-3.5 text-base font-semibold text-primary-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
              >
                <Calendar className="h-5 w-5" />
                Записаться
              </Link>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-accent-200/30 blur-3xl" />
      </section>

      {/* Stats bar */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-primary-100 bg-white p-5 text-center shadow-sm"
              >
                <s.icon className="mx-auto mb-3 h-7 w-7 text-primary-600" />
                <p className="text-lg font-bold text-primary-950 sm:text-xl">
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      {services.length > 0 && (
        <section className="bg-cream py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-primary-950 sm:text-4xl">
                Наши услуги
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Комплексный подход к развитию и поддержке вашего ребёнка
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="group rounded-2xl border border-primary-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 inline-flex rounded-full bg-primary-50 p-3">
                    <ServiceIcon name={service.icon} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-primary-950">
                    {service.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {service.description}
                  </p>
                  <Link
                    href="/booking"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
                  >
                    Записаться
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Problem categories */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-950 sm:text-4xl">
              С какими трудностями мы помогаем
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Нейропсихологическая поддержка по ключевым направлениям развития
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {problemCategories.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-primary-100 bg-white p-6 transition-colors hover:border-primary-300"
              >
                <p.icon className="mb-4 h-8 w-8 text-primary-600" />
                <h3 className="mb-2 text-base font-semibold text-primary-950">
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/screening"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-colors hover:bg-primary-700"
            >
              <Sparkles className="h-5 w-5" />
              Пройти анкету
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="bg-primary-50/50 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-primary-950 sm:text-4xl">
                Отзывы родителей
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Истории семей, которым мы помогли
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl border border-primary-100 bg-white p-6 shadow-sm"
                >
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-accent-400 text-accent-400"
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
      )}

      {/* Resources */}
      <section className="bg-cream py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-950 sm:text-4xl">
              Полезные ресурсы
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Материалы и курсы для родителей
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/materials"
              className="group rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <BookOpen className="mb-4 h-10 w-10 text-primary-600" />
              <h3 className="mb-2 text-lg font-semibold text-primary-950">
                Статьи и материалы
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Познавательные статьи о развитии детей, нейропсихологии и
                практических рекомендациях для родителей.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 transition-colors group-hover:text-primary-700">
                Читать <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href="/courses"
              className="group rounded-2xl border border-primary-100 bg-gradient-to-br from-accent-50 to-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <Video className="mb-4 h-10 w-10 text-accent-500" />
              <h3 className="mb-2 text-lg font-semibold text-primary-950">
                Онлайн-курсы
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Видео-курсы с практическими упражнениями для развития памяти,
                внимания и мышления ребёнка.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent-500 transition-colors group-hover:text-accent-600">
                Смотреть <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href="/screening"
              className="group rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <Shield className="mb-4 h-10 w-10 text-primary-600" />
              <h3 className="mb-2 text-lg font-semibold text-primary-950">
                Скрининг-анкета
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Быстрая оценка развития ребёнка: заполните анкету и получите
                предварительные рекомендации.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 transition-colors group-hover:text-primary-700">
                Пройти <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Готовы помочь вашему ребёнку?
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-primary-100">
            Запишитесь на консультацию или пройдите скрининг-анкету, чтобы
            получить индивидуальные рекомендации по развитию.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/screening"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-primary-700 shadow-lg transition-colors hover:bg-primary-50"
            >
              <Sparkles className="h-5 w-5" />
              Пройти анкету
            </Link>
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/70 bg-transparent px-6 py-3.5 text-base font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              <Calendar className="h-5 w-5" />
              Записаться
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
