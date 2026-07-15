import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { BookOpen, Tag, ArrowLeft, Calendar } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article || !article.isPublished) return { title: "Не найдено" };
  return {
    title: `${article.title} — Нейропсихолог онлайн`,
    description: article.excerpt,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });

  if (!article || !article.isPublished) notFound();

  const related = await prisma.article.findMany({
    where: {
      isPublished: true,
      category: article.category,
      id: { not: article.id },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/40 to-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/materials"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Все материалы
        </Link>

        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-12">
          <article className="min-w-0">
            <header className="mb-8">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                {article.category && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
                    <Tag className="h-3.5 w-3.5" />
                    {article.category}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-400">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(article.createdAt).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {article.title}
              </h1>
            </header>

            <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-indigo-600 prose-strong:text-gray-900">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>
          </article>

          {related.length > 0 && (
            <aside className="mt-12 lg:mt-0">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                  Похожие материалы
                </h3>
                <div className="flex flex-col gap-4">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      href={`/materials/${r.slug}`}
                      className="group rounded-xl p-3 transition-colors hover:bg-indigo-50/60"
                    >
                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {r.title}
                      </h4>
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                        {r.excerpt}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
