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
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

type SlotTypeLabels = Record<string, string>;
const typeLabels: SlotTypeLabels = {
  consultation: "Консультация",
  screening: "Скрининг",
  group: "Групповое занятие",
};

const typeColors: Record<string, string> = {
  consultation: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  screening: "bg-teal-50 text-teal-700 ring-teal-200",
  group: "bg-violet-50 text-violet-700 ring-violet-200",
};

export default function BookingPage() {
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
  });

  useEffect(() => {
    fetch("/api/schedule-slots")
      .then((r) => {
        if (!r.ok) throw new Error("Не удалось загрузить расписание");
        return r.json();
      })
      .then((data) => setSlots(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const grouped = slots.reduce<Record<string, Slot[]>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  function openModal(slot: Slot) {
    setSelected(slot);
    setForm({ childName: "", childAge: "", notes: "" });
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
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Не удалось записаться");
      }
      setSuccess(true);
      setSlots((prev) =>
        prev.map((s) =>
          s.id === selected.id
            ? { ...s, bookedSeats: s.bookedSeats + 1 }
            : s
        )
      );
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/40 to-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-100 px-4 py-1.5 text-sm font-medium text-teal-700">
            <Calendar className="h-4 w-4" />
            Запись на приём
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
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
            <p className="text-lg font-medium text-gray-500">
              Нет доступных слотов
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Расписание будет обновлено позже
            </p>
          </div>
        )}

        {!loading && !error && sortedDates.length > 0 && (
          <div className="flex flex-col gap-8">
            {sortedDates.map((date) => (
              <div key={date}>
                <h2 className="mb-4 text-xl font-semibold text-gray-900">
                  {capitalize(formatDate(date))}
                </h2>
                <div className="flex flex-col gap-3">
                  {grouped[date].map((slot) => {
                    const available = slot.totalSeats - slot.bookedSeats;
                    const isFull = available <= 0;
                    return (
                      <div
                        key={slot.id}
                        className={`flex items-center justify-between rounded-xl border p-4 transition-colors sm:p-5 ${
                          isFull
                            ? "border-gray-100 bg-gray-50 opacity-60"
                            : "border-gray-100 bg-white shadow-sm hover:border-indigo-200 hover:shadow-md"
                        }`}
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
                              typeColors[slot.type] || "bg-gray-50 text-gray-600 ring-gray-200"
                            }`}
                          >
                            {typeLabels[slot.type] || slot.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`inline-flex items-center gap-1 text-sm font-medium ${
                              isFull ? "text-red-500" : "text-emerald-600"
                            }`}
                          >
                            <Users className="h-4 w-4" />
                            {isFull ? "Мест нет" : `${available} из ${slot.totalSeats}`}
                          </span>
                          {!isFull && (
                            <button
                              onClick={() => openModal(slot)}
                              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                              Записаться
                            </button>
                          )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">
            {success ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Вы записаны!
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {selected.title} — {selected.timeStart}–{selected.timeEnd}
                </p>
                <button
                  onClick={closeModal}
                  className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  Закрыть
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    Запись на приём
                  </h3>
                  <button
                    onClick={closeModal}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6 rounded-xl bg-indigo-50 p-4">
                  <p className="text-sm font-semibold text-indigo-900">
                    {selected.title}
                  </p>
                  <p className="mt-1 text-sm text-indigo-700">
                    {capitalize(formatDate(selected.date))}, {selected.timeStart}–{selected.timeEnd}
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
                    />
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
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
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
