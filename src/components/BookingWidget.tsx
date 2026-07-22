"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Users, Check } from "lucide-react";
import Button from "@/components/ui/Button";

interface ScheduleSlot {
  id: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  type: string;
  title: string;
  totalSeats: number;
  bookedSeats: number;
  isActive: boolean;
}

interface BookingWidgetProps {
  maxSlots?: number;
  title?: string;
}

export default function BookingWidget({
  maxSlots = 3,
  title = "Записаться на приём",
}: BookingWidgetProps) {
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    childName: "",
    childAge: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/admin/schedule")
      .then((r) => r.json())
      .then((data: ScheduleSlot[]) => {
        const available = data
          .filter((s) => s.isActive && s.bookedSeats < s.totalSeats)
          .slice(0, maxSlots);
        setSlots(available);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [maxSlots]);

  function closeModal() {
    setSelectedSlot(null);
    setForm({ childName: "", childAge: "", notes: "" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          childName: form.childName,
          childAge: parseInt(form.childAge, 10),
          notes: form.notes || undefined,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          closeModal();
          setSubmitted(false);
          setSlots((prev) =>
            prev.map((s) =>
              s.id === selectedSlot.id
                ? { ...s, bookedSeats: s.bookedSeats + 1 }
                : s
            )
          );
        }, 1500);
      }
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-3 rounded-xl border border-primary-100 bg-white p-4">
        <div className="h-5 w-40 rounded bg-primary-100" />
        <div className="h-20 rounded bg-primary-50" />
        <div className="h-20 rounded bg-primary-50" />
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-xl border border-primary-100 bg-white p-4 text-center text-sm text-gray-500">
        Нет доступных слотов для записи
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-primary-100 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-primary-900">
          {title}
        </h3>
        <div className="space-y-2">
          {slots.map((slot) => {
            const seatsLeft = slot.totalSeats - slot.bookedSeats;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className="w-full rounded-lg border border-primary-100 bg-primary-50/50 p-3 text-left transition-colors hover:border-primary-300 hover:bg-primary-50"
              >
                <div className="mb-1 flex items-center gap-2 text-sm font-medium text-primary-900">
                  <Calendar className="h-3.5 w-3.5 text-primary-500" />
                  {slot.title || slot.date}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {slot.timeStart}–{slot.timeEnd}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {seatsLeft} из {slot.totalSeats}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedSlot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={closeModal}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {submitted ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <Check className="h-8 w-8 text-teal-500" />
                <p className="text-sm font-semibold text-teal-700">
                  Запись оформлена!
                </p>
              </div>
            ) : (
              <>
                <h4 className="mb-1 text-sm font-semibold text-primary-900">
                  {selectedSlot.title || selectedSlot.date}
                </h4>
                <p className="mb-4 text-xs text-gray-500">
                  {selectedSlot.timeStart}–{selectedSlot.timeEnd}
                </p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Имя ребёнка
                    </label>
                    <input
                      type="text"
                      required
                      value={form.childName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, childName: e.target.value }))
                      }
                      className="w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Возраст ребёнка
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={18}
                      value={form.childAge}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, childAge: e.target.value }))
                      }
                      className="w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Примечание
                    </label>
                    <textarea
                      rows={2}
                      value={form.notes}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, notes: e.target.value }))
                      }
                      className="w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      type="submit"
                      size="sm"
                      loading={submitting}
                      className="flex-1"
                    >
                      Записаться
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={closeModal}
                    >
                      Отмена
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
