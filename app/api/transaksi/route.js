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
    const batchSize = 500;

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

      if (snap.size < batchSize) break;
    }

    const data = allDocs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        ...d,
        date: d.date?.toDate ? d.date.toDate().toISOString() : d.date || null,
        createdAt: d.createdAt?.toDate
          ? d.createdAt.toDate().toISOString()
          : null,
      };
    });

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Failed to fetch transaksi" },
      { status: 500 }
    );
  }
}

/**
 * ✅ POST transaksi
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const newData = {
      ...body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection("transaksi").add(newData);

    return NextResponse.json({
      ok: true,
      id: docRef.id,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Failed to save transaksi" },
      { status: 500 }
    );
  }
}

/**
 * ✅ DELETE transaksi
 */
export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "ID wajib diisi" },
        { status: 400 }
      );
    }

    await adminDb.collection("transaksi").doc(id).delete();

    return NextResponse.json({
      ok: true,
      message: "Transaksi berhasil dihapus",
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Failed to delete transaksi" },
      { status: 500 }
    );
  }
}

/**
 * 🚀 PUT transaksi (FIX EDIT ERROR)
 */
export async function PUT(request) {
  try {
    const body = await request.json();

    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "ID wajib diisi" },
        { status: 400 }
      );
    }

    await adminDb.collection("transaksi").doc(id).update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      ok: true,
      message: "Transaksi berhasil diupdate",
    });
  } catch (err) {
    console.error("🔥 PUT error:", err);

    return NextResponse.json(
      { ok: false, error: "Failed to update transaksi" },
      { status: 500 }
    );
  }
}