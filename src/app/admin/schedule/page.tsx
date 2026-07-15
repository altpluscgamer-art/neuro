"use client";

import { useEffect, useState, useCallback } from "react";
import { Calendar, Plus, Pencil, Trash2, Clock, Users, X } from "lucide-react";

interface Slot {
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

type SlotForm = Omit<Slot, "id" | "bookedSeats" | "isActive"> & {
  totalSeats: number;
  isActive: boolean;
};

const emptyForm: SlotForm = {
  date: "",
  timeStart: "",
  timeEnd: "",
  type: "consultation",
  title: "",
  totalSeats: 1,
  isActive: true,
};

export default function SchedulePage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SlotForm>(emptyForm);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/schedule");
      if (res.ok) {
        const data = await res.json();
        setSlots(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (slot: Slot) => {
    setEditingId(slot.id);
    setForm({
      date: slot.date,
      timeStart: slot.timeStart,
      timeEnd: slot.timeEnd,
      type: slot.type,
      title: slot.title,
      totalSeats: slot.totalSeats,
      isActive: slot.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/admin/schedule/${editingId}` : "/api/admin/schedule";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setModalOpen(false);
    fetchSlots();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить этот слот?")) return;
    await fetch(`/api/admin/schedule/${id}`, { method: "DELETE" });
    fetchSlots();
  };

  const handleToggle = async (slot: Slot) => {
    await fetch(`/api/admin/schedule/${slot.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...slot, isActive: !slot.isActive }),
    });
    fetchSlots();
  };

  const grouped = slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    (acc[slot.date] ??= []).push(slot);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Расписание</h1>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
        >
          <Plus className="h-4 w-4" />
          Добавить слот
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Загрузка...</p>
      ) : sortedDates.length === 0 ? (
        <p className="text-gray-500">Нет слотов</p>
      ) : (
        sortedDates.map((date) => (
          <div key={date} className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-3">
              <Calendar className="h-4 w-4 text-violet-600" />
              <h3 className="font-semibold text-gray-900">{date}</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {grouped[date]
                .sort((a, b) => a.timeStart.localeCompare(b.timeStart))
                .map((slot) => (
                  <div
                    key={slot.id}
                    className={`flex items-center justify-between px-6 py-4 ${!slot.isActive ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {slot.timeStart}–{slot.timeEnd}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{slot.title}</p>
                        <p className="text-xs text-gray-500">
                          {slot.type} · <Users className="inline h-3 w-3" /> {slot.bookedSeats}/{slot.totalSeats}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(slot)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          slot.isActive
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {slot.isActive ? "Активен" : "Неактивен"}
                      </button>
                      <button
                        onClick={() => openEdit(slot)}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(slot.id)}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? "Редактировать слот" : "Новый слот"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Дата</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Начало</label>
                  <input
                    type="time"
                    value={form.timeStart}
                    onChange={(e) => setForm({ ...form, timeStart: e.target.value })}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Конец</label>
                  <input
                    type="time"
                    value={form.timeEnd}
                    onChange={(e) => setForm({ ...form, timeEnd: e.target.value })}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Тип</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="consultation">Консультация</option>
                  <option value="diagnostics">Диагностика</option>
                  <option value="group">Групповое занятие</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Название</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Мест</label>
                <input
                  type="number"
                  min={1}
                  value={form.totalSeats}
                  onChange={(e) => setForm({ ...form, totalSeats: Number(e.target.value) })}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                Активен
              </label>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
                >
                  {editingId ? "Сохранить" : "Создать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
