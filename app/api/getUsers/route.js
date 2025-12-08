import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase_admin"; // Firebase Admin Auth

export async function GET() {
  try {
    const list = await adminAuth.listUsers();

    const users = list.users.map((u) => ({
      uid: u.uid,
      email: u.email,
      role: u.customClaims?.role || "User",
    }));

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
