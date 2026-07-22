"use client";

import { useEffect, useState } from "react";
import { Star, ExternalLink, Send } from "lucide-react";

interface ExternalReview {
  id: string;
  source: string;
  author: string;
  text: string;
  rating: number;
  sourceUrl: string | null;
  sourceAvatar: string | null;
  sourceDate: string | null;
}

const sourceConfig: Record<string, { label: string; color: string; bg: string }> = {
  yandex: { label: "Яндекс", color: "text-red-600", bg: "bg-red-50" },
  google: { label: "Google", color: "text-blue-600", bg: "bg-blue-50" },
};

export default function ExternalReviews() {
  const [reviews, setReviews] = useState<ExternalReview[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch("/api/reviews/sync")
      .then((r) => r.json())
      .then((data) => setReviews(Array.isArray(data) ? data : data.reviews ?? []))
      .catch(() => {});
  }, []);

  if (reviews.length === 0) return null;

  const visible = showAll ? reviews : reviews.slice(0, 6);

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((r) => {
          const cfg = sourceConfig[r.source] ?? {
            label: r.source,
            color: "text-gray-600",
            bg: "bg-gray-50",
          };

          return (
            <div
              key={r.id}
              className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.color}`}
                >
                  <Send className="h-3 w-3" />
                  {cfg.label}
                </span>
                {r.sourceDate && (
                  <span className="text-xs text-gray-500">
                    {new Date(r.sourceDate).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>

              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                  {r.author.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {r.author}
                </span>
              </div>

              <div className="mb-2 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < r.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>

              <p className="flex-1 text-sm leading-relaxed text-gray-600 line-clamp-4">
                {r.text}
              </p>

              {r.sourceUrl && (
                <a
                  href={r.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary-600 transition-colors hover:text-primary-800"
                >
                  Открыть оригинал
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          );
        })}
      </div>

      {reviews.length > 6 && !showAll && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-white px-6 py-2.5 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50"
          >
            Показать все
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
