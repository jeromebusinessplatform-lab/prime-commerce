import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext.tsx";
import { ShoppingBag, Package, Settings, LogOut } from "lucide-react";
import PrimeLogo from "@/components/PrimeLogo.tsx";

export default function AdminLayout() {
  const { logout } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  const navItems = [
    { to: "/admin/orders", icon: ShoppingBag, label: "Orders" },
    { to: "/admin/products", icon: Package, label: "Products" },
    { to: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-white rounded-md px-2.5 py-1 flex items-center">
            <PrimeLogo className="h-4" />
          </div>
          <span className="text-gray-500 text-sm font-normal">Admin</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm cursor-pointer">
          <LogOut size={14} /> Logout
        </button>
      </header>

      <div className="flex h-[calc(100vh-53px)]">
        <aside className="hidden md:flex flex-col w-48 bg-gray-900 border-r border-gray-800 p-3">
          <nav className="space-y-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                  isActive ? "bg-white text-black" : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`
              }>
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex md:hidden z-50">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 text-xs cursor-pointer ${
              isActive ? "text-white" : "text-gray-500"
            }`
          }>
            <Icon size={18} />
            <span className="mt-0.5">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
