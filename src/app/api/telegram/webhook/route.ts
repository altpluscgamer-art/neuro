import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import prisma from "@/lib/prisma";
import { getSetting } from "@/lib/settings";
import { handleTelegramCallback, sendDailyStats } from "@/lib/notifications";

function transliterateSlug(title: string): string {
  const translit: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e",
    ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
    н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
    ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
    ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  return title
    .toLowerCase()
    .trim()
    .split("")
    .map((ch) => translit[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.article.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

async function getBaseUrl(): Promise<string> {
  const webhookUrl = await getSetting("telegram_webhook_url");
  if (webhookUrl) {
    try {
      const url = new URL(webhookUrl);
      return `${url.protocol}//${url.host}`;
    } catch {
      // fallthrough
    }
  }
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}

async function sendTelegramMessage(token: string, chatId: string, text: string, keyboard?: unknown) {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
  };
  if (keyboard) {
    body.reply_markup = keyboard;
  }
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function setMenuButton(token: string, webAppUrl: string) {
  await fetch(`https://api.telegram.org/bot${token}/setChatMenuButton`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      menu_button: {
        type: "web_app",
        text: "Меню",
        web_app: { url: webAppUrl },
      },
    }),
  });
}

async function setBotCommands(token: string) {
  await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commands: [
        { command: "start", description: "Открыть меню" },
        { command: "menu", description: "Открыть веб-приложение" },
        { command: "screening", description: "Пройти анкету" },
        { command: "booking", description: "Записаться на приём" },
        { command: "contacts", description: "Контакты" },
        { command: "stats", description: "Статистика за сегодня" },
      ],
    }),
  });
}

export async function POST(request: Request) {
  try {
    const botToken = await getSetting("telegram_bot_token");
    if (!botToken) {
      return NextResponse.json({ error: "Bot token not configured" }, { status: 500 });
    }

    const secret = createHmac("sha256", botToken).update("WebhookData").digest("hex");
    const secretHeader = request.headers.get("x-telegram-bot-api-secret-token");
    if (!secretHeader || secretHeader !== secret) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 403 });
    }

    const update = await request.json();
    const baseUrl = await getBaseUrl();
    const webAppUrl = `${baseUrl}/telegram-app`;

    // Handle callback queries (inline button presses)
    if (update.callback_query) {
      await handleTelegramCallback(update.callback_query);
      return NextResponse.json({ ok: true });
    }

    // Handle /stats command
    if (update.message?.text === "/stats" || update.message?.text === "статистика" || update.message?.text === "Статистика") {
      await sendDailyStats();
      return NextResponse.json({ ok: true });
    }

    // Handle /start and /menu commands
    if (update.message?.text) {
      const text = update.message.text;
      const chatId = update.message.chat?.id;

      if (text === "/start" || text === "/menu" || text === "start" || text === "меню" || text === "Меню") {
        const keyboard = {
          inline_keyboard: [
            [
              { text: "📝 Пройти анкету", web_app: { url: `${webAppUrl}?tab=screening` } },
              { text: "📅 Записаться", web_app: { url: `${webAppUrl}?tab=booking` } },
            ],
            [
              { text: "📞 Контакты", web_app: { url: `${webAppUrl}?tab=contacts` } },
              { text: "🏠 Главная", web_app: { url: webAppUrl } },
            ],
            [
              { text: "🌐 Открыть сайт", url: baseUrl },
            ],
          ],
        };
        await sendTelegramMessage(
          botToken,
          String(chatId),
          "🧠 <b>Нейро — платформа для родителей</b>\n\nЯ помогаю детям развиваться, а родителям — понимать.\n\nВыберите действие:",
          keyboard
        );
        return NextResponse.json({ ok: true });
      }

      if (text === "/screening" || text === "анкета" || text === "Анкета") {
        const keyboard = {
          inline_keyboard: [
            [{ text: "📝 Начать анкету", web_app: { url: `${webAppUrl}?tab=screening` } }],
          ],
        };
        await sendTelegramMessage(
          botToken,
          String(chatId),
          "📝 <b>Скрининг развития ребёнка</b>\n\n5–7 минут → персональный отчёт с рекомендациями на основе методики А.Р. Лурии.\n\nЭто не диагностика, а образовательный скрининг.",
          keyboard
        );
        return NextResponse.json({ ok: true });
      }

      if (text === "/booking" || text === "запись" || text === "Запись") {
        const keyboard = {
          inline_keyboard: [
            [{ text: "📅 Выбрать время", web_app: { url: `${webAppUrl}?tab=booking` } }],
          ],
        };
        await sendTelegramMessage(
          botToken,
          String(chatId),
          "📅 <b>Запись на приём</b>\n\nВыберите удобное время для консультации или занятия.",
          keyboard
        );
        return NextResponse.json({ ok: true });
      }

      if (text === "/contacts" || text === "контакты" || text === "Контакты") {
        const phone = await getSetting("site_phone");
        const email = await getSetting("site_email");
        const hours = await getSetting("page_contacts_working_hours");
        const tgLink = await getSetting("social_telegram");
        const igLink = await getSetting("social_instagram");
        const waLink = await getSetting("social_whatsapp");

        let msg = "📞 <b>Контакты</b>\n\n";
        if (phone) msg += `Телефон: ${phone}\n`;
        if (email) msg += `Email: ${email}\n`;
        if (hours) msg += `Режим работы: ${hours}\n`;
        msg += "\n";

        const buttons: { text: string; url: string }[][] = [];
        const socialRow: { text: string; url: string }[] = [];
        if (tgLink) socialRow.push({ text: "Telegram", url: tgLink });
        if (igLink) socialRow.push({ text: "Instagram", url: igLink });
        if (waLink) socialRow.push({ text: "WhatsApp", url: waLink });
        if (socialRow.length > 0) buttons.push(socialRow);
        buttons.push([{ text: "🌐 Открыть сайт", url: baseUrl }]);

        await sendTelegramMessage(botToken, String(chatId), msg, { inline_keyboard: buttons });
        return NextResponse.json({ ok: true });
      }
    }

    // Handle channel posts (auto-sync)
    if (update.channel_post) {
      const autoSync = await getSetting("telegram_auto_sync");
      if (autoSync !== "true") {
        return NextResponse.json({ ok: true });
      }

      const post = update.channel_post;
      const postText = post.text || "";
      if (!postText.trim()) {
        return NextResponse.json({ ok: true });
      }

      const firstLine = postText.split("\n")[0] || "";
      const title = firstLine.length > 80 ? firstLine.slice(0, 80) : firstLine;
      const baseSlug = transliterateSlug(title) || `telegram-${Date.now()}`;
      const slug = await ensureUniqueSlug(baseSlug);

      const channelId = post.chat?.id;
      const messageId = post.message_id;
      const externalUrl = channelId && messageId
        ? `https://t.me/c/${String(channelId).replace("-100", "")}/${messageId}`
        : null;

      const excerpt = postText.slice(0, 200);

      await prisma.article.create({
        data: {
          title,
          slug,
          content: postText,
          excerpt,
          source: "telegram",
          externalUrl,
          category: "telegram",
          isPublished: true,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

// GET — setup webhook + menu button + commands
export async function GET() {
  try {
    const botToken = await getSetting("telegram_bot_token");
    if (!botToken) {
      return NextResponse.json({ error: "Bot token not configured. Add it in Admin → Settings → Telegram" }, { status: 500 });
    }

    const baseUrl = await getBaseUrl();
    const webhookUrl = `${baseUrl}/api/telegram/webhook`;
    const webAppUrl = `${baseUrl}/telegram-app`;
    const secret = createHmac("sha256", botToken).update("WebhookData").digest("hex");

    // 1. Set webhook
    const webhookRes = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: secret,
        allowed_updates: ["message", "channel_post", "callback_query"],
      }),
    });
    const webhookResult = await webhookRes.json();

    // 2. Set menu button (opens web app)
    await setMenuButton(botToken, webAppUrl);

    // 3. Set bot commands
    await setBotCommands(botToken);

    // 4. Try sending a test message to verify chat_id works
    const chatId = await getSetting("telegram_chat_id");
    let testResult = "not sent";
    if (chatId) {
      try {
        const testRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "✅ Бот настроен и работает!\n\nОтправьте /start для меню\nОтправьте /stats для статистики",
            parse_mode: "HTML",
          }),
        });
        const testData = await testRes.json();
        testResult = testData.ok ? "sent successfully" : `failed: ${testData.description || "unknown error"}`;
      } catch (e) {
        testResult = `error: ${e instanceof Error ? e.message : "unknown"}`;
      }
    }

    return NextResponse.json({
      ok: true,
      webhook: webhookResult.description || webhookResult,
      webAppUrl,
      menuButton: "set",
      commands: "set",
      chatId: chatId || "NOT SET",
      testMessage: testResult,
      message: "Bot configured! Send /start to your bot in Telegram.",
    });
  } catch (error) {
    console.error("Telegram setup error:", error);
    return NextResponse.json({ error: "Failed to setup bot" }, { status: 500 });
  }
}
