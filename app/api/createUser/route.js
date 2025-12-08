import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase_admin";

export async function POST(req) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, dan role wajib diisi." },
        { status: 400 }
      );
    }

    // ⛔ Validasi apakah role tersedia di Firestore
    const roleDoc = await adminDb.collection("roles").doc(role).get();
    if (!roleDoc.exists) {
      return NextResponse.json(
        { error: `Role '${role}' tidak terdaftar.` },
        { status: 400 }
      );
    }

    // 🔥 Buat user baru
    const user = await adminAuth.createUser({
      email,
      password,
    });

    // 🔥 Pasang custom claims agar role dikenali auth
    await adminAuth.setCustomUserClaims(user.uid, { role });

    // 🔥 Simpan ke Firestore users
    await adminDb.collection("users").doc(user.uid).set({
      uid: user.uid,
      email,
      role,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "User berhasil dibuat",
      user: { uid: user.uid, email, role },
    });
  } catch (err) {
    console.error("CreateUser API Error:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
