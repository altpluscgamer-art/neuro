import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import SEOHead from "@/components/SEOHead";
import { getPageContent, getOr } from "@/lib/page-content";
import {
  Brain,
  Sparkles,
  Heart,
  BookOpen,
  Video,
  Calendar,
  Users,
  Shield,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Услуги",
  description:
    "Нейропсихологические услуги для детей от 1 до 13 лет: диагностика, консультации, коррекционные программы и онлайн-курсы.",
  openGraph: {
    title: "Услуги — Нейро",
    description:
      "Нейропсихологические услуги для детей от 1 до 13 лет: диагностика, консультации, коррекционные программы и онлайн-курсы.",
  },
};

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

// TODO(Issue #15): Create /services/[slug] detail pages for each service.
// Currently service cards link directly to /booking; individual service pages
// would improve SEO and let users learn more before booking.
export default async function ServicesPage() {
  const services: ServiceRow[] = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
  const pc = await getPageContent();

  const steps = [
    {
      number: "1",
      title: getOr(pc, "page_services_step1_title", "Диагностика"),
      desc: getOr(pc, "page_services_step1_desc", "Выявляем сильные и слабые стороны развития ребёнка с помощью нейропсихологических проб."),
    },
    {
      number: "2",
      title: getOr(pc, "page_services_step2_title", "План"),
      desc: getOr(pc, "page_services_step2_desc", "Составляем индивидуальный маршрут коррекции и развития с учётом результатов диагностики."),
    },
    {
      number: "3",
      title: getOr(pc, "page_services_step3_title", "Занятия"),
      desc: getOr(pc, "page_services_step3_desc", "Проводим игровую нейрокоррекцию — ребёнок развивается через увлекательные задания."),
    },
    {
      number: "4",
      title: getOr(pc, "page_services_step4_title", "Поддержка"),
      desc: getOr(pc, "page_services_step4_desc", "Даём рекомендации для родителей, чтобы закреплять результат и помогать ребёнку дома."),
    },
  ];

  return (
    <>
      <SEOHead
        type="service"
        title="Услуги — Нейро"
        description="Нейропсихологические услуги для детей от 1 до 13 лет: диагностика, консультации, коррекционные программы и онлайн-курсы."
        url="/services"
        author="Мария Иванова"
      />

      <section className="bg-gradient-to-br from-primary-50 via-cream to-accent-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary-950 sm:text-5xl">
              {getOr(pc, "page_services_title", "Услуги")}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              {getOr(pc, "page_services_subtitle", "Комплексный подход к развитию и поддержке вашего ребёнка")}
            </p>
          </div>
        </div>
      </section>

      {services.length > 0 ? (
        <section className="bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="group flex flex-col rounded-2xl border border-primary-100 bg-white p-6 shadow-sm transition-colors hover:border-primary-300"
                >
                  <div className="mb-4 inline-flex self-start rounded-full bg-primary-50 p-3">
                    <ServiceIcon name={service.icon} />
                  </div>
                  <h2 className="mb-2 text-lg font-semibold text-primary-950">
                    {service.title}
                  </h2>
                  <p className="mb-6 flex-1 text-sm leading-relaxed text-gray-600">
                    {service.description}
                  </p>
                  <Link
                    href="/booking"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
                  >
                    Записаться
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <Brain className="mx-auto mb-4 h-12 w-12 text-primary-300" />
            <p className="text-lg text-gray-500">
              Список услуг обновляется. Свяжитесь с нами для уточнения.
            </p>
            <Link
              href="/booking"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-colors hover:bg-primary-700"
            >
              <Calendar className="h-5 w-5" />
              Записаться на консультацию
            </Link>
          </div>
        </section>
      )}

      <section className="bg-cream py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-950 sm:text-4xl">
              Как мы работаем
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Четыре шага к результату
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div
                key={s.number}
                className="rounded-2xl border border-primary-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-lg font-bold text-white">
                  {s.number}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-primary-950">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <Link
              href="/materials"
              className="group flex flex-col items-start rounded-2xl border border-primary-100 bg-cream p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <BookOpen className="mb-4 h-8 w-8 text-primary-600" />
              <h2 className="mb-2 text-lg font-semibold text-primary-950">
                Полезные статьи
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                Читайте материалы о развитии детей, нейропсихологии и
                практических рекомендациях для родителей.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 transition-colors group-hover:text-primary-700">
                Перейти к материалам
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href="/screening"
              className="group flex flex-col items-start rounded-2xl border border-primary-100 bg-primary-50 p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <Sparkles className="mb-4 h-8 w-8 text-primary-600" />
              <h2 className="mb-2 text-lg font-semibold text-primary-950">
                Пройдите анкету
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                Бесплатная скрининг-анкета поможет определить, какая услуга
                подойдёт вашему ребёнку.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 transition-colors group-hover:text-primary-700">
                Пройти анкету
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Не знаете, с чего начать?
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-primary-100">
            Пройдите бесплатную скрининг-анкету&nbsp;&mdash; она поможет
            определить, какая услуга подойдёт вашему ребёнку.
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
              className="inline-flex items-center gap-2 rounded-xl border-2 border-primary-300 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:border-primary-200 hover:bg-primary-700"
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
