import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase_admin";

export default async function middleware(req) {
  const pathname = req.nextUrl.pathname;
  const token = req.cookies.get("firebaseToken")?.value;

  // WAJIB LOGIN UNTUK SEMUA ROUTE YANG MASUK MATCHER
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    // Verifikasi token
    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    // Ambil role dari Firestore
    const userDoc = await adminDb.collection("users").doc(uid).get();
    const roleName = userDoc.data()?.role;

    if (!roleName) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Ambil akses role dari Firestore
    const roleDoc = await adminDb.collection("roles").doc(roleName).get();
    const access = roleDoc.data()?.access || [];

    const routeAccessMap = {
      "/budget": "budget",         
      "/settings/add-users": "add-users",
      "/settings/edit-users": "edit-users",
      "/settings/add-role": "add-role",
      "/settings/edit-role": "edit-role",
      "/dashboard": "dashboard",     
      "/transaksi": "transaksi",   
      "/kategori": "kategori",  
    };

    // Cari access yang terkait dengan path
    const requiredAccess = Object.entries(routeAccessMap).find(([path]) =>
      pathname.startsWith(path)
    )?.[1];

    if (requiredAccess && !access.includes(requiredAccess)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  } catch (err) {
    console.error("Middleware Error:", err);
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/transaksi/:path*", 
    "/kategori/:path*",   
    "/settings/:path*",
    "/budget/:path*",    
    "/dashboard/:path*",
  ],
};
