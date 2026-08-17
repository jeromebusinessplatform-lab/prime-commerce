import { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface AdminContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already authenticated from localStorage
    const stored = localStorage.getItem("prime_admin_authenticated");
    if (stored === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (code: string) => {
    // Simple admin access code verification in Firestore
    // You should have a document in the 'settings' collection named 'admin_access_code'
    try {
      const adminCodeDoc = await getDoc(doc(db, "settings", "admin_access_code"));
      if (adminCodeDoc.exists() && adminCodeDoc.data().value === code) {
        localStorage.setItem("prime_admin_authenticated", "true");
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: "Invalid access code" };
    } catch (e) {
      return { success: false, error: "Login error" };
    }
  };

  const logout = () => {
    localStorage.removeItem("prime_admin_authenticated");
    setIsAuthenticated(false);
  };

  return (
    <AdminContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
