import Link from "next/link";
import prisma from "@/lib/prisma";
import { BookOpen, Search, Tag } from "lucide-react";

export const metadata = {
  title: "Материалы — Нейропсихолог онлайн",
  description: "Полезные статьи и материалы для родителей о развитии детей",
};

export default async function MaterialsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const category = params.category;

  const articles = await prisma.article.findMany({
    where: {
      isPublished: true,
      ...(category ? { category } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.article.findMany({
    where: { isPublished: true, category: { not: null } },
    select: { category: true },
    distinct: ["category"],
  });

  const categoryList = categories
    .map((c) => c.category)
    .filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/40 to-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
            <BookOpen className="h-4 w-4" />
            Библиотека знаний
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Материалы для родителей
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Полезные статьи о развитии, воспитании и нейропсихологии детей
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="mr-1 flex items-center gap-1 text-sm font-medium text-gray-500">
            <Tag className="h-4 w-4" />
            Фильтр:
          </span>
          <Link
            href="/materials"
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              !category
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-indigo-50 hover:text-indigo-700"
            }`}
          >
            Все
          </Link>
          {categoryList.map((cat) => (
            <Link
              key={cat}
              href={`/materials?category=${encodeURIComponent(cat)}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                category === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-indigo-50 hover:text-indigo-700"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="mb-4 h-12 w-12 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">
              Статьи не найдены
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Попробуйте выбрать другую категорию
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/materials/${article.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex h-48 items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100">
                  <BookOpen className="h-12 w-12 text-indigo-300" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex items-center gap-2">
                    {article.category && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                        <Tag className="h-3 w-3" />
                        {article.category}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(article.createdAt).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h2 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {article.title}
                  </h2>
                  <p className="flex-1 text-sm leading-relaxed text-gray-600 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <span className="mt-4 text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
                    Читать далее →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
