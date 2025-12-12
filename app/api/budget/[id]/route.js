import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase_admin";
import admin from "firebase-admin";

export async function GET(req, context) {
  try {
    const { id } = await context.params;
    const snap = await adminDb.collection("budgets").doc(id).get();
    if (!snap.exists) return NextResponse.json({ ok: false, error: "Budget tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ ok: true, data: { id: snap.id, ...snap.data() } });
  } catch (e) {
    console.error("GET budget detail error:", e);
    return NextResponse.json({ ok: false, error: e.message });
  }
}

export async function PUT(req, context) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    if (typeof body.categoryId === "undefined" ||
        typeof body.categoryName === "undefined" ||
        typeof body.limit === "undefined" ||
        typeof body.month === "undefined") {
      return NextResponse.json({ ok: false, error: "Data tidak lengkap" }, { status: 400 });
    }

    await adminDb.collection("budgets").doc(id).update({
      categoryId: body.categoryId,
      categoryName: body.categoryName,
      limit: Number(body.limit),
      month: body.month,
      continueNextMonth: !!body.continueNextMonth,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // (optional) we do NOT automatically propagate edits to copies here.
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PUT budget edit error:", e);
    return NextResponse.json({ ok: false, error: e.message });
  }
}

export async function DELETE(req, context) {
  try {
    const { id } = await context.params;

    // get the document first to check parentId
    const docSnap = await adminDb.collection("budgets").doc(id).get();
    if (!docSnap.exists) {
      return NextResponse.json({ ok: false, error: "Budget tidak ditemukan" }, { status: 404 });
    }
    const docData = docSnap.data();

    // if this is an original (no parentId), delete its copies (where parentId == id)
    if (!docData.parentId) {
      // delete copies in a batch
      const copiesSnap = await adminDb.collection("budgets").where("parentId", "==", id).get();
      const batch = adminDb.batch();
      copiesSnap.docs.forEach((d) => batch.delete(d.ref));
      // delete original
      batch.delete(adminDb.collection("budgets").doc(id));
      await batch.commit();
    } else {
      // it's a copy -> just delete it
      await adminDb.collection("budgets").doc(id).delete();
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE budget error:", e);
    return NextResponse.json({ ok: false, error: e.message });
  }
}
