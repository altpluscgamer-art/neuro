import { Suspense } from "react";
import { Calendar } from "lucide-react";
import BookingClient from "./BookingClient";

export const metadata = {
  title: "Запись на приём",
  description: "Выберите удобное время для консультации или занятия",
};

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/40 to-white">
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
        <Suspense
          fallback={
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
            </div>
          }
        >
          <BookingClient />
        </Suspense>
      </div>
    </div>
  );
}
