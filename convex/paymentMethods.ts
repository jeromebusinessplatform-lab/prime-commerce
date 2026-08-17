import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { enabledOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("paymentMethods").collect();
    if (args.enabledOnly) return all.filter((m) => m.enabled);
    return all;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    instructions: v.optional(v.string()),
    qrImageUrl: v.optional(v.string()),
    paymentLink: v.optional(v.string()),
    enabled: v.boolean(),
    requiresReceipt: v.boolean(),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("paymentMethods", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("paymentMethods"),
    name: v.optional(v.string()),
    instructions: v.optional(v.string()),
    qrImageUrl: v.optional(v.string()),
    paymentLink: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
    requiresReceipt: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

export const remove = mutation({
  args: { id: v.id("paymentMethods") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
