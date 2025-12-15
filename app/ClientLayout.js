"use client";

import { useState } from "react";
import { AuthProvider, useAuth } from "./auth-context";
import Sidebar from "./components/Sidebar";
import { usePathname } from "next/navigation";

function LayoutContent({ children }) {
  const { currentUser, loading } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Halaman yang TIDAK pakai sidebar + TIDAK butuh login
  const publicRoutes = ["/login"];

  const isPublic = publicRoutes.includes(pathname);

  // Saat loading auth
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-gray-300 text-lg">Loading . . .</div>
      </div>
    );
  }

  // ======== Halaman PUBLIC ========
  if (isPublic) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  // ======== Halaman PRIVATE (harus login) ========
  if (!currentUser) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  // ======== Layout dengan SIDEBAR ========
  return (
    <div className="flex h-screen">
      <Sidebar onToggle={setIsCollapsed} />
      <main
        className={`flex-1 overflow-y-auto overflow-x-hidden bg-white transition-all duration-300 ${
          isCollapsed
            ? "ml-[50px] pl-0 duration-700"
            : "ml-0 pl-60 duration-700"
        }`}
      >
        {children}
      </main>
    </div>
  );
}

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <LayoutContent>{children}</LayoutContent>
    </AuthProvider>
  );
}
