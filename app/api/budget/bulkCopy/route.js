import { adminDb } from "@/lib/firebase_admin";

export async function POST(req) {
  try {
    const { fromMonth, toMonth } = await req.json();

    const snap = await adminDb
      .collection("budgets")
      .where("month", "==", fromMonth)
      .get();

    const batch = adminDb.batch();

    snap.forEach((doc) => {
      const data = doc.data();
      const ref = adminDb.collection("budgets").doc();

      batch.set(ref, {
        ...data,
        month: toMonth,
        createdAt: Date.now(),
      });
    });

    await batch.commit();

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: e.message });
  }
}
