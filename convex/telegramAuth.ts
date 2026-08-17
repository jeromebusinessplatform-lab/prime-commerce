"use node";
/// <reference types="node" />
import { action } from "./_generated/server";
import { v } from "convex/values";
import { createHmac } from "crypto";

function validateTelegramInitData(initData: string, botToken: string): boolean {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return false;

  params.delete("hash");

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  return computedHash === hash;
}

export const authenticate = action({
  args: {
    initData: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    sessionToken?: string;
    customer?: {
      telegramUserId: string;
      telegramDisplayName: string;
      telegramUsername?: string;
      telegramFirstName?: string;
      telegramLanguageCode?: string;
    };
    error?: string;
  }> => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return { success: false, error: "Bot token not configured" };
    }

    const isDev = process.env.TELEGRAM_DEV_MODE === "true";
    let telegramUser: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      photo_url?: string;
    } | null = null;

    if (isDev && args.initData.startsWith("test_")) {
      const testData = args.initData.replace("test_", "");
      try {
        telegramUser = JSON.parse(testData);
      } catch {
        return { success: false, error: "Invalid test data" };
      }
    } else {
      const isValid = validateTelegramInitData(args.initData, botToken);
      if (!isValid) {
        return { success: false, error: "Invalid Telegram session" };
      }

      const params = new URLSearchParams(args.initData);
      const userStr = params.get("user");
      if (!userStr) {
        return { success: false, error: "No user data in session" };
      }

      try {
        telegramUser = JSON.parse(userStr);
      } catch {
        return { success: false, error: "Invalid user data" };
      }
    }

    if (!telegramUser) {
      return { success: false, error: "No user data" };
    }

    const telegramUserId = String(telegramUser.id);
    const displayName = [telegramUser.first_name, telegramUser.last_name]
      .filter(Boolean)
      .join(" ") || telegramUser.username || `User${telegramUserId}`;

    const result = await ctx.runMutation(
      (await import("./_generated/api")).internal.telegramSessions.upsertCustomerAndSession,
      {
        telegramUserId,
        telegramUsername: telegramUser.username,
        telegramFirstName: telegramUser.first_name,
        telegramLastName: telegramUser.last_name,
        telegramDisplayName: displayName,
        telegramLanguageCode: telegramUser.language_code,
        telegramPhotoReference: telegramUser.photo_url,
      }
    );

    return {
      success: true,
      sessionToken: result.sessionToken,
      customer: {
        telegramUserId,
        telegramDisplayName: displayName,
        telegramUsername: telegramUser.username,
        telegramFirstName: telegramUser.first_name,
        telegramLanguageCode: telegramUser.language_code,
      },
    };
  },
});
