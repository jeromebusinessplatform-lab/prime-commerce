import { useTelegram } from "@/context/TelegramContext.tsx";
import { User } from "lucide-react";

export default function AccountPage() {
  const { customer } = useTelegram();

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <h1 className="text-black font-black" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "20px" }}>ACCOUNT</h1>
      </div>
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div>
              <div className="text-black font-black" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px" }}>
                {customer?.telegramDisplayName ?? "Guest"}
              </div>
              {customer?.telegramUsername && <div className="text-gray-500 text-sm">@{customer.telegramUsername}</div>}
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100 text-sm text-gray-600">
            <div className="flex justify-between py-1">
              <span>Telegram ID</span>
              <span className="font-medium">{customer?.telegramUserId ?? "\u2014"}</span>
            </div>
          </div>
        </div>
        <div className="text-center text-gray-300" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "9px", letterSpacing: "0.5px" }}>
          USAGE OF THIS SYSTEM IS PROPRIETARY. DO NOT DISTRIBUTE OR COPY.
        </div>
      </div>
    </div>
  );
}
