import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useTelegram } from "@/context/TelegramContext.tsx";
import { Package, Clock, Truck } from "lucide-react";
import { Link } from "react-router-dom";

const STATUS_LABELS: Record<string, string> = {
  REVIEW: "Under Review", PAYMENT_CONFIRMED: "Payment Confirmed", START_PACKING: "Packing",
  READY: "Ready", AWAITING_RIDER: "Awaiting Rider", DISPATCHED: "Dispatched",
  DELIVERED: "Delivered", PAYMENT_FAILED: "Payment Failed", HOLD_ORDER: "On Hold",
  REQUEST_RESUBMIT: "Resubmit Required", PAYMENT_CLEARED: "Payment Cleared",
  FINAL_FOLLOW_UP: "Final Follow-up", REJECTED: "Rejected", CANCELLED: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  REVIEW: "#f97316", PAYMENT_CONFIRMED: "#22c55e", START_PACKING: "#3b82f6",
  READY: "#22c55e", AWAITING_RIDER: "#3b82f6", DISPATCHED: "#3b82f6",
  DELIVERED: "#22c55e", PAYMENT_FAILED: "#ef4444", HOLD_ORDER: "#f97316",
  REQUEST_RESUBMIT: "#f97316", PAYMENT_CLEARED: "#22c55e",
  FINAL_FOLLOW_UP: "#f97316", REJECTED: "#ef4444", CANCELLED: "#6b7280",
};

export default function OrdersPage() {
  const { sessionToken } = useTelegram();
  const orders = useQuery(api.orders.getCustomerOrders, sessionToken ? { sessionToken } : "skip");

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <h1 className="text-black font-black" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "20px" }}>MY ORDERS</h1>
      </div>
      {!orders ? (
        <div className="p-4 space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white rounded-xl h-24 animate-pulse border border-gray-200" />)}</div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Package size={48} className="mb-3 opacity-30" />
          <p className="font-semibold">No orders yet</p>
          <Link to="/shop" className="mt-4 text-sm text-blue-500 font-medium">Browse Products</Link>
        </div>
      ) : (
        <div className="p-3 space-y-2">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-black font-black" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", letterSpacing: "0.5px" }}>#{order.orderNumber}</div>
                  <div className="text-xs text-gray-400">{new Date(order._creationTime).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: STATUS_COLORS[order.orderStatus] ?? "#6b7280" }}>
                  {STATUS_LABELS[order.orderStatus] ?? order.orderStatus}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-500">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                <span className="text-black font-black" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px" }}>${order.total.toFixed(2)}</span>
              </div>
              {!["DELIVERED", "CANCELLED", "REJECTED"].includes(order.orderStatus) && (
                <div className="mt-2 pt-2 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1"><Clock size={11} />Queue #{order.queuePosition} \u2022 {order.estimatedWaitingMinutes}min wait</div>
                  <div className="flex items-center gap-1"><Truck size={11} />{order.estimatedDispatchTime}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
