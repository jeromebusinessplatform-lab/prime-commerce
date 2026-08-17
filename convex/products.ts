import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { includeUnavailable: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("products").collect();
    if (!args.includeUnavailable) {
      return all.filter((p) => p.available);
    }
    return all;
  },
});

export const get = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    subname: v.optional(v.string()),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    price: v.number(),
    salePrice: v.optional(v.number()),
    stock: v.number(),
    available: v.boolean(),
    badge: v.optional(v.union(v.literal("NEW"), v.literal("SALE"), v.literal("LOW_STOCK"))),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    subname: v.optional(v.string()),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    price: v.optional(v.number()),
    salePrice: v.optional(v.number()),
    stock: v.optional(v.number()),
    available: v.optional(v.boolean()),
    badge: v.optional(v.union(v.literal("NEW"), v.literal("SALE"), v.literal("LOW_STOCK"))),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveImageStorageId = mutation({
  args: { id: v.id("products"), storageId: v.string() },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    await ctx.db.patch(args.id, {
      imageStorageId: args.storageId,
      image: url ?? undefined,
    });
  },
});
