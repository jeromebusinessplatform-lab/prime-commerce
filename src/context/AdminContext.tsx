import { createContext, useContext, useState, useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";

interface AdminContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionToken: string | null;
  login: (code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const adminLogin = useAction(api.admin.login);
  const adminSessionValid = useQuery(
    api.adminSessions.validateSession,
    sessionToken ? { sessionToken } : "skip"
  );

  useEffect(() => {
    const stored = localStorage.getItem("prime_admin_session");
    if (stored) setSessionToken(stored);
    setIsLoading(false);
  }, []);

  const isAuthenticated = !!sessionToken && adminSessionValid !== false;

  const login = async (code: string) => {
    const result = await adminLogin({ accessCode: code });
    if (result.success && result.sessionToken) {
      localStorage.setItem("prime_admin_session", result.sessionToken);
      setSessionToken(result.sessionToken);
    }
    return result;
  };

  const logout = () => {
    localStorage.removeItem("prime_admin_session");
    setSessionToken(null);
  };

  return (
    <AdminContext.Provider value={{ isAuthenticated, isLoading, sessionToken, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
