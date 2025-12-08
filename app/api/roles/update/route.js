import { adminDb } from "@/lib/firebase_admin";

export async function POST(req) {
  const { roleId, access } = await req.json();

  await adminDb.collection("roles").doc(roleId).update({ access });

  return Response.json({ success: true });
}
