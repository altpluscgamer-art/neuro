import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { Video, Play, Clock, BookOpen } from "lucide-react";

export const metadata = {
  title: "Курсы — Нейропсихолог онлайн",
  description: "Онлайн-курсы по нейропсихологии для родителей и специалистов",
};

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/40 to-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-1.5 text-sm font-medium text-violet-700">
            <Video className="h-4 w-4" />
            Обучение
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Онлайн-курсы
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Профессиональные курсы для родителей и специалистов
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Video className="mb-4 h-12 w-12 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">
              Курсы скоро появятся
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="relative flex h-52 items-center justify-center bg-gradient-to-br from-violet-100 to-primary-100">
                  <Play className="h-14 w-14 text-violet-300 transition-colors group-hover:text-violet-400" />
                  {course.image && (
                    <Image
                      src={course.image}
                      alt={course.title}
                      width={400}
                      height={300}
                      className="absolute inset-0 h-full w-full rounded-xl object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="mb-2 text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {course.title}
                  </h2>
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-600 line-clamp-3">
                    {course.excerpt}
                  </p>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.lessons}{" "}
                        {course.lessons === 1
                          ? "урок"
                          : course.lessons < 5
                            ? "урока"
                            : "уроков"}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-primary-600">
                      {course.price > 0
                        ? `${course.price.toLocaleString("ru-RU")} ₽`
                        : "Бесплатно"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-16 rounded-2xl border border-gray-100 bg-gradient-to-br from-primary-50 to-white p-8 text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-primary-600" />
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            Читайте также наши статьи
          </h2>
          <p className="mb-6 text-sm text-gray-600">
            Полезные материалы о развитии, воспитании и нейропсихологии детей
          </p>
          <Link
            href="/materials"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
          >
            <BookOpen className="h-5 w-5" />
            Перейти к материалам
          </Link>
        </div>
      </div>
    </div>
  );
}
