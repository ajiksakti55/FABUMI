import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase_admin";

export async function POST(req) {
  try {
    const { roleName, allowedMenus } = await req.json();

    if (!roleName) {
      return NextResponse.json(
        { error: "Role name is required" },
        { status: 400 }
      );
    }

    await adminDb
      .collection("roles")
      .doc(roleName)
      .set({
        name: roleName,
        access: allowedMenus || [],
        createdAt: new Date(),
      });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("CreateRole Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
