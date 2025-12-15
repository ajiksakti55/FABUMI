"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../auth-context";
import Image from "next/image";

// 🎨 ICONS
import {
  Menu,
  BarChart3,
  Settings,
  ChevronRight,
  LogOut,
  Home,
  Wallet,
  Layers3,
  PiggyBank,
} from "lucide-react";

export default function Sidebar({ onToggle }) {
  const { currentUser, access, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [hoverDropdown, setHoverDropdown] = useState(null);

  useEffect(() => {
    if (onToggle) onToggle(isCollapsed);
  }, [isCollapsed, onToggle]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (err) {
      console.error("Logout gagal:", err);
    }
  };

  if (!access) return null;

  // ✅ MENU ITEMS (ikon berbeda)
  const menuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      path: "/dashboard",
      icon: <Home size={20} />,
    },
    {
      id: "transaksi",
      name: "Transaksi",
      path: "/transaksi",
      icon: <Wallet size={20} className="text-emerald-600" />,
    },
    {
      id: "kategori",
      name: "Kategori",
      path: "/kategori",
      icon: <Layers3 size={20} className="text-indigo-600" />,
    },
    {
      id: "budget",
      name: "Budget",
      path: "/budget",
      icon: <PiggyBank size={20} className="text-pink-500" />,
    },
    {
      id: "settings",
      name: "Settings",
      icon: <Settings size={20} />,
      dropdown: [
        { id: "add-users", name: "Tambah User", path: "/settings/add-users" },
        { id: "edit-users", name: "Edit User", path: "/settings/edit-user" },
        { id: "add-role", name: "Tambah Role", path: "/settings/add-role" },
        { id: "edit-role", name: "Edit Role", path: "/settings/edit-role" },
      ],
    },
  ];

  // Filter menu sesuai hak akses user
  const filteredMenu = menuItems
    .map((item) => {
      if (item.dropdown) {
        const allowed = item.dropdown.filter((sub) => access.includes(sub.id));
        return allowed.length ? { ...item, dropdown: allowed } : null;
      }
      return access.includes(item.id) ? item : null;
    })
    .filter(Boolean);

  return (
    <aside
      className={`fixed top-0 left-0 h-screen text-gray-800 bg-white flex flex-col
        shadow-lg transition-[width] duration-300 z-50
        ${isCollapsed ? "w-[66px]" : "w-56"}
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={() => {
          setOpenDropdown(null);
          setIsCollapsed(!isCollapsed);
        }}
        className="absolute top-4 right-4 hover:bg-gray-100 bg-gray-200 p-2 rounded-md z-50"
      >
        <Menu size={24} />
      </button>

      {/* Header */}
      <div className="flex flex-col px-8 py-6 border-b border-gray-100">
        <div
          className={`flex items-center gap-3 transition-all ${
            isCollapsed ? "justify-center opacity-0" : "opacity-100"
          }`}
        >
          <div className="w-10 h-10 relative shrink-0">
            <Image
              src="/icons/pp.png"
              fill
              className="rounded-full object-cover"
              alt="profile"
            />
          </div>

          {!isCollapsed && (
            <div className="text-xl text-gray-600 font-bold">FABUMI</div>
          )}
        </div>

        {!isCollapsed && (
          <div className="text-xs text-gray-600 mt-2 truncate">
            {currentUser?.email}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-4 space-y-1 custom-scrollbar">
        {filteredMenu.map((item) => {
          const active = pathname === item.path;

          if (!item.dropdown) {
            return (
              <Link key={item.id} href={item.path}>
                <div
                  className={`relative flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all mb-1
                    ${
                      active
                        ? "text-gray-800 font-semibold bg-blue-50"
                        : "hover:bg-gray-100"
                    }
                    ${isCollapsed ? "justify-center" : ""}
                  `}
                >
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute -left-4 top-1 h-8 w-1 bg-blue-600 rounded-r"></div>
                  )}
                  {item.icon}
                  {!isCollapsed && <span>{item.name}</span>}
                </div>
              </Link>
            );
          }

          // Dropdown logic
          const isOpen = openDropdown === item.id;

          return (
            <div
              key={item.id}
              className="mb-1"
              onMouseEnter={() => isCollapsed && setHoverDropdown(item.id)}
              onMouseLeave={() => isCollapsed && setHoverDropdown(null)}
            >
              <button
                onClick={() =>
                  !isCollapsed && setOpenDropdown(isOpen ? null : item.id)
                }
                className={`flex items-center gap-3 p-2 w-full rounded-md transition 
                  ${isCollapsed ? "justify-center" : ""}
                  ${isOpen ? "bg-gray-100" : "hover:bg-gray-100"}
                `}
              >
                {item.icon}
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.name}</span>
                    <ChevronRight
                      size={16}
                      className={`transition-transform duration-200 ${
                        isOpen ? "rotate-90" : ""
                      }`}
                    />
                  </>
                )}
              </button>

              {/* Expanded dropdown */}
              {!isCollapsed && isOpen && (
                <div className="ml-6 mt-1 flex flex-col space-y-1 pl-2">
                  {item.dropdown.map((sub) => {
                    const activeSub = pathname === sub.path;
                    return (
                      <Link key={sub.id} href={sub.path}>
                        <div
                          className={`relative flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all
                            ${
                              activeSub
                                ? "text-gray-800 font-semibold bg-blue-50"
                                : "hover:bg-gray-100"
                            }
                          `}
                        >
                          {activeSub && (
                            <div className="absolute -left-12 top-1 h-8 w-1 bg-blue-600 rounded-r"></div>
                          )}
                          {sub.name}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Floating dropdown (collapsed mode) */}
              {isCollapsed && hoverDropdown === item.id && (
                <div
                  className="absolute left-[58px] bg-white shadow-xl p-4 rounded-xl w-56 z-50 animate-fadeIn -mt-10"
                >
                  <div className="font-bold text-gray-700 px-2 pb-2 mb-2 border-b border-gray-100">
                    {item.name}
                  </div>
                  {item.dropdown.map((sub) => (
                    <Link key={sub.id} href={sub.path}>
                      <div className="p-2 hover:bg-gray-100 rounded-md text-sm cursor-pointer text-gray-600">
                        {sub.name}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full p-2 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors
            ${isCollapsed ? "justify-center" : ""}
          `}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  );
}
