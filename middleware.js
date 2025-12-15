import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase_admin";

export const runtime = "nodejs"; // 🔥 Tambahkan ini di baris atas untuk paksa Node runtime

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("firebaseToken")?.value;

  // Belum login
  if (!token) {
    console.log("[Middleware] ❌ Tidak ada token, redirect ke /");
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    // Verifikasi token
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const userDoc = await adminDb.collection("users").doc(uid).get();
    const roleName = userDoc.data()?.role;

    if (!roleName) {
      console.log("[Middleware] ⚠️ Role user kosong, redirect ke /");
      return NextResponse.redirect(new URL("/", req.url));
    }

    const roleDoc = await adminDb.collection("roles").doc(roleName).get();
    const access = roleDoc.data()?.access || [];

    const routeAccessMap = {
      "/dashboard": "dashboard",
      "/transaksi": "transaksi",
      "/kategori": "kategori",
      "/budget": "budget",
      "/settings": "settings",
      "/settings/add-users": "add-users",
      "/settings/edit-users": "edit-users",
      "/settings/add-role": "add-role",
      "/settings/edit-role": "edit-role",
    };

    const requiredAccess = Object.entries(routeAccessMap).find(([path]) =>
      pathname.startsWith(path)
    )?.[1];

    if (requiredAccess && !access.includes(requiredAccess)) {
      console.log("[Middleware] 🚫 Akses ditolak ke:", pathname);
      return NextResponse.redirect(new URL("/", req.url));
    }

    console.log("[Middleware] ✅ Akses diizinkan:", pathname);
  } catch (err) {
    console.error("[Middleware] 💥 Error:", err);
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transaksi/:path*",
    "/kategori/:path*",
    "/budget/:path*",
    "/settings/:path*",
  ],
};
