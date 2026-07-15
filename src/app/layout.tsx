import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Нейро",
    default: "Нейро — Онлайн-платформа для родителей",
  },
  description:
    "Онлайн-платформа для родителей и детских нейропсихологов. Нейропсихологическая помощь детям от 1 до 13 лет: диагностика, консультации, курсы и материалы для развития.",
  keywords: [
    "нейропсихолог",
    "детский нейропсихолог",
    "нейропсихологическая диагностика",
    "коррекция",
    "развитие ребёнка",
    "консультация нейропсихолога",
    "онлайн курсы",
    "детская психология",
  ],
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Нейро",
    title: {
      template: "%s | Нейро",
      default: "Нейро — Онлайн-платформа для родителей",
    },
    description:
      "Онлайн-платформа для родителей и детских нейропсихологов. Диагностика, консультации, курсы и материалы для развития.",
  },
  twitter: {
    card: "summary_large_image",
    title: {
      template: "%s | Нейро",
      default: "Нейро — Онлайн-платформа для родителей",
    },
    description:
      "Онлайн-платформа для родителей и детских нейропсихологов. Диагностика, консультации, курсы и материалы для развития.",
  },
  other: {
    "theme-color": "#6d28d9",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#6d28d9" />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
