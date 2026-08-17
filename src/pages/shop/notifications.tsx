import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="bg-gray-50 min-h-full">
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <h1 className="text-black font-black" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "20px" }}>NOTIFICATIONS</h1>
      </div>
      <div className="p-4 flex flex-col items-center justify-center py-16 text-gray-400">
        <Bell size={48} className="mb-3 opacity-30" />
        <p className="font-semibold">No notifications</p>
      </div>
    </div>
  );
}
