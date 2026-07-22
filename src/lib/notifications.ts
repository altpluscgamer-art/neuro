import nodemailer from "nodemailer";
import { getSetting } from "./settings";

interface ScreeningNotificationPayload {
  id: string;
  parentName: string | null;
  parentPhone: string | null;
  parentEmail: string | null;
  messenger: string | null;
  childAge: string;
  concerns: string;
}

export async function sendScreeningNotification(
  result: ScreeningNotificationPayload
): Promise<void> {
  const concernsList: string[] = (() => {
    try {
      return JSON.parse(result.concerns);
    } catch {
      return [result.concerns];
    }
  })();

  const summary = [
    `Новая анкета пройдена`,
    `Родитель: ${result.parentName ?? "не указан"}`,
    `Возраст ребёнка: ${result.childAge}`,
    `Проблемы: ${concernsList.join(", ")}`,
    `Телефон: ${result.parentPhone ?? "не указан"}`,
    `Email: ${result.parentEmail ?? "не указан"}`,
  ].join("\n");

  await sendTelegram(summary);

  if (result.parentEmail) {
    await sendEmail(result.parentEmail, result.id, summary);
  }
}

async function sendTelegram(text: string): Promise<void> {
  const token = await getSetting("telegram_bot_token");
  const chatId = await getSetting("telegram_chat_id");

  if (!token || !chatId) {
    console.warn("[Notifications] Telegram bot token or chat ID not configured — skipping");
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[Notifications] Telegram API error ${res.status}: ${body}`);
    }
  } catch (err) {
    console.error("[Notifications] Telegram send failed:", err);
  }
}

async function sendEmail(
  to: string,
  screeningId: string,
  summary: string
): Promise<void> {
  const host = await getSetting("smtp_host");
  const port = await getSetting("smtp_port");
  const user = await getSetting("smtp_user");
  const pass = await getSetting("smtp_pass");
  const from = await getSetting("smtp_from");

  if (!host || !user || !pass) {
    console.warn("[Notifications] SMTP not configured — skipping email");
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
      subject: `Результат скрининга — Нейро`,
      text: summary,
      html: `<pre style="font-family:sans-serif;white-space:pre-wrap">${summary}</pre>`,
    });
  } catch (err) {
    console.error("[Notifications] Email send failed:", err);
  }
}
