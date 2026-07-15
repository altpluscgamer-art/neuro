"use client";

import { MessageSquare, Phone, Mail, Check, Clock } from "lucide-react";
import { clsx } from "clsx";

interface ConsultationRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  new: "Новый",
  in_progress: "В работе",
  completed: "Завершён",
};

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
};

const nextStatus: Record<string, string> = {
  new: "in_progress",
  in_progress: "completed",
};

export default function ConsultationRequestsClient({
  requests,
}: {
  requests: ConsultationRequest[];
}) {
  const changeStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/consultation-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Запросы на консультацию</h1>

      {requests.length === 0 ? (
        <p className="py-8 text-center text-gray-500">Нет запросов</p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-violet-500" />
                    <span className="text-sm font-semibold text-gray-900">{r.name}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {r.email}
                    </span>
                    {r.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {r.phone}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{r.message}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      statusColors[r.status] ?? "bg-gray-100 text-gray-600"
                    )}
                  >
                    {statusLabels[r.status] ?? r.status}
                  </span>
                  {nextStatus[r.status] && (
                    <button
                      onClick={() => changeStatus(r.id, nextStatus[r.status])}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <Check className="h-3.5 w-3.5" />
                      {r.status === "new" ? "В работу" : "Завершить"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
