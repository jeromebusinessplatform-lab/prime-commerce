import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel.d.ts";

async function requireAdmin(ctx: QueryCtx | MutationCtx, sessionToken: string): Promise<void> {
  const session = await ctx.db
    .query("adminSessions")
    .withIndex("by_token", (q) => q.eq("sessionToken", sessionToken))
    .first();
  if (!session || new Date(session.expiresAt) <= new Date()) {
    throw new ConvexError({ message: "Unauthorized", code: "UNAUTHENTICATED" });
  }
}

export const listOrders = query({
  args: {
    adminSessionToken: v.string(),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Doc<"orders">[]> => {
    await requireAdmin(ctx, args.adminSessionToken);

    const allOrders = await ctx.db
      .query("orders")
      .order("desc")
      .take(args.limit ?? 100);

    if (args.status) {
      return allOrders.filter((o) => o.orderStatus === args.status);
    }
    return allOrders;
  },
});

export const getOrder = query({
  args: { adminSessionToken: v.string(), orderId: v.id("orders") },
  handler: async (ctx, args): Promise<Doc<"orders"> | null> => {
    await requireAdmin(ctx, args.adminSessionToken);
    return await ctx.db.get(args.orderId);
  },
});

export const updateOrderStatus = mutation({
  args: {
    adminSessionToken: v.string(),
    orderId: v.id("orders"),
    orderStatus: v.union(
      v.literal("REVIEW"),
      v.literal("PAYMENT_CONFIRMED"),
      v.literal("START_PACKING"),
      v.literal("READY"),
      v.literal("AWAITING_RIDER"),
      v.literal("DISPATCHED"),
      v.literal("DELIVERED"),
      v.literal("PAYMENT_FAILED"),
      v.literal("HOLD_ORDER"),
      v.literal("REQUEST_RESUBMIT"),
      v.literal("PAYMENT_CLEARED"),
      v.literal("FINAL_FOLLOW_UP"),
      v.literal("REJECTED"),
      v.literal("CANCELLED")
    ),
    paymentStatus: v.optional(v.union(
      v.literal("PENDING"),
      v.literal("CONFIRMED"),
      v.literal("FAILED"),
      v.literal("CLEARED")
    )),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSessionToken);

    const update: {
      orderStatus: typeof args.orderStatus;
      paymentStatus?: "PENDING" | "CONFIRMED" | "FAILED" | "CLEARED";
      adminNotes?: string;
    } = { orderStatus: args.orderStatus };

    if (args.paymentStatus !== undefined) update.paymentStatus = args.paymentStatus;
    if (args.adminNotes !== undefined) update.adminNotes = args.adminNotes;

    await ctx.db.patch(args.orderId, update);
  },
});

export const modifyOrder = mutation({
  args: {
    adminSessionToken: v.string(),
    orderId: v.id("orders"),
    receiverName: v.optional(v.string()),
    contactNumber: v.optional(v.string()),
    deliveryAddress: v.optional(v.string()),
    courierName: v.optional(v.string()),
    deliveryFee: v.optional(v.number()),
    discount: v.optional(v.number()),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSessionToken);

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new ConvexError({ message: "Order not found", code: "NOT_FOUND" });

    const patch: Partial<Doc<"orders">> = {};
    if (args.receiverName !== undefined) patch.receiverName = args.receiverName;
    if (args.contactNumber !== undefined) patch.contactNumber = args.contactNumber;
    if (args.deliveryAddress !== undefined) patch.deliveryAddress = args.deliveryAddress;
    if (args.courierName !== undefined) patch.courierName = args.courierName;
    if (args.adminNotes !== undefined) patch.adminNotes = args.adminNotes;

    if (args.deliveryFee !== undefined || args.discount !== undefined) {
      const deliveryFee = args.deliveryFee ?? order.deliveryFee;
      const discount = args.discount ?? order.discount;
      patch.deliveryFee = deliveryFee;
      patch.discount = discount;
      patch.total = order.subtotal + deliveryFee + order.additionalCharges - discount;
    }

    await ctx.db.patch(args.orderId, patch);
  },
});

export const getReceiptUrl = query({
  args: { adminSessionToken: v.string(), orderId: v.id("orders") },
  handler: async (ctx, args): Promise<string | null> => {
    await requireAdmin(ctx, args.adminSessionToken);

    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    if (order.receiptStorageId) {
      return await ctx.storage.getUrl(order.receiptStorageId);
    }
    return order.receiptUrl ?? null;
  },
});
