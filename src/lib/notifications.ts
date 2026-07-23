import nodemailer from "nodemailer";
import { getSetting } from "./settings";

// ═══════════════════════════════════════════
// Telegram Bot API helpers
// ═══════════════════════════════════════════

async function tgSendMessage(text: string, keyboard?: Record<string, unknown>): Promise<void> {
  const token = await getSetting("telegram_bot_token");
  const chatId = await getSetting("telegram_chat_id");
  if (!token || !chatId) {
    console.warn("[TG] Bot token or chat ID not configured — skipping");
    return;
  }
  try {
    const body: Record<string, unknown> = { chat_id: chatId, text, parse_mode: "HTML" };
    if (keyboard) body.reply_markup = keyboard;
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) console.error(`[TG] API error ${res.status}: ${await res.text()}`);
  } catch (err) {
    console.error("[TG] Send failed:", err);
  }
}

async function tgAnswerCallback(callbackId: string, text?: string): Promise<void> {
  const token = await getSetting("telegram_bot_token");
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callbackId, text: text || "Готово" }),
    });
  } catch {}
}

async function tgEditMessage(chatId: string, messageId: string, text: string): Promise<void> {
  const token = await getSetting("telegram_bot_token");
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, message_id: messageId, text, parse_mode: "HTML" }),
    });
  } catch {}
}

// ═══════════════════════════════════════════
// Notification: New Booking
// ═══════════════════════════════════════════

export async function notifyBookingCreated(data: {
  id: string;
  childName: string;
  childAge: number;
  slotTitle: string;
  slotDate: string;
  slotTime: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  notes?: string | null;
}): Promise<void> {
  const msg = [
    "🔔 <b>Новая запись на приём</b>",
    "",
    `👶 Ребёнок: ${data.childName}, ${data.childAge} лет`,
    `📅 Когда: ${data.slotDate}, ${data.slotTime}`,
    `📋 Услуга: ${data.slotTitle}`,
    "",
    `👤 Родитель: ${data.parentName}`,
    `📞 Телефон: ${data.parentPhone}`,
    `✉️ Email: ${data.parentEmail}`,
    data.notes ? `📝 Примечание: ${data.notes}` : "",
  ].filter(Boolean).join("\n");

  const keyboard = {
    inline_keyboard: [
      [
        { text: "✅ Подтвердить", callback_data: `booking_confirm:${data.id}` },
        { text: "❌ Отменить", callback_data: `booking_cancel:${data.id}` },
      ],
      [
        { text: "📞 Позвонить", url: `tel:${data.parentPhone}` },
        { text: "📧 Написать", url: `mailto:${data.parentEmail}` },
      ],
    ],
  };

  await tgSendMessage(msg, keyboard);
}

// ═══════════════════════════════════════════
// Notification: Screening Completed
// ═══════════════════════════════════════════

export async function notifyScreeningCompleted(data: {
  id: string;
  parentName: string | null;
  parentPhone: string | null;
  parentEmail: string | null;
  messenger: string | null;
  childAge: string;
  concerns: string;
}): Promise<void> {
  const concernsList: string[] = (() => {
    try { return JSON.parse(data.concerns); } catch { return [data.concerns]; }
  })();

  const msg = [
    "📝 <b>Пройдена анкета-скрининг</b>",
    "",
    `👶 Возраст ребёнка: ${data.childAge}`,
    `⚠️ Проблемы: ${concernsList.join(", ") || "не указаны"}`,
    "",
    `👤 Родитель: ${data.parentName ?? "не указан"}`,
    `📞 Телефон: ${data.parentPhone ?? "не указан"}`,
    `✉️ Email: ${data.parentEmail ?? "не указан"}`,
    `💬 Мессенджер: ${data.messenger ?? "не указан"}`,
  ].join("\n");

  const keyboard = {
    inline_keyboard: [
      [
        { text: "📊 Открыть отчёт", url: `${process.env.NEXTAUTH_URL || ""}/admin/screening-results` },
      ],
      ...(data.parentPhone ? [[{ text: "📞 Позвонить", url: `tel:${data.parentPhone}` }]] : []),
    ],
  };

  await tgSendMessage(msg, keyboard);
}

// ═══════════════════════════════════════════
// Notification: Consultation Request
// ═══════════════════════════════════════════

export async function notifyConsultationRequest(data: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
}): Promise<void> {
  const msg = [
    "💬 <b>Новый запрос на консультацию</b>",
    "",
    `👤 Имя: ${data.name}`,
    `✉️ Email: ${data.email}`,
    `📞 Телефон: ${data.phone ?? "не указан"}`,
    `📝 Сообщение: ${data.message}`,
  ].join("\n");

  const keyboard = {
    inline_keyboard: [
      [
        { text: "✅ Принять", callback_data: `consult_accept:${data.id}` },
        { text: "👁 В работе", callback_data: `consult_progress:${data.id}` },
      ],
      [
        { text: "📬 Открыть запросы", url: `${process.env.NEXTAUTH_URL || ""}/admin/consultation-requests` },
      ],
    ],
  };

  await tgSendMessage(msg, keyboard);
}

// ═══════════════════════════════════════════
// Notification: Payment Created
// ═══════════════════════════════════════════

export async function notifyPaymentCreated(data: {
  id: string;
  courseTitle: string;
  amount: number;
  userEmail: string;
}): Promise<void> {
  const msg = [
    "💳 <b>Новая покупка курса</b>",
    "",
    `📚 Курс: ${data.courseTitle}`,
    `💰 Сумма: ${data.amount} ₽`,
    `✉️ Email: ${data.userEmail}`,
    "",
    "⏳ Ожидает оплаты. Платёжная ссылка отправлена пользователю.",
  ].join("\n");

  const keyboard = {
    inline_keyboard: [
      [
        { text: "✅ Оплачено", callback_data: `payment_confirm:${data.id}` },
        { text: "❌ Отменено", callback_data: `payment_cancel:${data.id}` },
      ],
    ],
  };

  await tgSendMessage(msg, keyboard);
}

// ═══════════════════════════════════════════
// Notification: Payment Succeeded (from YooKassa webhook)
// ═══════════════════════════════════════════

export async function notifyPaymentSucceeded(data: {
  id: string;
  courseTitle: string;
  amount: number;
  userEmail: string;
}): Promise<void> {
  const msg = [
    "✅ <b>Платёж получен!</b>",
    "",
    `📚 Курс: ${data.courseTitle}`,
    `💰 Сумма: ${data.amount} ₽`,
    `✉️ Email: ${data.userEmail}`,
  ].join("\n");

  await tgSendMessage(msg);
}

// ═══════════════════════════════════════════
// Daily Stats Summary (20:00)
// ═══════════════════════════════════════════

export async function sendDailyStats(): Promise<void> {
  try {
    const { default: prisma } = await import("./prisma");

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    const [
      todayVisits,
      totalScreenings,
      todayScreenings,
      totalBookings,
      pendingBookings,
      pendingConsultations,
      totalUsers,
      todayArticles,
    ] = await Promise.all([
      prisma.siteStat.findFirst({ where: { date: today } }),
      prisma.screeningResult.count(),
      prisma.screeningResult.count({
        where: { createdAt: { gte: new Date(today + "T00:00:00") } },
      }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "pending" } }),
      prisma.consultationRequest.count({ where: { status: "new" } }),
      prisma.user.count({ where: { role: { not: "guest" } } }),
      prisma.article.count({ where: { isPublished: true } }),
    ]);

    // Recent screenings (last 24h) — top concerns
    const recentScreenings = await prisma.screeningResult.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 86400000) } },
      select: { concerns: true },
      take: 20,
    });

    const concernCounts: Record<string, number> = {};
    for (const s of recentScreenings) {
      try {
        const concerns: string[] = JSON.parse(s.concerns);
        for (const c of concerns) {
          concernCounts[c] = (concernCounts[c] || 0) + 1;
        }
      } catch {}
    }

    const topConcerns = Object.entries(concernCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => `  • ${name}: ${count}`)
      .join("\n");

    const msg = [
      "📊 <b>Ежедневный отчёт</b>",
      `📅 ${new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}`,
      "",
      `<b>Посещения сегодня:</b> ${todayVisits?.visits || 0}`,
      "",
      "<b>Анкеты:</b>",
      `  Всего: ${totalScreenings} | Сегодня: ${todayScreenings}`,
      "",
      "<b>Записи:</b>",
      `  Всего: ${totalBookings} | Ожидают подтверждения: ${pendingBookings}`,
      "",
      "<b>Запросы:</b>",
      `  Новых: ${pendingConsultations}`,
      "",
      "<b>Пользователи:</b>",
      `  Всего: ${totalUsers}`,
      "",
      "<b>Контент:</b>",
      `  Статей опубликовано: ${todayArticles}`,
    ];

    if (topConcerns) {
      msg.push("", "<b>Популярные проблемы (24ч):</b>", topConcerns);
    }

    if (pendingBookings > 0 || pendingConsultations > 0) {
      msg.push("", "⚠️ <b>Требуют внимания!</b>");
      if (pendingBookings > 0) msg.push(`  📅 ${pendingBookings} записей ожидают подтверждения`);
      if (pendingConsultations > 0) msg.push(`  💬 ${pendingConsultations} новых запросов`);
    }

    const keyboard = {
      inline_keyboard: [
        [
          { text: "📅 Расписание", url: `${process.env.NEXTAUTH_URL || ""}/admin/schedule` },
          { text: "📋 Запросы", url: `${process.env.NEXTAUTH_URL || ""}/admin/consultation-requests` },
        ],
        [
          { text: "📊 Дашборд", url: `${process.env.NEXTAUTH_URL || ""}/admin` },
        ],
      ],
    };

    await tgSendMessage(msg.join("\n"), keyboard);
  } catch (err) {
    console.error("[Stats] Daily stats failed:", err);
  }
}

// ═══════════════════════════════════════════
// Callback handler (inline button presses)
// ═══════════════════════════════════════════

export async function handleTelegramCallback(callbackQuery: {
  id: string;
  data: string;
  message: { message_id: string; chat: { id: string } };
}): Promise<void> {
  const { id: callbackId, data, message } = callbackQuery;
  const chatId = message.chat.id;
  const messageId = message.message_id;

  const [action, entityId] = data.split(":");

  try {
    const { default: prisma } = await import("./prisma");

    switch (action) {
      case "booking_confirm": {
        await prisma.booking.update({ where: { id: entityId }, data: { status: "confirmed" } });
        await tgAnswerCallback(callbackId, "✅ Запись подтверждена");
        await tgEditMessage(chatId, messageId, "✅ <b>Запись подтверждена</b>\n\nСвяжитесь с родителем для уточнения деталей.");
        break;
      }
      case "booking_cancel": {
        await prisma.booking.update({ where: { id: entityId }, data: { status: "cancelled" } });
        const booking = await prisma.booking.findUnique({ where: { id: entityId } });
        if (booking) {
          await prisma.scheduleSlot.update({
            where: { id: booking.slotId },
            data: { bookedSeats: { decrement: 1 } },
          });
        }
        await tgAnswerCallback(callbackId, "❌ Запись отменена");
        await tgEditMessage(chatId, messageId, "❌ <b>Запись отменена</b>\n\nМесто в расписании освобождено.");
        break;
      }
      case "consult_accept": {
        await prisma.consultationRequest.update({ where: { id: entityId }, data: { status: "completed" } });
        await tgAnswerCallback(callbackId, "✅ Запрос принят");
        await tgEditMessage(chatId, messageId, "✅ <b>Запрос обработан</b>");
        break;
      }
      case "consult_progress": {
        await prisma.consultationRequest.update({ where: { id: entityId }, data: { status: "in_progress" } });
        await tgAnswerCallback(callbackId, "👁 В работе");
        break;
      }
      case "payment_confirm": {
        await prisma.payment.update({ where: { id: entityId }, data: { status: "succeeded" } });
        await tgAnswerCallback(callbackId, "✅ Оплата подтверждена");
        await tgEditMessage(chatId, messageId, "✅ <b>Оплата подтверждена вручную</b>");
        break;
      }
      case "payment_cancel": {
        await prisma.payment.update({ where: { id: entityId }, data: { status: "canceled" } });
        await tgAnswerCallback(callbackId, "❌ Оплата отменена");
        await tgEditMessage(chatId, messageId, "❌ <b>Оплата отменена</b>");
        break;
      }
      default:
        await tgAnswerCallback(callbackId, "Неизвестное действие");
    }
  } catch (err) {
    console.error("[TG Callback] Error:", err);
    await tgAnswerCallback(callbackId, "Ошибка при обработке");
  }
}

// ═══════════════════════════════════════════
// Email helper (for screening report)
// ═══════════════════════════════════════════

export async function sendEmailToParent(
  to: string,
  subject: string,
  text: string
): Promise<void> {
  const host = await getSetting("smtp_host");
  const port = await getSetting("smtp_port");
  const user = await getSetting("smtp_user");
  const pass = await getSetting("smtp_pass");
  const from = await getSetting("smtp_from");

  if (!host || !user || !pass) {
    console.warn("[Email] SMTP not configured — skipping");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: port ? parseInt(port, 10) : 587,
      secure: parseInt(port ?? "587", 10) === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"Нейро" <${from || user}>`,
      to,
      subject,
      text,
      html: `<pre style="font-family:sans-serif;white-space:pre-wrap">${text}</pre>`,
    });
  } catch (err) {
    console.error("[Email] Send failed:", err);
  }
}

// ═══════════════════════════════════════════
// Legacy compatibility
// ═══════════════════════════════════════════

export async function sendScreeningNotification(data: {
  id: string;
  parentName: string | null;
  parentPhone: string | null;
  parentEmail: string | null;
  messenger: string | null;
  childAge: string;
  concerns: string;
}): Promise<void> {
  await notifyScreeningCompleted(data);

  if (data.parentEmail) {
    await sendEmailToParent(
      data.parentEmail,
      "Результат скрининга — Нейро",
      `Ваш отчёт готов. Возраст ребёнка: ${data.childAge}\nСвяжитесь с нами для консультации.`
    );
  }
}
