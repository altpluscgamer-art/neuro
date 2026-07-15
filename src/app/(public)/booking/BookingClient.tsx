"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Users, Check, X } from "lucide-react";

type Slot = {
  id: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  type: string;
  title: string;
  totalSeats: number;
  bookedSeats: number;
  isActive: boolean;
};

function formatDate(dateStr: string) {
  try {
    const parts = dateStr.split("-");
    const d = new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10)
    );
    return d.toLocaleDateString("ru-RU", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  } catch {
    return dateStr;
  }
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const typeLabels: Record<string, string> = {
  consultation: "Консультация",
  diagnostics: "Диагностика",
  correction: "Нейрокоррекция",
  group: "Групповое занятие",
};

const typeColors: Record<string, string> = {
  consultation: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  diagnostics: "bg-teal-50 text-teal-700 ring-teal-200",
  correction: "bg-violet-50 text-violet-700 ring-violet-200",
  group: "bg-amber-50 text-amber-700 ring-amber-200",
};

export default function BookingClient() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Slot | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    childName: "",
    childAge: "",
    notes: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
  });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/schedule")
      .then((r) => {
        if (!r.ok) throw new Error("Не удалось загрузить расписание");
        return r.json();
      })
      .then((data: Slot[]) => {
        if (cancelled) return;
        const available = (data || []).filter(
          (s) => s.isActive && s.totalSeats - s.bookedSeats > 0
        );
        setSlots(available);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Ошибка загрузки");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = slots.reduce<Record<string, Slot[]>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  function openModal(slot: Slot) {
    setSelected(slot);
    setForm({
      childName: "",
      childAge: "",
      notes: "",
      parentName: "",
      parentPhone: "",
      parentEmail: "",
    });
    setFormError("");
    setSuccess(false);
  }

  function closeModal() {
    setSelected(null);
    setFormError("");
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    if (!form.childName.trim() || !form.childAge) {
      setFormError("Заполните имя и возраст ребёнка");
      return;
    }
    const age = parseInt(form.childAge, 10);
    if (isNaN(age) || age < 1 || age > 18) {
      setFormError("Возраст должен быть от 1 до 18");
      return;
    }
    if (!form.parentName.trim() || !form.parentPhone.trim() || !form.parentEmail.trim()) {
      setFormError("Заполните ваши контактные данные");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selected.id,
          childName: form.childName.trim(),
          childAge: age,
          notes: form.notes.trim() || undefined,
          parentName: form.parentName.trim(),
          parentPhone: form.parentPhone.trim(),
          parentEmail: form.parentEmail.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Не удалось записаться");
      }
      setSuccess(true);
      setSlots((prev) =>
        prev.map((s) =>
          s.id === selected.id ? { ...s, bookedSeats: s.bookedSeats + 1 } : s
        )
      );
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Произошла ошибка");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/40 to-white">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-1.5 text-sm font-medium text-teal-700">
            <Calendar className="h-4 w-4" />
            Запись на приём
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Расписание
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Выберите удобное время для консультации или занятия
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-md rounded-xl bg-red-50 p-6 text-center text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && sortedDates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Calendar className="mb-4 h-12 w-12 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">Нет доступных слотов</p>
            <p className="mt-1 text-sm text-gray-400">Расписание будет обновлено позже</p>
          </div>
        )}

        {!loading && !error && sortedDates.length > 0 && (
          <div className="flex flex-col gap-8">
            {sortedDates.map((date) => (
              <div key={date}>
                <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:text-xl">
                  {capitalize(formatDate(date))}
                </h2>
                <div className="flex flex-col gap-3">
                  {grouped[date].map((slot) => {
                    const available = slot.totalSeats - slot.bookedSeats;
                    return (
                      <div
                        key={slot.id}
                        className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                            <Clock className="h-4 w-4 text-indigo-500" />
                            {slot.timeStart} – {slot.timeEnd}
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {slot.title}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                              typeColors[slot.type] ||
                              "bg-gray-50 text-gray-600 ring-gray-200"
                            }`}
                          >
                            {typeLabels[slot.type] || slot.type}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
                            <Users className="h-4 w-4" />
                            {available} из {slot.totalSeats}
                          </span>
                          <button
                            onClick={() => openModal(slot)}
                            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 active:bg-indigo-800"
                            style={{ touchAction: "manipulation", minHeight: "44px" }}
                          >
                            Записаться
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
          onClick={closeModal}
          style={{ touchAction: "manipulation" }}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {success ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Вы записаны!</h3>
                <p className="mt-2 text-sm text-gray-600">
                  {selected.title} — {selected.timeStart}–{selected.timeEnd}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Мы свяжемся с вами для подтверждения записи.
                </p>
                <button
                  onClick={closeModal}
                  className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                  style={{ touchAction: "manipulation", minHeight: "44px" }}
                >
                  Закрыть
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Запись на приём</h3>
                  <button
                    onClick={closeModal}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    style={{ touchAction: "manipulation", minHeight: "44px", minWidth: "44px" }}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6 rounded-xl bg-indigo-50 p-4">
                  <p className="text-sm font-semibold text-indigo-900">
                    {selected.title}
                  </p>
                  <p className="mt-1 text-sm text-indigo-700">
                    {capitalize(formatDate(selected.date))}, {selected.timeStart}–
                    {selected.timeEnd}
                  </p>
                </div>

                {formError && (
                  <div className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Имя ребёнка *
                    </label>
                    <input
                      type="text"
                      value={form.childName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, childName: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      placeholder="Имя ребёнка"
                      style={{ fontSize: "16px" }}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Возраст ребёнка *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={18}
                      value={form.childAge}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, childAge: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      placeholder="Возраст"
                      style={{ fontSize: "16px" }}
                    />
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="mb-3 text-sm font-semibold text-gray-800">
                      Ваши контактные данные
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Ваше имя *
                        </label>
                        <input
                          type="text"
                          value={form.parentName}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, parentName: e.target.value }))
                          }
                          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                          placeholder="Ваше имя"
                          style={{ fontSize: "16px" }}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Телефон *
                        </label>
                        <input
                          type="tel"
                          value={form.parentPhone}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, parentPhone: e.target.value }))
                          }
                          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                          placeholder="+7 (___) ___-__-__"
                          style={{ fontSize: "16px" }}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={form.parentEmail}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, parentEmail: e.target.value }))
                          }
                          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                          placeholder="email@example.com"
                          style={{ fontSize: "16px" }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Примечания
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, notes: e.target.value }))
                      }
                      rows={3}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      placeholder="Дополнительная информация"
                      style={{ fontSize: "16px" }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                    style={{ touchAction: "manipulation", minHeight: "44px" }}
                  >
                    {submitting ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Записаться
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
