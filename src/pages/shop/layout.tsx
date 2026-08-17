import { Outlet } from "react-router-dom";
import ShopHeader from "./_components/ShopHeader.tsx";
import QueueStrip from "./_components/QueueStrip.tsx";
import BottomNav from "./_components/BottomNav.tsx";
import { useTelegram } from "@/context/TelegramContext.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import PrimeLogo from "@/components/PrimeLogo.tsx";

export default function ShopLayout() {
  const { isLoading, isAuthenticated, isTelegramEnv } = useTelegram();
  const isDev = import.meta.env.VITE_TELEGRAM_DEV_MODE === "true";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center text-center space-y-3">
          <PrimeLogo className="h-8" />
          <Spinner />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isDev) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="flex flex-col items-center text-center space-y-4 max-w-xs">
          <PrimeLogo className="h-9" />
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-800">SECURED CUSTOMER ACCESS</p>
            <p className="text-xs text-gray-500 mt-2">This store is accessible only through the official Telegram Mini App.</p>
          </div>
          <p className="text-xs text-gray-400">Please open this app from the official PRIME Telegram bot.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-md mx-auto">
      <ShopHeader />
      <QueueStrip />
      <main className="flex-1 overflow-auto pb-16">
        <Outlet />
      </main>
      <BottomNav />
      <div className="pb-16" />
    </div>
  );
}
