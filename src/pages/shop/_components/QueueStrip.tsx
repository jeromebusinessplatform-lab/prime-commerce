import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useTelegram } from "@/context/TelegramContext.tsx";
import { PauseCircle } from "lucide-react";

export default function QueueStrip() {
  const stats = useQuery(api.orders.getQueueStats, {});
  const { sessionToken } = useTelegram();
  const activeOrder = useQuery(
    api.orders.getCustomerActiveOrder,
    sessionToken ? { sessionToken } : "skip"
  );

  const traffic = stats?.traffic ?? "LOW";
  const isPaused = stats?.isPaused ?? false;
  const isAtCapacity = stats?.isAtCapacity ?? false;
  const isBlocked = isPaused || isAtCapacity;

  const trafficColor =
    traffic === "HIGH" ? "#ef4444" :
    traffic === "MODERATE" ? "#f97316" : "#22c55e";

  if (isBlocked) {
    return (
      <div className="border-b border-gray-200 bg-amber-50">
        <div className="flex items-center justify-center gap-2 px-3 py-2">
          <PauseCircle size={14} className="text-amber-600 flex-shrink-0" />
          <div className="text-center">
            <span className="text-amber-800 font-black uppercase" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", letterSpacing: "0.5px" }}>
              {isPaused ? "QUEUE PAUSED" : "QUEUE FULL"}
            </span>
            <span className="text-amber-600 ml-2" style={{ fontFamily: "'Barlow', sans-serif", fontSize: "11px" }}>
              {isPaused ? "Not accepting new orders right now" : `At capacity (${stats?.onQueue ?? 0}/${stats?.maxConcurrent ?? "\u2014"} orders)`}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200" style={{ backgroundColor: "#f8f8f8" }}>
      <div className="flex items-stretch divide-x divide-gray-200">
        <div className="flex-1 px-2 py-1.5 text-center">
          <div className="text-gray-500 uppercase leading-none" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "9px", letterSpacing: "0.5px" }}>ON QUEUE</div>
          <div className="font-black text-black leading-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "20px" }}>{stats?.onQueue ?? 0}</div>
        </div>
        <div className="flex-1 px-2 py-1.5 text-center">
          <div className="text-gray-500 uppercase leading-none" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "9px", letterSpacing: "0.5px" }}>PROCESSING</div>
          <div className="font-black leading-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "20px", color: "#22c55e" }}>{stats?.processing ?? 0}</div>
        </div>
        <div className="flex-1 px-2 py-1.5 text-center">
          <div className="text-gray-500 uppercase leading-none" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "9px", letterSpacing: "0.5px" }}>EST. WAIT</div>
          <div className="font-black leading-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", color: "#ef4444" }}>
            {stats?.estimatedWaitMinutes ?? 0}M
            {stats?.waitTimeOverride != null && <span className="text-orange-400 ml-0.5 text-[9px]">★</span>}
          </div>
        </div>
        <div className="flex-1 px-2 py-1.5 text-center">
          <div className="text-gray-500 uppercase leading-none" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "9px", letterSpacing: "0.5px" }}>EST. DISPATCH</div>
          <div className="font-black leading-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", color: "#ef4444" }}>{stats?.estimatedDispatchMinutes ?? 0}M</div>
        </div>
        <div className="flex-1 px-2 py-1.5 text-center">
          <div className="text-gray-500 uppercase leading-none" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "9px", letterSpacing: "0.5px" }}>TRAFFIC</div>
          <div className="font-black leading-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", color: trafficColor }}>{traffic}</div>
        </div>
      </div>
    </div>
  );
}
