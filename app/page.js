"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";

export default function HomePage() {
  const router = useRouter();
  const { currentUser, access, loadingUser, loadingAccess } = useAuth();

  useEffect(() => {
    // ⛔ Jangan redirect sebelum Auth selesai
    if (loadingUser || loadingAccess) return;

    // Jika belum login → arahkan ke login
    if (!currentUser) {
      router.replace("/login");
      return;
    }

    // Jika user tidak punya akses sama sekali → unauthorized
    if (!access || access.length === 0) {
      router.replace("/unauthorized");
      return;
    }

    // 🚀 Selalu redirect ke /home
    router.replace("/dashboard");
  }, [currentUser, access, loadingUser, loadingAccess, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Redirecting...
    </div>
  );
}
