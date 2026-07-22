import Link from "next/link";
import { Brain, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="text-center">
        <div className="mb-8 inline-flex rounded-2xl bg-primary-50 p-6">
          <Brain className="h-16 w-16 text-primary-600" />
        </div>
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-primary-950 sm:text-4xl">
          Страница не найдена
        </h1>
        <p className="mx-auto mb-8 max-w-md text-base leading-relaxed text-gray-600">
          Похоже, эта страница куда-то переехала или вовсе не существует. Не
          переживайте, давайте вернёмся на главную.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
        >
          <Home className="h-5 w-5" />
          На главную
        </Link>
      </div>
    </div>
  );
}
