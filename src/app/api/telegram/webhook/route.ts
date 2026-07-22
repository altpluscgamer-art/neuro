import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import prisma from "@/lib/prisma";
import { getSetting } from "@/lib/settings";

function generateSlug(title: string): string {
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

export async function POST(request: Request) {
  try {
    const botToken = await getSetting("telegram_bot_token");
    if (!botToken) {
      return NextResponse.json({ error: "Bot token not configured" }, { status: 500 });
    }

    const secret = createHmac("sha256", botToken).update("WebhookData").digest("hex");
    const xTelegramBotApiSecretHeader = request.headers.get("x-telegram-bot-api-secret-token");
    if (!xTelegramBotApiSecretHeader || xTelegramBotApiSecretHeader !== secret) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 403 });
    }

    const update = await request.json();

    if (update.channel_post) {
      const autoSync = await getSetting("telegram_auto_sync");
      if (autoSync !== "true") {
        return NextResponse.json({ ok: true });
      }

      const post = update.channel_post;
      const text = post.text || "";
      if (!text.trim()) {
        return NextResponse.json({ ok: true });
      }

      const firstLine = text.split("\n")[0] || "";
      const title = firstLine.length > 80 ? firstLine.slice(0, 80) : firstLine;
      const baseSlug = generateSlug(title) || `telegram-${Date.now()}`;
      const slug = await ensureUniqueSlug(baseSlug);

      const channelId = post.chat?.id;
      const messageId = post.message_id;
      const externalUrl = channelId && messageId
        ? `https://t.me/c/${String(channelId).replace("-100", "")}/${messageId}`
        : null;

      const excerpt = text.slice(0, 200);

      await prisma.article.create({
        data: {
          title,
          slug,
          content: text,
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
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const botToken = await getSetting("telegram_bot_token");
    if (!botToken) {
      return NextResponse.json({ error: "Bot token not configured" }, { status: 500 });
    }

    const webhookUrl = await getSetting("telegram_webhook_url");
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const fullWebhookUrl = webhookUrl || `${baseUrl}/api/telegram/webhook`;

    const secret = createHmac("sha256", botToken).update("WebhookData").digest("hex");

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: fullWebhookUrl,
          secret_token: secret,
          allowed_updates: ["channel_post"],
        }),
      }
    );

    const result = await response.json();
    if (!result.ok) {
      return NextResponse.json({ error: "Failed to set webhook", details: result }, { status: 500 });
    }

    return NextResponse.json({ ok: true, description: result.description });
  } catch (error) {
    return NextResponse.json({ error: "Failed to set up webhook" }, { status: 500 });
  }
}
