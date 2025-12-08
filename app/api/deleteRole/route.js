import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase_admin";

export async function POST(req) {
  try {
    const { roleName } = await req.json();

    if (!roleName) {
      return NextResponse.json({ error: "Role name missing" }, { status: 400 });
    }

    // HAPUS dokumen Firestore
    await adminDb.collection("roles").doc(roleName).delete();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DeleteRole Error:", err);
    return NextResponse.json(
      { error: "Failed to delete role" },
      { status: 500 }
    );
  }
}
