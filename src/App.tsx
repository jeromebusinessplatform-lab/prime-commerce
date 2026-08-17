import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useServiceWorker } from "@/hooks/use-service-worker.ts";
import { DefaultProviders } from "./components/providers/default.tsx";
import AuthCallback from "./pages/auth/Callback.tsx";
import NotFound from "./pages/NotFound.tsx";
import { TelegramProvider } from "./context/TelegramContext.tsx";
import { CartProvider } from "./context/CartContext.tsx";
import { AdminProvider } from "./context/AdminContext.tsx";
import { useAdmin } from "./context/AdminContext.tsx";

import ShopLayout from "./pages/shop/layout.tsx";
import ShopCatalog from "./pages/shop/page.tsx";
// import CartPage from "./pages/shop/cart.tsx";
// import CheckoutPage from "./pages/shop/checkout.tsx";
// import OrderConfirmationPage from "./pages/shop/order-confirmation.tsx";
import OrdersPage from "./pages/shop/orders.tsx";
import AccountPage from "./pages/shop/account.tsx";
import SupportPage from "./pages/shop/support.tsx";
import NotificationsPage from "./pages/shop/notifications.tsx";

import AdminLogin from "./pages/admin/login.tsx";
import AdminLayout from "./pages/admin/layout.tsx";
import AdminOrdersPage from "./pages/admin/orders.tsx";
// import AdminOrderDetailPage from "./pages/admin/order-detail.tsx";
// import AdminProductsPage from "./pages/admin/products.tsx";
// import AdminSettingsPage from "./pages/admin/settings.tsx";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAdmin();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

export default function App() {
  useServiceWorker();
  return (
    <DefaultProviders>
      <TelegramProvider>
        <CartProvider>
          <AdminProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/shop" replace />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/shop" element={<ShopLayout />}>
                  <Route index element={<ShopCatalog />} />
                  {/* <Route path="cart" element={<CartPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} /> */}
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="account" element={<AccountPage />} />
                  <Route path="support" element={<SupportPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                </Route>
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
                  <Route path="orders" element={<AdminOrdersPage />} />
                  {/* <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} /> */}
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AdminProvider>
        </CartProvider>
      </TelegramProvider>
    </DefaultProviders>
  );
}
