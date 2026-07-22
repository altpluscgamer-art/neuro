"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Неверный email или пароль");
        return;
      }
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      if (session?.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("Произошла ошибка. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-50/40 to-white px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Вход</h1>
          <p className="mt-2 text-sm text-gray-600">
            Войдите в свой аккаунт
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
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                placeholder="Пароль"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? "Вход..." : "Войти"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Нет аккаунта?{" "}
            <Link
              href="/auth/register"
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
