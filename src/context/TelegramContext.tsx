import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api.js";

interface TelegramCustomer {
  telegramUserId: string;
  telegramDisplayName: string;
  telegramUsername?: string;
  telegramFirstName?: string;
  telegramLanguageCode?: string;
}

interface TelegramContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  customer: TelegramCustomer | null;
  sessionToken: string | null;
  error: string | null;
  isTelegramEnv: boolean;
}

const TelegramContext = createContext<TelegramContextType>({
  isLoading: true,
  isAuthenticated: false,
  customer: null,
  sessionToken: null,
  error: null,
  isTelegramEnv: false,
});

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customer, setCustomer] = useState<TelegramCustomer | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTelegramEnv, setIsTelegramEnv] = useState(false);

  const authenticate = useAction(api.telegramAuth.authenticate);

  const initAuth = useCallback(async () => {
    try {
      const stored = sessionStorage.getItem("prime_session");
      const storedCustomer = sessionStorage.getItem("prime_customer");
      if (stored && storedCustomer) {
        setSessionToken(stored);
        setCustomer(JSON.parse(storedCustomer) as TelegramCustomer);
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      const tgWebApp = (window as { Telegram?: { WebApp?: { initData?: string; ready?: () => void } } }).Telegram?.WebApp;

      if (tgWebApp?.initData && tgWebApp.initData.length > 0) {
        setIsTelegramEnv(true);
        tgWebApp.ready?.();

        const result = await authenticate({ initData: tgWebApp.initData });
        if (result.success && result.sessionToken && result.customer) {
          sessionStorage.setItem("prime_session", result.sessionToken);
          sessionStorage.setItem("prime_customer", JSON.stringify(result.customer));
          setSessionToken(result.sessionToken);
          setCustomer(result.customer);
          setIsAuthenticated(true);
        } else {
          setError(result.error ?? "Authentication failed");
        }
      } else {
        const devMode = import.meta.env.VITE_TELEGRAM_DEV_MODE === "true";
        if (devMode) {
          const testUser = {
            id: 123456789,
            first_name: "Test",
            last_name: "Customer",
            username: "testcustomer",
            language_code: "en",
          };
          const initData = `test_${JSON.stringify(testUser)}`;
          const result = await authenticate({ initData });
          if (result.success && result.sessionToken && result.customer) {
            sessionStorage.setItem("prime_session", result.sessionToken);
            sessionStorage.setItem("prime_customer", JSON.stringify(result.customer));
            setSessionToken(result.sessionToken);
            setCustomer(result.customer);
            setIsAuthenticated(true);
          } else {
            setError("Dev auth failed");
          }
        } else {
          setIsAuthenticated(false);
          setIsTelegramEnv(false);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authentication error");
    } finally {
      setIsLoading(false);
    }
  }, [authenticate]);

  useEffect(() => {
    void initAuth();
  }, [initAuth]);

  return (
    <TelegramContext.Provider
      value={{ isLoading, isAuthenticated, customer, sessionToken, error, isTelegramEnv }}
    >
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  return useContext(TelegramContext);
}
