import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel.d.ts";

export const getQueueStats = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").withIndex("by_status", (q) => q.eq("orderStatus", "REVIEW")).take(200);
    const packingOrders = await ctx.db.query("orders").withIndex("by_status", (q) => q.eq("orderStatus", "START_PACKING")).take(100);
    const readyOrders = await ctx.db.query("orders").withIndex("by_status", (q) => q.eq("orderStatus", "READY")).take(100);
    const confirmedOrders = await ctx.db.query("orders").withIndex("by_status", (q) => q.eq("orderStatus", "PAYMENT_CONFIRMED")).take(100);
    const awaitingOrders = await ctx.db.query("orders").withIndex("by_status", (q) => q.eq("orderStatus", "AWAITING_RIDER")).take(100);

    const activeOrders = [...orders, ...packingOrders, ...readyOrders, ...confirmedOrders, ...awaitingOrders];
    const processingOrders = [...packingOrders, ...readyOrders];

    const [pausedSetting, overrideSetting, maxSetting] = await Promise.all([
      ctx.db.query("settings").withIndex("by_key", (q) => q.eq("key", "queuePaused")).first(),
      ctx.db.query("settings").withIndex("by_key", (q) => q.eq("key", "waitTimeOverrideMinutes")).first(),
      ctx.db.query("settings").withIndex("by_key", (q) => q.eq("key", "maxConcurrentOrders")).first(),
    ]);

    const isPaused = pausedSetting?.value === "true";
    const waitTimeOverride = overrideSetting?.value ? parseInt(overrideSetting.value) : null;
    const maxConcurrent = maxSetting?.value ? parseInt(maxSetting.value) : null;
    const isAtCapacity = maxConcurrent !== null && activeOrders.length >= maxConcurrent;
    const baseWaitMinutes = waitTimeOverride ?? activeOrders.length * 8;

    let traffic = "LOW";
    if (activeOrders.length >= 10) traffic = "HIGH";
    else if (activeOrders.length >= 5) traffic = "MODERATE";

    return {
      onQueue: activeOrders.length,
      processing: processingOrders.length,
      estimatedWaitMinutes: baseWaitMinutes,
      estimatedDispatchMinutes: baseWaitMinutes + 15,
      traffic,
      isPaused,
      isAtCapacity,
      maxConcurrent,
      waitTimeOverride,
    };
  },
});

export const getCustomerActiveOrder = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("telegramSessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .first();
    if (!session) return null;

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_customer", (q) => q.eq("customerId", session.customerId))
      .order("desc")
      .take(10);

    const activeStatuses = ["REVIEW", "PAYMENT_CONFIRMED", "START_PACKING", "READY", "AWAITING_RIDER", "DISPATCHED"];
    return orders.find((o) => activeStatuses.includes(o.orderStatus)) ?? null;
  },
});

export const getCustomerOrders = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("telegramSessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .first();
    if (!session) return [];

    return await ctx.db
      .query("orders")
      .withIndex("by_customer", (q) => q.eq("customerId", session.customerId))
      .order("desc")
      .take(50);
  },
});

export const getReceiptUrl = query({
  args: { sessionToken: v.string(), orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("telegramSessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .first();
    if (!session) return null;

    const order = await ctx.db.get(args.orderId);
    if (!order || order.customerId !== session.customerId) return null;

    if (order.receiptStorageId) {
      return await ctx.storage.getUrl(order.receiptStorageId);
    }
    return order.receiptUrl ?? null;
  },
});

export const generateReceiptUploadUrl = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("telegramSessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .first();
    if (!session) throw new ConvexError({ message: "Unauthorized", code: "UNAUTHENTICATED" });
    return await ctx.storage.generateUploadUrl();
  },
});

export const submitOrder = mutation({
  args: {
    sessionToken: v.string(),
    idempotencyKey: v.string(),
    items: v.array(v.object({ productId: v.id("products"), quantity: v.number() })),
    receiverName: v.string(),
    contactNumber: v.string(),
    deliveryAddress: v.string(),
    deliveryLatitude: v.number(),
    deliveryLongitude: v.number(),
    courierId: v.optional(v.id("couriers")),
    courierName: v.string(),
    deliveryFeePaymentOption: v.union(v.literal("AT_CHECKOUT"), v.literal("UPON_DELIVERY")),
    deliveryFee: v.optional(v.number()),
    paymentMethodId: v.optional(v.id("paymentMethods")),
    paymentMethodName: v.string(),
    receiptStorageId: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{
    orderId: Id<"orders">;
    orderNumber: string;
    queuePosition: number;
    estimatedWaitingMinutes: number;
    estimatedDispatchTime: string;
  }> => {
    const session = await ctx.db
      .query("telegramSessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .first();
    if (!session || new Date(session.expiresAt) <= new Date()) {
      throw new ConvexError({ message: "Session expired", code: "UNAUTHENTICATED" });
    }

    const existing = await ctx.db
      .query("orders")
      .withIndex("by_idempotency_key", (q) => q.eq("idempotencyKey", args.idempotencyKey))
      .first();
    if (existing) {
      return {
        orderId: existing._id,
        orderNumber: existing.orderNumber,
        queuePosition: existing.queuePosition,
        estimatedWaitingMinutes: existing.estimatedWaitingMinutes,
        estimatedDispatchTime: existing.estimatedDispatchTime,
      };
    }

    const storeStatus = await ctx.db.query("settings").withIndex("by_key", (q) => q.eq("key", "storeStatus")).first();
    if (storeStatus?.value === "CLOSED") {
      throw new ConvexError({ message: "Store is currently closed", code: "BAD_REQUEST" });
    }

    const queuePaused = await ctx.db.query("settings").withIndex("by_key", (q) => q.eq("key", "queuePaused")).first();
    if (queuePaused?.value === "true") {
      throw new ConvexError({ message: "Queue is currently paused. Please try again later.", code: "BAD_REQUEST" });
    }

    const maxSetting = await ctx.db.query("settings").withIndex("by_key", (q) => q.eq("key", "maxConcurrentOrders")).first();
    if (maxSetting?.value) {
      const maxConcurrent = parseInt(maxSetting.value);
      const activeStatuses = ["REVIEW", "PAYMENT_CONFIRMED", "START_PACKING", "READY", "AWAITING_RIDER"] as const;
      let activeCount = 0;
      for (const status of activeStatuses) {
        const batch = await ctx.db.query("orders").withIndex("by_status", (q) => q.eq("orderStatus", status)).take(maxConcurrent + 1);
        activeCount += batch.length;
        if (activeCount >= maxConcurrent) break;
      }
      if (activeCount >= maxConcurrent) {
        throw new ConvexError({ message: "Queue is full. Please try again when capacity opens up.", code: "BAD_REQUEST" });
      }
    }

    let subtotal = 0;
    const orderItems: Array<{ productId: string; productName: string; quantity: number; unitPrice: number; subtotal: number }> = [];

    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (!product) throw new ConvexError({ message: `Product not found: ${item.productId}`, code: "NOT_FOUND" });
      if (!product.available) throw new ConvexError({ message: `${product.name} is not available`, code: "BAD_REQUEST" });
      if (product.stock < item.quantity) throw new ConvexError({ message: `Insufficient stock for ${product.name}`, code: "BAD_REQUEST" });

      const unitPrice = product.salePrice ?? product.price;
      const itemSubtotal = unitPrice * item.quantity;
      subtotal += itemSubtotal;
      orderItems.push({ productId: String(item.productId), productName: product.name, quantity: item.quantity, unitPrice, subtotal: itemSubtotal });
    }

    const baseDeliveryFeeStr = await ctx.db.query("settings").withIndex("by_key", (q) => q.eq("key", "baseDeliveryFee")).first();
    const baseDeliveryFee = parseFloat(baseDeliveryFeeStr?.value ?? "50");
    const deliveryFee = args.deliveryFee ?? baseDeliveryFee;
    const discount = 0;
    const additionalCharges = 0;
    const total = subtotal + deliveryFee + additionalCharges - discount;

    const now = new Date();
    const tz = args.timezone ?? "Asia/Manila";
    const formatter = new Intl.DateTimeFormat("en-PH", { timeZone: tz, day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    const parts = Object.fromEntries(formatter.formatToParts(now).map((p) => [p.type, p.value]));
    const orderNumber = (parts.day ?? "00") + (parts.month ?? "00") + (parts.year ?? "00") + (parts.hour ?? "00").replace("24", "00") + (parts.minute ?? "00") + (parts.second ?? "00");

    const activeOrders = await ctx.db.query("orders").withIndex("by_status", (q) => q.eq("orderStatus", "REVIEW")).take(200);
    const queuePosition = activeOrders.length + 1;
    const estimatedWaitingMinutes = queuePosition * 8;
    const dispatchTime = new Date(now.getTime() + estimatedWaitingMinutes * 60 * 1000 + 15 * 60 * 1000);
    const estimatedDispatchTime = dispatchTime.toLocaleTimeString("en-PH", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true });

    const customer = await ctx.db.get(session.customerId);
    if (!customer) throw new ConvexError({ message: "Customer not found", code: "NOT_FOUND" });

    const orderId = await ctx.db.insert("orders", {
      orderNumber,
      idempotencyKey: args.idempotencyKey,
      customerId: session.customerId,
      telegramUserId: customer.telegramUserId,
      telegramUsername: customer.telegramUsername,
      telegramDisplayName: customer.telegramDisplayName,
      items: orderItems,
      subtotal,
      discount,
      deliveryFee,
      additionalCharges,
      total,
      receiverName: args.receiverName,
      contactNumber: args.contactNumber,
      deliveryAddress: args.deliveryAddress,
      deliveryLatitude: args.deliveryLatitude,
      deliveryLongitude: args.deliveryLongitude,
      courierId: args.courierId ? String(args.courierId) : undefined,
      courierName: args.courierName,
      deliveryFeePaymentOption: args.deliveryFeePaymentOption,
      paymentMethodId: args.paymentMethodId ? String(args.paymentMethodId) : undefined,
      paymentMethodName: args.paymentMethodName,
      paymentStatus: "PENDING",
      receiptStorageId: args.receiptStorageId,
      orderStatus: "REVIEW",
      queuePosition,
      estimatedWaitingMinutes,
      estimatedDispatchTime,
    });

    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (product) {
        await ctx.db.patch(item.productId, { stock: Math.max(0, product.stock - item.quantity) });
      }
    }

    return { orderId, orderNumber, queuePosition, estimatedWaitingMinutes, estimatedDispatchTime };
  },
});
