import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Home, List, Bell, User, Headphones } from "lucide-react";
import { useCart } from "@/context/CartContext.tsx";

export default function BottomNav() {
  const location = useLocation();
  const { totalItems } = useCart();
  const path = location.pathname;

  const navItems = [
    { href: "/shop", icon: Home, label: "HOME" },
    { href: "/shop/cart", icon: ShoppingCart, label: "CART", badge: totalItems },
    { href: "/shop/orders", icon: List, label: "ORDERS" },
    { href: "/shop/notifications", icon: Bell, label: "ALERTS" },
    { href: "/shop/account", icon: User, label: "ACCOUNT" },
    { href: "/shop/support", icon: Headphones, label: "SUPPORT" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around h-14">
        {navItems.map(({ href, icon: Icon, label, badge }) => {
          const isActive = path === href || (href !== "/shop" && path.startsWith(href));
          return (
            <Link key={href} to={href} className={`flex flex-col items-center justify-center flex-1 h-full relative cursor-pointer ${isActive ? "text-black" : "text-gray-400"}`}>
              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                {badge !== undefined && badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {badge > 99 ? "99" : badge}
                  </span>
                )}
              </div>
              <span className={`mt-0.5 leading-none ${isActive ? "font-bold" : "font-normal"}`} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "8px" }}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
