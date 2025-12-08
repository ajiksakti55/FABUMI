import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase_admin";

export async function GET() {
  try {
    const snapshot = await adminDb.collection("roles").get();

    const roles = [];
    snapshot.forEach((doc) => {
      roles.push(doc.id);
    });

    return NextResponse.json({ roles });
  } catch (err) {
    console.error("GetRoles Error:", err);
    return NextResponse.json(
      { error: "Failed to load roles" },
      { status: 500 }
    );
  }
}
