"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  Brain,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Heart,
  Home,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { clsx } from "clsx";
import type { ScreeningReport } from "@/lib/screening-logic";

const ageOptions = [
  { value: "1-2", label: "1–2 года" },
  { value: "2-3", label: "2–3 года" },
  { value: "3-5", label: "3–5 лет" },
  { value: "5-7", label: "5–7 лет" },
  { value: "7-10", label: "7–10 лет" },
  { value: "10-13", label: "10–13 лет" },
];

const concernOptions = [
  { value: "плохо концентрируется", label: "Плохо концентрируется" },
  { value: "трудно сидеть на месте", label: "Трудно сидеть на месте" },
  { value: "тревожится", label: "Тревожится" },
  { value: "быстро устаёт", label: "Быстро устаёт" },
  { value: "плохо читает", label: "Плохо читает" },
  { value: "плохо пишет", label: "Плохо пишет" },
  { value: "не запоминает", label: "Не запоминает" },
  { value: "есть сложности с речью", label: "Сложности с речью" },
  { value: "плохо засыпает", label: "Плохо засыпает" },
  { value: "истерики", label: "Истерики" },
  { value: "не хочет идти в школу", label: "Не хочет идти в школу" },
  { value: "агрессия", label: "Агрессия" },
];

const strengthOptions = [
  { value: "любит рисовать", label: "Любит рисовать" },
  { value: "любит конструировать", label: "Любит конструировать" },
  { value: "общительный", label: "Общительный" },
  { value: "любознательный", label: "Любознательный" },
  { value: "богатая речь", label: "Богатая речь" },
  { value: "хорошая память", label: "Хорошая память" },
  { value: "спортивный", label: "Спортивный" },
  { value: "музыкальный", label: "Музыкальный" },
];

interface ScreeningFormData {
  childAge: string;
  concerns: string[];
  strengths: string[];
}

const STEP_LABELS = ["Возраст", "Опасения", "Сильные стороны"];

export default function ScreeningPage() {
  const [step, setStep] = useState(0);
  const [report, setReport] = useState<ScreeningReport | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fade, setFade] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ScreeningFormData>({
    defaultValues: {
      childAge: "",
      concerns: [],
      strengths: [],
    },
  });

  const childAge = watch("childAge") || "";
  const concerns = watch("concerns") || [];
  const strengths = watch("strengths") || [];

  const transitionTo = (next: number) => {
    setFade(true);
    setTimeout(() => {
      setStep(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setFade(false), 50);
    }, 200);
  };

  const selectAge = (value: string) => {
    setValue("childAge", value);
    clearErrors("childAge");
  };

  const toggleItem = (
    field: "concerns" | "strengths",
    value: string
  ) => {
    const current = watch(field) || [];
    const next = current.includes(value)
      ? current.filter((v: string) => v !== value)
      : [...current, value];
    setValue(field, next);
    clearErrors(field);
  };

  const handleNext = () => {
    if (step === 1 && !childAge) {
      setError("childAge", { message: "Выберите возраст ребёнка" });
      return;
    }
    if (step === 3 && strengths.length === 0) {
      setError("strengths", {
        message: "Выберите хотя бы одну сильную сторону",
      });
      return;
    }
    if (step === 3) {
      submitForm();
      return;
    }
    transitionTo(step + 1);
  };

  const handleBack = () => {
    if (step > 0) transitionTo(step - 1);
  };

  const submitForm = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/screening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childAge, concerns, strengths }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Ошибка сервера");
      }
      const data = await res.json();
      setReport(data.report);
      transitionTo(4);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Произошла ошибка. Попробуйте ещё раз.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const renderProgressBar = () => {
    if (step === 0 || step === 4) return null;
    const dataStep = step - 1;

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEP_LABELS.map((label, i) => {
            const completed = i < dataStep;
            const current = i === dataStep;
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={clsx(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                      completed && "bg-primary-600 text-white",
                      current && "bg-primary-100 text-primary-700 ring-2 ring-primary-600",
                      !completed && !current && "bg-gray-100 text-gray-400"
                    )}
                  >
                    {completed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={clsx(
                      "mt-1 text-xs font-medium",
                      current ? "text-primary-700" : completed ? "text-primary-600" : "text-gray-400"
                    )}
                  >
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div
                    className={clsx(
                      "mx-2 h-0.5 flex-1 transition-colors",
                      i < dataStep ? "bg-primary-600" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWelcome = () => (
    <div className="flex flex-col items-center text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-100">
        <Brain className="h-10 w-10 text-primary-600" />
      </div>
      <h1 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">
        Скрининг развития ребёнка
      </h1>
      <p className="mb-6 max-w-md text-base leading-relaxed text-gray-600">
        Ответьте на несколько вопросов, чтобы получить персональные рекомендации
        по развитию ребёнка.
      </p>
      <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700">
          <Heart className="h-3.5 w-3.5" />
          5–7 минут
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1.5 text-sm font-medium text-accent-700">
          <AlertCircle className="h-3.5 w-3.5" />
          Не диагностика
        </span>
      </div>
      <p className="mb-8 max-w-md text-sm leading-relaxed text-gray-500">
        Это не диагностика и не медицинское заключение, а образовательный
        скрининг. Результат поможет вам лучше понять особенности ребёнка и
        подобрать подходящие занятия.
      </p>
      <button
        type="button"
        onClick={() => transitionTo(1)}
        className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-3 text-base font-semibold text-white shadow-md shadow-primary-200 transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        Начать
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );

  const renderAgeStep = () => (
    <div>
      <h2 className="mb-2 text-xl font-bold text-gray-900">
        Сколько лет ребёнку?
      </h2>
      <p className="mb-6 text-sm text-gray-500">
        Выберите возрастную группу для получения возраст-специфичных рекомендаций
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ageOptions.map((opt) => {
          const selected = childAge === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => selectAge(opt.value)}
              className={clsx(
                "relative rounded-xl border-2 px-4 py-3 text-center text-sm font-medium transition-all",
                selected
                  ? "border-primary-500 bg-primary-50 text-primary-700 shadow-sm"
                  : "border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50/50"
              )}
            >
              {opt.label}
              {selected && (
                <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 text-primary-600" />
              )}
            </button>
          );
        })}
      </div>
      {errors.childAge && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errors.childAge.message}
        </p>
      )}
    </div>
  );

  const renderConcernsStep = () => (
    <div>
      <h2 className="mb-2 text-xl font-bold text-gray-900">
        Что вас беспокоит?
      </h2>
      <p className="mb-6 text-sm text-gray-500">
        Отметьте все подходящие варианты. Можно выбрать несколько или не выбрать
        ни одного.
      </p>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {concernOptions.map((opt) => {
          const selected = concerns.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleItem("concerns", opt.value)}
              className={clsx(
                "relative flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all",
                selected
                  ? "border-amber-400 bg-amber-50 text-amber-800"
                  : "border-gray-200 bg-white text-gray-700 hover:border-amber-300 hover:bg-amber-50/30"
              )}
            >
              <span
                className={clsx(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                  selected
                    ? "border-amber-500 bg-amber-500 text-white"
                    : "border-gray-300 bg-white"
                )}
              >
                {selected && <CheckCircle2 className="h-3.5 w-3.5" />}
              </span>
              {opt.label}
            </button>
          );
        })}
      </div>
      {concerns.length > 0 && (
        <p className="mt-3 text-sm text-gray-500">
          Выбрано: {concerns.length} из {concernOptions.length}
        </p>
      )}
    </div>
  );

  const renderStrengthsStep = () => (
    <div>
      <h2 className="mb-2 text-xl font-bold text-gray-900">
        Сильные стороны ребёнка
      </h2>
      <p className="mb-6 text-sm text-gray-500">
        Отметьте, что характеризует вашего ребёнка. Выберите хотя бы один
        вариант.
      </p>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {strengthOptions.map((opt) => {
          const selected = strengths.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleItem("strengths", opt.value)}
              className={clsx(
                "relative flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all",
                selected
                  ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                  : "border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50/30"
              )}
            >
              <span
                className={clsx(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                  selected
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-gray-300 bg-white"
                )}
              >
                {selected && <CheckCircle2 className="h-3.5 w-3.5" />}
              </span>
              {opt.label}
            </button>
          );
        })}
      </div>
      {errors.strengths && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errors.strengths.message}
        </p>
      )}
      {strengths.length > 0 && (
        <p className="mt-3 text-sm text-gray-500">
          Выбрано: {strengths.length} из {strengthOptions.length}
        </p>
      )}
    </div>
  );

  const renderReport = () => {
    if (!report) return null;

    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100">
            <Sparkles className="h-7 w-7 text-primary-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Персональный отчёт
          </h2>
          <p className="text-sm text-gray-500">
            На основе ваших ответов мы подготовили рекомендации
          </p>
        </div>

        {report.strengthsSection.items.length > 0 && (
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              <h3 className="text-lg font-bold text-emerald-800">
                {report.strengthsSection.title}
              </h3>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-emerald-700">
              {report.strengthsSection.intro}
            </p>
            <div className="space-y-3">
              {report.strengthsSection.items.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-emerald-200 bg-white p-4"
                >
                  <p className="mb-1 text-sm font-semibold text-emerald-800">
                    {item.label}
                  </p>
                  <p className="text-sm leading-relaxed text-emerald-700">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {report.concernsSection.areas.length > 0 && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-bold text-amber-800">
                {report.concernsSection.title}
              </h3>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-amber-700">
              {report.concernsSection.intro}
            </p>
            <div className="space-y-3">
              {report.concernsSection.areas.map((area) => (
                <div
                  key={area.concern}
                  className="rounded-xl border border-amber-200 bg-white p-4"
                >
                  <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-amber-600">
                    {area.area}
                  </p>
                  <p className="mb-1 text-sm font-semibold text-amber-800">
                    {area.concern}
                  </p>
                  <p className="text-sm leading-relaxed text-amber-700">
                    {area.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {report.concernsSection.areas.length === 0 && (
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-emerald-600" />
              <p className="text-sm font-semibold text-emerald-800">
                Вы не отметили значимых трудностей — это хороший знак!
                Продолжайте поддерживать сильные стороны ребёнка.
              </p>
            </div>
          </section>
        )}

        {report.homeActivitiesSection.activities.length > 0 && (
          <section className="rounded-2xl border border-primary-200 bg-primary-50/50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Home className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-bold text-primary-800">
                {report.homeActivitiesSection.title}
              </h3>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-primary-700">
              {report.homeActivitiesSection.intro}
            </p>
            <div className="space-y-3">
              {report.homeActivitiesSection.activities.map((act, i) => (
                <div
                  key={act.title}
                  className="rounded-xl border border-primary-200 bg-white p-4"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                      {i + 1}
                    </span>
                    <p className="text-sm font-semibold text-primary-800">
                      {act.title}
                    </p>
                  </div>
                  <p className="pl-8 text-sm leading-relaxed text-primary-700">
                    {act.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {report.materialsSection.links.length > 0 && (
          <section className="rounded-2xl border border-accent-200 bg-accent-50/50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-accent-600" />
              <h3 className="text-lg font-bold text-accent-800">
                {report.materialsSection.title}
              </h3>
            </div>
            <div className="space-y-2">
              {report.materialsSection.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-start gap-3 rounded-xl border border-accent-200 bg-white p-4 transition-colors hover:bg-accent-50"
                >
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" />
                  <div>
                    <p className="text-sm font-semibold text-accent-800">
                      {link.title}
                    </p>
                    <p className="text-sm leading-relaxed text-accent-700">
                      {link.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {report.specialistRecommendation.show && (
          <section
            className={clsx(
              "rounded-2xl border-2 p-6",
              report.specialistRecommendation.urgency === "high"
                ? "border-red-300 bg-red-50/50"
                : "border-amber-300 bg-amber-50/50"
            )}
          >
            <div className="mb-3 flex items-center gap-2">
              <AlertCircle
                className={clsx(
                  "h-5 w-5",
                  report.specialistRecommendation.urgency === "high"
                    ? "text-red-600"
                    : "text-amber-600"
                )}
              />
              <h3
                className={clsx(
                  "text-lg font-bold",
                  report.specialistRecommendation.urgency === "high"
                    ? "text-red-800"
                    : "text-amber-800"
                )}
              >
                {report.specialistRecommendation.title}
              </h3>
            </div>
            <p
              className={clsx(
                "text-sm leading-relaxed",
                report.specialistRecommendation.urgency === "high"
                  ? "text-red-700"
                  : "text-amber-700"
              )}
            >
              {report.specialistRecommendation.text}
            </p>
          </section>
        )}

        <div className="flex flex-col items-center gap-4 pt-4">
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 text-base font-semibold text-white shadow-md shadow-primary-200 transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Записаться на диагностику
            <ArrowRight className="h-5 w-5" />
          </Link>
          <button
            type="button"
            onClick={() => {
              setReport(null);
              setValue("childAge", "");
              setValue("concerns", []);
              setValue("strengths", []);
              transitionTo(0);
            }}
            className="text-sm font-medium text-gray-500 transition-colors hover:text-primary-600"
          >
            Пройти скрининг заново
          </button>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (step) {
      case 0:
        return renderWelcome();
      case 1:
        return renderAgeStep();
      case 2:
        return renderConcernsStep();
      case 3:
        return renderStrengthsStep();
      case 4:
        return renderReport();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-white">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg shadow-primary-100/50 sm:p-8">
          {renderProgressBar()}

          <div
            className={clsx(
              "transition-all duration-200",
              fade
                ? "opacity-0 translate-y-2"
                : "opacity-100 translate-y-0"
            )}
          >
            {renderCurrentStep()}
          </div>

          {step > 0 && step < 4 && (
            <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Назад
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={submitting}
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-xl px-6 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                  submitting
                    ? "cursor-not-allowed bg-primary-300 text-white"
                    : "bg-primary-600 text-white hover:bg-primary-700"
                )}
              >
                {submitting ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Формируем отчёт…
                  </>
                ) : step === 3 ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Получить отчёт
                  </>
                ) : (
                  <>
                    Далее
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {submitError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {submitError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
