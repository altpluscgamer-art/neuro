"use client";

import { useState } from "react";
import { Users, Search, Shield } from "lucide-react";
import { clsx } from "clsx";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  createdAt: string;
  bookingCount: number;
}

const roleLabels: Record<string, string> = {
  admin: "Администратор",
  psychologist: "Нейропсихолог",
  parent: "Родитель",
};

const roleColors: Record<string, string> = {
  admin: "bg-violet-100 text-violet-700",
  psychologist: "bg-blue-100 text-blue-700",
  parent: "bg-gray-100 text-gray-700",
};

export default function UsersClient({
  users,
  defaultQuery,
}: {
  users: UserRow[];
  defaultQuery: string;
}) {
  const [query, setQuery] = useState(defaultQuery);

  const searchUrl = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    return `/admin/users?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Пользователи</h1>

      {/* Search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          window.location.href = searchUrl();
        }}
        className="flex gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по имени или email..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          Найти
        </button>
      </form>

      {/* Users table */}
      {users.length === 0 ? (
        <p className="py-8 text-center text-gray-500">Пользователи не найдены</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 font-medium text-gray-500">Имя</th>
                <th className="px-5 py-3 font-medium text-gray-500">Email</th>
                <th className="px-5 py-3 font-medium text-gray-500">Роль</th>
                <th className="px-5 py-3 font-medium text-gray-500">Телефон</th>
                <th className="px-5 py-3 font-medium text-gray-500">Записей</th>
                <th className="px-5 py-3 font-medium text-gray-500">Регистрация</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-5 py-3 text-gray-600">{u.email}</td>
                  <td className="px-5 py-3">
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                        roleColors[u.role] ?? "bg-gray-100 text-gray-600"
                      )}
                    >
                      {u.role === "admin" && <Shield className="h-3 w-3" />}
                      {roleLabels[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{u.phone ?? "—"}</td>
                  <td className="px-5 py-3 text-gray-600">{u.bookingCount}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {new Date(u.createdAt).toLocaleDateString("ru-RU")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
