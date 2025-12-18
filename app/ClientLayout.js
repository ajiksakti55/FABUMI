"use client";

import { useState } from "react";
import { AuthProvider, useAuth } from "./auth-context";
import Sidebar from "./components/Sidebar";
import { usePathname } from "next/navigation";

function LayoutContent({ children }) {
  const { currentUser, loading } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const publicRoutes = ["/login"];
  const isPublic = publicRoutes.includes(pathname);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-gray-300 text-lg">Loading . . .</div>
      </div>
    );
  }

  if (isPublic) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  if (!currentUser) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar onToggle={setIsCollapsed} />
      <main
        className={`flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300
          ${isCollapsed ? "md:ml-[66px]" : "md:ml-56"} md:pb-0 pb-14
        `}
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
