import { useLocation, useParams, Link } from "react-router-dom";
import { CheckCircle, Clock, Truck, Hash } from "lucide-react";

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const state = location.state as { orderNumber?: string; queuePosition?: number; estimatedWaitingMinutes?: number; estimatedDispatchTime?: string } | null;

  return (
    <div className="bg-gray-50 min-h-full p-4">
      <div className="text-center py-6">
        <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
        <h1 className="text-black font-black" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "28px" }}>ORDER PLACED!</h1>
        <p className="text-gray-500 text-sm mt-1">Your order has been received and is being reviewed.</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
          <Hash size={20} className="text-gray-400" />
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Order Number</div>
            <div className="text-black font-black" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "22px", letterSpacing: "1px" }}>{state?.orderNumber ?? "\u2014"}</div>
          </div>
        </div>
        <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-lg" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>#{state?.queuePosition ?? "\u2014"}</span>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Queue Position</div>
            <div className="text-black font-black" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "20px" }}>QUEUE #{state?.queuePosition ?? "\u2014"}</div>
          </div>
        </div>
        <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
          <Clock size={20} className="text-orange-500" />
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Estimated Wait</div>
            <div className="font-black" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "20px", color: "#ef4444" }}>{state?.estimatedWaitingMinutes ?? "\u2014"} MINUTES</div>
          </div>
        </div>
        <div className="px-4 py-4 flex items-center gap-3">
          <Truck size={20} className="text-blue-500" />
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Estimated Dispatch</div>
            <div className="font-black" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "20px", color: "#ef4444" }}>{state?.estimatedDispatchTime ?? "\u2014"}</div>
          </div>
        </div>
      </div>
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800 font-medium">Your payment receipt is being reviewed by our team. You will be notified once your payment is confirmed.</p>
      </div>
      <div className="mt-6 space-y-3">
        <Link to="/shop/orders" className="block w-full text-center bg-black text-white font-bold py-3 rounded-xl cursor-pointer" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px" }}>VIEW MY ORDERS</Link>
        <Link to="/shop" className="block w-full text-center border border-gray-300 text-gray-700 font-bold py-3 rounded-xl cursor-pointer" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px" }}>CONTINUE SHOPPING</Link>
      </div>
      <div className="text-center py-4 text-gray-400" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "9px", letterSpacing: "0.5px" }}>USAGE OF THIS SYSTEM IS PROPRIETARY. DO NOT DISTRIBUTE OR COPY.</div>
    </div>
  );
}
