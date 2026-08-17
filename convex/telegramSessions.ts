import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel.d.ts";

export const upsertCustomerAndSession = internalMutation({
  args: {
    telegramUserId: v.string(),
    telegramUsername: v.optional(v.string()),
    telegramFirstName: v.optional(v.string()),
    telegramLastName: v.optional(v.string()),
    telegramDisplayName: v.optional(v.string()),
    telegramLanguageCode: v.optional(v.string()),
    telegramPhotoReference: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ sessionToken: string; customerId: Id<"customers"> }> => {
    const now = new Date().toISOString();

    let customer = await ctx.db
      .query("customers")
      .withIndex("by_telegram_id", (q) => q.eq("telegramUserId", args.telegramUserId))
      .first();

    if (!customer) {
      const customerId = await ctx.db.insert("customers", {
        telegramUserId: args.telegramUserId,
        telegramUsername: args.telegramUsername,
        telegramFirstName: args.telegramFirstName,
        telegramLastName: args.telegramLastName,
        telegramDisplayName: args.telegramDisplayName,
        telegramLanguageCode: args.telegramLanguageCode,
        telegramPhotoReference: args.telegramPhotoReference,
        groups: [],
        channels: [],
        firstSeenAt: now,
        lastSeenAt: now,
        lastAuthenticatedAt: now,
      });
      customer = await ctx.db.get(customerId);
    } else {
      await ctx.db.patch(customer._id, {
        telegramUsername: args.telegramUsername ?? customer.telegramUsername,
        telegramFirstName: args.telegramFirstName ?? customer.telegramFirstName,
        telegramLastName: args.telegramLastName ?? customer.telegramLastName,
        telegramDisplayName: args.telegramDisplayName ?? customer.telegramDisplayName,
        telegramLanguageCode: args.telegramLanguageCode ?? customer.telegramLanguageCode,
        telegramPhotoReference: args.telegramPhotoReference ?? customer.telegramPhotoReference,
        lastSeenAt: now,
        lastAuthenticatedAt: now,
      });
    }

    if (!customer) throw new Error("Failed to create/get customer");

    const sessionToken = Array.from(
      { length: 32 },
      () => Math.floor(Math.random() * 16).toString(16)
    ).join("");

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await ctx.db.insert("telegramSessions", {
      customerId: customer._id,
      telegramUserId: args.telegramUserId,
      sessionToken,
      createdAt: now,
      expiresAt,
    });

    return { sessionToken, customerId: customer._id };
  },
});

export const validateSession = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("telegramSessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .first();

    if (!session) return null;
    if (new Date(session.expiresAt) < new Date()) return null;

    const customer = await ctx.db.get(session.customerId);
    return customer;
  },
});

export const updatePhoneNumber = mutation({
  args: {
    sessionToken: v.string(),
    phoneNumber: v.string(),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("telegramSessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .first();

    if (!session) return;

    await ctx.db.patch(session.customerId, {
      phoneNumber: args.phoneNumber,
      phoneNumberSource: args.source,
    });
  },
});
