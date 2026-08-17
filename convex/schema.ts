import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),

  customers: defineTable({
    telegramUserId: v.string(),
    telegramUsername: v.optional(v.string()),
    telegramFirstName: v.optional(v.string()),
    telegramLastName: v.optional(v.string()),
    telegramDisplayName: v.optional(v.string()),
    telegramLanguageCode: v.optional(v.string()),
    telegramPhotoReference: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    phoneNumberSource: v.optional(v.string()),
    groups: v.array(v.object({
      id: v.string(),
      title: v.string(),
      username: v.optional(v.string()),
      membershipStatus: v.string(),
      capturedAt: v.string(),
    })),
    channels: v.array(v.object({
      id: v.string(),
      title: v.string(),
      username: v.optional(v.string()),
      membershipStatus: v.string(),
      capturedAt: v.string(),
    })),
    firstSeenAt: v.string(),
    lastSeenAt: v.string(),
    lastAuthenticatedAt: v.string(),
  }).index("by_telegram_id", ["telegramUserId"]),

  products: defineTable({
    name: v.string(),
    subname: v.optional(v.string()),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    imageStorageId: v.optional(v.string()),
    price: v.number(),
    salePrice: v.optional(v.number()),
    stock: v.number(),
    available: v.boolean(),
    badge: v.optional(v.union(v.literal("NEW"), v.literal("SALE"), v.literal("LOW_STOCK"))),
    category: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  }),

  orders: defineTable({
    orderNumber: v.string(),
    idempotencyKey: v.optional(v.string()),
    customerId: v.id("customers"),
    telegramUserId: v.string(),
    telegramUsername: v.optional(v.string()),
    telegramDisplayName: v.optional(v.string()),
    items: v.array(v.object({
      productId: v.string(),
      productName: v.string(),
      quantity: v.number(),
      unitPrice: v.number(),
      subtotal: v.number(),
    })),
    subtotal: v.number(),
    discount: v.number(),
    deliveryFee: v.number(),
    additionalCharges: v.number(),
    total: v.number(),
    receiverName: v.string(),
    contactNumber: v.string(),
    deliveryAddress: v.string(),
    deliveryLatitude: v.number(),
    deliveryLongitude: v.number(),
    courierId: v.optional(v.string()),
    courierName: v.string(),
    deliveryFeePaymentOption: v.union(v.literal("AT_CHECKOUT"), v.literal("UPON_DELIVERY")),
    paymentMethodId: v.optional(v.string()),
    paymentMethodName: v.string(),
    paymentStatus: v.union(
      v.literal("PENDING"),
      v.literal("CONFIRMED"),
      v.literal("FAILED"),
      v.literal("CLEARED")
    ),
    receiptStorageId: v.optional(v.string()),
    receiptUrl: v.optional(v.string()),
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
    queuePosition: v.number(),
    estimatedWaitingMinutes: v.number(),
    estimatedDispatchTime: v.string(),
    adminNotes: v.optional(v.string()),
  })
    .index("by_customer", ["customerId"])
    .index("by_telegram_id", ["telegramUserId"])
    .index("by_order_number", ["orderNumber"])
    .index("by_idempotency_key", ["idempotencyKey"])
    .index("by_status", ["orderStatus"]),

  couriers: defineTable({
    name: v.string(),
    enabled: v.boolean(),
    sortOrder: v.optional(v.number()),
  }),

  paymentMethods: defineTable({
    name: v.string(),
    instructions: v.optional(v.string()),
    qrImageUrl: v.optional(v.string()),
    qrImageStorageId: v.optional(v.string()),
    paymentLink: v.optional(v.string()),
    enabled: v.boolean(),
    requiresReceipt: v.boolean(),
    sortOrder: v.optional(v.number()),
  }),

  settings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),

  adminSessions: defineTable({
    sessionToken: v.string(),
    createdAt: v.string(),
    expiresAt: v.string(),
  }).index("by_token", ["sessionToken"]),

  telegramSessions: defineTable({
    customerId: v.id("customers"),
    telegramUserId: v.string(),
    sessionToken: v.string(),
    createdAt: v.string(),
    expiresAt: v.string(),
  })
    .index("by_token", ["sessionToken"])
    .index("by_telegram_id", ["telegramUserId"]),
});
