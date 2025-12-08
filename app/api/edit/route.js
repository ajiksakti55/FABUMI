import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase_admin";

export async function POST(req) {
  try {
    const { uid, email, displayName, role, newPassword } = await req.json();

    if (!uid) {
      return NextResponse.json(
        { error: "UID wajib dikirim." },
        { status: 400 }
      );
    }

    // 🟦 1. Update data user (email / displayName / password)
    const updateData = {};

    if (email) updateData.email = email;
    if (displayName) updateData.displayName = displayName;

    // Jika newPassword diisi → update password
    if (newPassword && newPassword.trim() !== "") {
      updateData.password = newPassword;
    }

    // Hanya panggil updateUser jika ada yg diupdate
    if (Object.keys(updateData).length > 0) {
      await adminAuth.updateUser(uid, updateData);
    }

    // 🟦 2. Update custom claims (role)
    if (role) {
      await adminAuth.setCustomUserClaims(uid, { role });
    }

    return NextResponse.json({
      success: true,
      message: "User berhasil diperbarui.",
    });
  } catch (err) {
    console.error("Edit User Error:", err.message);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
