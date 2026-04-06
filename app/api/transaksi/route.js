import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase_admin";
import admin from "firebase-admin";

/**
 * ✅ GET transaksi — FIX: ambil semua data tanpa kena limit
 */
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const month = url.searchParams.get("month");
    const type = url.searchParams.get("type");

    let query = adminDb.collection("transaksi");

    if (type) query = query.where("type", "==", type);
    if (month) query = query.where("month", "==", month);

    let allDocs = [];
    let lastDoc = null;
    const batchSize = 500; // 🔥 ambil per batch (aman dari limit Firestore)

    while (true) {
      let q = query;

      try {
        q = q.orderBy("date", "desc");
      } catch (err) {
        console.warn("⚠️ orderBy date gagal, pakai createdAt");
        q = q.orderBy("createdAt", "desc");
      }

      if (lastDoc) {
        q = q.startAfter(lastDoc);
      }

      const snap = await q.limit(batchSize).get();

      if (snap.empty) break;

      allDocs = [...allDocs, ...snap.docs];

      lastDoc = snap.docs[snap.docs.length - 1];

      // 🔥 stop kalau sudah tidak ada data lagi
      if (snap.size < batchSize) break;
    }

    const data = allDocs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        ...d,
        date: d.date?.toDate ? d.date.toDate().toISOString() : d.date || null,
        createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : null,
      };
    });

    console.log(`✅ GET /api/transaksi -> ${data.length} transaksi (FULL DATA)`);

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("🔥 GET /api/transaksi fatal error:", err);

    return NextResponse.json(
      { ok: false, error: "Failed to fetch transaksi" },
      { status: 500 }
    );
  }
}