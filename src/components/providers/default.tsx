import { AuthProvider } from "./auth.tsx";
import { FirestoreProvider } from "./firestore.tsx";
import { QueryClientProvider } from "./query-client.tsx";
import { ThemeProvider } from "./theme.tsx";
import { Toaster } from "../ui/sonner.tsx";
import { TooltipProvider } from "../ui/tooltip.tsx";

export function DefaultProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FirestoreProvider>
        <QueryClientProvider>
          <TooltipProvider>
            <ThemeProvider>
              <Toaster />
              {children}
            </ThemeProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </FirestoreProvider>
    </AuthProvider>
  );
}
