import { adminDb } from "@/lib/firebase_admin";

export async function GET() {
  const snapshot = await adminDb.collection("roles").get();

  const roles = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return Response.json({ roles });
}
