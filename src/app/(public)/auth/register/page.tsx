"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Заполните все обязательные поля");
      return;
    }
    if (form.password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Не удалось зарегистрироваться");
      }
      router.push("/auth/login");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-50/40 to-white px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Регистрация</h1>
          <p className="mt-2 text-sm text-gray-600">
            Создайте аккаунт для записи на приём
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Имя *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                placeholder="Ваше имя"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Пароль *
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                placeholder="Минимум 6 символов"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Подтверждение пароля *
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                placeholder="Повторите пароль"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Телефон
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                placeholder="+7 (___) ___-__-__"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? "Регистрация..." : "Зарегистрироваться"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Уже есть аккаунт?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
