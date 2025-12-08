"use client";

import { AuthProvider } from "./auth-context";
import Sidebar from "./components/Sidebar";

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar fix di kiri */}
        <Sidebar />

        {/* Konten utama scrollable */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 ml-[72px] md:ml-64 transition-all duration-300">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
