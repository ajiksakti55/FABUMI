import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase_admin";
import admin from "firebase-admin";
import { headers } from "next/headers";

export async function GET() {
  try {
    const h = await headers();
    const authHeader = h.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing authorization token" },
        { status: 401 }
      );
    }

    // Ambil JWT firebase dari Authorization header
    const token = authHeader.split(" ")[1];

    // VERIFIKASI TOKEN HARUS MENGGUNAKAN admin.auth()
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    // Ambil data user dari Firestore
    const userDoc = await adminDb.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const roleName = userData.role;

    if (!roleName) {
      return NextResponse.json(
        { error: "User has no role assigned" },
        { status: 400 }
      );
    }

    // Ambil data role
    const roleDoc = await adminDb.collection("roles").doc(roleName).get();

    if (!roleDoc.exists) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const roleData = roleDoc.data();

    return NextResponse.json({
      role: roleName,
      access: roleData.access || [],
    });
  } catch (err) {
    console.error("GetRole API Error:", err);
    return NextResponse.json({ error: "Failed to load role" }, { status: 500 });
  }
}
