import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { enabledOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("couriers").collect();
    if (args.enabledOnly) return all.filter((c) => c.enabled);
    return all;
  },
});

export const create = mutation({
  args: { name: v.string(), enabled: v.boolean(), sortOrder: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db.insert("couriers", args);
  },
});

export const update = mutation({
  args: { id: v.id("couriers"), name: v.optional(v.string()), enabled: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

export const remove = mutation({
  args: { id: v.id("couriers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
