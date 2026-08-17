// Displays: PRIME logo, date/time, SECURED CUSTOMER ACCESS
import { useEffect, useState } from "react";
import PrimeLogo from "@/components/PrimeLogo.tsx";

function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export default function ShopHeader() {
  const now = useLiveClock();
  const day = String(now.getDate()).padStart(2, "0");
  const monthNames = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const dateStr = `${day}-${month}-${year}`;
  const timeStr = `${hours}:${minutes}:${seconds} AM`;

  return (
    <header className="bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
      <div className="flex items-center">
        <PrimeLogo className="h-6" />
      </div>
      <div className="text-right">
        <div className="text-black font-semibold leading-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px" }}>
          {dateStr} | {timeStr}
        </div>
        <div className="text-gray-600 font-medium leading-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px" }}>
          SECURED CUSTOMER ACCESS
        </div>
      </div>
    </header>
  );
}
