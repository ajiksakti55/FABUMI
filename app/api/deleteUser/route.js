import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase_admin";

export async function POST(req) {
  try {
    const { uid } = await req.json();

    if (!uid) {
      return NextResponse.json(
        { error: "UID user wajib dikirim" },
        { status: 400 }
      );
    }

    // Hapus user dari Auth
    await adminAuth.deleteUser(uid);

    // Hapus firestore
    await adminDb.collection("users").doc(uid).delete();

    return NextResponse.json({
      success: true,
      message: "User berhasil dihapus",
    });
  } catch (err) {
    console.error("DeleteUser API Error:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
