import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext.tsx";
import { Loader2, Eye, EyeOff } from "lucide-react";
import PrimeLogo from "@/components/PrimeLogo.tsx";

export default function AdminLogin() {
  const { login, isAuthenticated, isLoading: authLoading } = useAdmin();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/admin/orders", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const result = await login(code);
    if (result.success) {
      navigate("/admin/orders", { replace: true });
    } else {
      setError(result.error ?? "Invalid access code");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-white rounded-2xl px-6 py-4 flex items-center justify-center">
            <PrimeLogo className="h-9" />
          </div>
          <div className="text-gray-400 text-sm font-medium tracking-widest uppercase mt-4">Admin Panel</div>
        </div>

        <form onSubmit={handleSubmit} className="w-full bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="mb-4">
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 text-center">Access Code</label>
            <div className="relative">
              <input
                type={showCode ? "text" : "password"}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter admin access code"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 pr-10 text-sm outline-none focus:border-gray-500 placeholder-gray-600 text-center"
                autoComplete="off"
              />
              <button type="button" onClick={() => setShowCode(!showCode)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer">
                {showCode ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-900/50 border border-red-800 text-red-300 text-sm px-3 py-2 rounded-lg text-center">{error}</div>
          )}

          <button type="submit" disabled={!code || isLoading} className="w-full bg-white text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px" }}>
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
            ENTER ADMIN PANEL
          </button>
        </form>

        <div className="text-center mt-6 text-gray-700" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "9px", letterSpacing: "0.5px" }}>
          USAGE OF THIS SYSTEM IS PROPRIETARY. DO NOT DISTRIBUTE OR COPY.
        </div>
      </div>
    </div>
  );
}
