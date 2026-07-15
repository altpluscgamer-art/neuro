import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Video, Play, Clock, ArrowLeft, BookOpen } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course || !course.isPublished) return { title: "Не найдено" };
  return {
    title: `${course.title} — Нейропсихолог онлайн`,
    description: course.excerpt,
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug } });

  if (!course || !course.isPublished) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/40 to-white">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/courses"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Все курсы
        </Link>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="relative flex h-72 items-center justify-center bg-gradient-to-br from-violet-100 to-indigo-100">
            <Play className="h-20 w-20 text-violet-300" />
            {course.image && (
              <img
                src={course.image}
                alt={course.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </div>

          <div className="p-8 sm:p-10">
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {course.title}
            </h1>

            <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-700">
                <Clock className="h-4 w-4" />
                {course.lessons}{" "}
                {course.lessons === 1
                  ? "урок"
                  : course.lessons < 5
                    ? "урока"
                    : "уроков"}
              </span>
              <span className="text-2xl font-bold text-indigo-600">
                {course.price > 0
                  ? `${course.price.toLocaleString("ru-RU")} ₽`
                  : "Бесплатно"}
              </span>
            </div>

            <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-indigo-600 prose-strong:text-gray-900">
              <div dangerouslySetInnerHTML={{ __html: course.description }} />
            </div>

            {course.videoUrl && (
              <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-gray-900">
                <div className="flex aspect-video items-center justify-center">
                  <div className="text-center">
                    <Video className="mx-auto mb-3 h-12 w-12 text-gray-500" />
                    <p className="text-sm text-gray-400">
                      Видеоматериалы курса
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <BookOpen className="h-5 w-5" />
                Записаться на курс
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
