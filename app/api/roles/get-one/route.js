import { adminDb } from "@/lib/firebase_admin";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const roleId = searchParams.get("roleId");

  const doc = await adminDb.collection("roles").doc(roleId).get();

  return Response.json(doc.data() || {});
}
