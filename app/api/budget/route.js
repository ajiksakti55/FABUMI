import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase_admin";
import admin from "firebase-admin";

function getNextMonth(monthStr) {
  const [y, m] = monthStr.split("-").map(Number);
  const newM = m === 12 ? 1 : m + 1;
  const newY = m === 12 ? y + 1 : y;
  return `${newY}-${String(newM).padStart(2, "0")}`;
}

export async function GET() {
  try {
    const snap = await adminDb.collection("budgets").orderBy("month", "desc").get();
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ ok: true, data });
  } catch (e) {
    console.error("GET budget error:", e);
    return NextResponse.json({ ok: false, error: e.message });
  }
}

/**
 * POST: create budget and optionally auto-copy to next month per category
 * expected body: { categoryId, categoryName, limit, month, continueNextMonth }
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { categoryId, categoryName, limit, month } = body;
    const continueNext = !!body.continueNextMonth;

    if (!categoryId || !categoryName || !limit || !month) {
      return NextResponse.json({ ok: false, error: "categoryId, categoryName, limit, month required" }, { status: 400 });
    }

    // 1) add the budget for requested month
    const docRef = await adminDb.collection("budgets").add({
      categoryId,
      categoryName,
      limit: Number(limit || 0),
      used: 0,
      month,
      continueNextMonth: continueNext,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 2) if continueNextMonth true => ensure next month for this category exists (copy if missing)
    if (continueNext) {
      const nextMonth = getNextMonth(month);

      // check whether a budget for same category in nextMonth already exists
      const nextSnap = await adminDb
        .collection("budgets")
        .where("month", "==", nextMonth)
        .where("categoryId", "==", categoryId)
        .limit(1)
        .get();

      if (nextSnap.empty) {
        // create copy for nextMonth and set parentId -> current doc id
        await adminDb.collection("budgets").add({
          categoryId,
          categoryName,
          limit: Number(limit || 0),
          used: 0,
          month: nextMonth,
          continueNextMonth: continueNext,
          parentId: docRef.id,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST budget error:", e);
    return NextResponse.json({ ok: false, error: e.message });
  }
}
