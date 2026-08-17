import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createSession = internalMutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
    await ctx.db.insert("adminSessions", {
      sessionToken: args.sessionToken,
      createdAt: now,
      expiresAt,
    });
  },
});

export const validateSession = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args): Promise<boolean> => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .first();

    if (!session) return false;
    return new Date(session.expiresAt) > new Date();
  },
});

export const logout = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .first();
    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});
