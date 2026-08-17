"use node";
/// <reference types="node" />
import { action } from "./_generated/server";
import { v } from "convex/values";

export const login = action({
  args: { accessCode: v.string() },
  handler: async (ctx, args): Promise<{ success: boolean; sessionToken?: string; error?: string }> => {
    const storedCode = process.env.ADMIN_ACCESS_CODE;
    if (!storedCode || storedCode.trim().length === 0) {
      return {
        success: false,
        error: "Admin access code is not configured. Add ADMIN_ACCESS_CODE in the Secrets tab.",
      };
    }

    const entered = args.accessCode.trim();
    const stored = storedCode.trim();

    if (entered.toLowerCase() !== stored.toLowerCase()) {
      return { success: false, error: "Invalid access code" };
    }

    const sessionToken = Array.from(
      { length: 48 },
      () => Math.floor(Math.random() * 16).toString(16)
    ).join("");

    await ctx.runMutation(
      (await import("./_generated/api")).internal.adminSessions.createSession,
      { sessionToken }
    );

    return { success: true, sessionToken };
  },
});
