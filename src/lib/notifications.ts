import nodemailer from "nodemailer";

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
    `Родитель: ${result.parentName ?? "не указан"}`,
    `Возраст ребёнка: ${result.childAge}`,
    `Проблемы: ${concernsList.join(", ")}`,
    `Ссылка: ${process.env.NEXT_PUBLIC_SITE_URL ?? "https://neuro.local"}/admin/screening/${result.id}`,
  ].join("\n");

  if (
    result.messenger === "telegram" ||
    (result.parentPhone && result.messenger !== "whatsapp")
  ) {
    await sendTelegram(summary);
  }

  if (result.messenger === "whatsapp" && result.parentPhone) {
    console.log(
      `[WhatsApp] Placeholder notification for screening ${result.id} to ${result.parentPhone}`
    );
  }

  if (result.parentEmail) {
    await sendEmail(result.parentEmail, result.id, summary);
  }
}

async function sendTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn(
      "[Notifications] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — skipping Telegram notification"
    );
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
      console.error(
        `[Notifications] Telegram API error ${res.status}: ${body}`
      );
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
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn(
      "[Notifications] SMTP_HOST, SMTP_USER or SMTP_PASS not set — skipping email notification"
    );
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
      from: `"Нейро" <${user}>`,
      to,
      subject: `Результат скрининга #${screeningId}`,
      text: summary,
      html: `<pre style="font-family:sans-serif;white-space:pre-wrap">${summary}</pre>`,
    });
  } catch (err) {
    console.error("[Notifications] Email send failed:", err);
  }
}
