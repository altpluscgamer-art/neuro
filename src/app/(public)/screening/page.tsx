import { Suspense } from "react";
import { Brain, ChevronRight, Heart, AlertCircle, BookOpen } from "lucide-react";
import ScreeningClient from "./ScreeningClient";

export const metadata = {
  title: "Анкета — скрининг развития ребёнка",
  description:
    "Бесплатная онлайн-анкета для родителей. Получите персональные рекомендации по развитию ребёнка на основе нейропсихологической методики А.Р. Лурии.",
};

export default function ScreeningPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg shadow-indigo-100/50 sm:p-8">
          <Suspense
            fallback={
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-100">
                  <Brain className="h-10 w-10 text-indigo-600" />
                </div>
                <h1 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">
                  Скрининг развития ребёнка
                </h1>
                <p className="mb-6 max-w-md text-base leading-relaxed text-gray-600">
                  Ответьте на несколько вопросов, чтобы получить персональные
                  рекомендации по развитию ребёнка.
                </p>
                <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700">
                    <Heart className="h-3.5 w-3.5" />
                    5–7 минут
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Не диагностика
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700">
                    <BookOpen className="h-3.5 w-3.5" />
                    Методика А.Р. Лурии
                  </span>
                </div>
                <p className="mb-8 max-w-md text-sm leading-relaxed text-gray-500">
                  Загрузка анкеты…
                </p>
                <div className="flex justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                </div>
              </div>
            }
          >
            <ScreeningClient />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
