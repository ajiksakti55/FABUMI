import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase_admin";

export async function POST(req) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token tidak ditemukan" },
        { status: 400 }
      );
    }

    // Verifikasi ID token Firebase
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Ambil role dari custom claims (default = "user")
    const role = decodedToken.role || "user";

    return NextResponse.json({ role });
  } catch (error) {
    console.error("Error getRole API:", error);
    return NextResponse.json(
      { error: "Gagal memproses token" },
      { status: 500 }
    );
  }
}
