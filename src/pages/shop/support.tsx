import { Headphones } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="bg-gray-50 min-h-full">
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <h1 className="text-black font-black" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "20px" }}>SUPPORT</h1>
      </div>
      <div className="p-4 flex flex-col items-center justify-center py-16 text-gray-400">
        <Headphones size={48} className="mb-3 opacity-30" />
        <p className="font-semibold">Contact Support</p>
        <p className="text-sm text-center mt-2">For assistance, please message the PRIME bot directly on Telegram.</p>
      </div>
    </div>
  );
}
