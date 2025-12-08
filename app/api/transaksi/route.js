import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase_admin";
import admin from "firebase-admin";

/**
 * GET: /api/transaksi
 */
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "100", 10);
    const month = url.searchParams.get("month");
    const type = url.searchParams.get("type");

    let query = adminDb.collection("transaksi").orderBy("createdAt", "desc");

    if (type === "income" || type === "expense") {
      query = query.where("type", "==", type);
    }

    if (month) {
      const [y, m] = month.split("-").map((v) => parseInt(v, 10));
      const start = new Date(Date.UTC(y, m - 1, 1));
      const end = new Date(Date.UTC(y, m, 1));

      query = query
        .where("createdAt", ">=", admin.firestore.Timestamp.fromDate(start))
        .where("createdAt", "<", admin.firestore.Timestamp.fromDate(end));
    }

    const snap = await query.limit(limit).get();

    const data = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        ...d,
        createdAt: d.createdAt?.toDate
          ? d.createdAt.toDate().toISOString() // ⬅ FIX UTAMA
          : null,
      };
    });

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("GET /api/transaksi error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch transaksi" },
      { status: 500 }
    );
  }
}


/**
 * POST: create transaksi
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      amount,
      type,
      categoryId,
      categoryName,
      parentId,
      description,
      date,
    } = body;

    if (!amount || !type || !categoryId || !date) {
      return NextResponse.json(
        { ok: false, error: "amount, type, categoryId, and date are required" },
        { status: 400 }
      );
    }

    const parsedDate = new Date(date); // date harus YYYY-MM-DD

    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { ok: false, error: "Invalid date format" },
        { status: 400 }
      );
    }

    const data = {
      amount: Number(amount),
      type,
      categoryId,
      categoryName: categoryName || null,
      parentId: parentId || null,
      description: description || "",
      date: admin.firestore.Timestamp.fromDate(parsedDate), // <-- tanggal transaksi
      createdAt: admin.firestore.FieldValue.serverTimestamp(), // waktu dibuat
    };

    const docRef = await adminDb.collection("transaksi").add(data);
    const newDoc = await docRef.get();

    return NextResponse.json(
      { ok: true, data: { id: newDoc.id, ...newDoc.data() } },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/transaksi error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to create transaksi" },
      { status: 500 }
    );
  }
}

/**
 * PUT: update transaksi
 */
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id,
      amount,
      type,
      categoryId,
      categoryName,
      parentId,
      description,
      date,
    } = body;

    if (!id || !amount || !type || !categoryId || !date) {
      return NextResponse.json(
        { ok: false, error: "id, amount, type, categoryId, and date are required" },
        { status: 400 }
      );
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { ok: false, error: "Invalid date format" },
        { status: 400 }
      );
    }

    const update = {
      amount: Number(amount),
      type,
      categoryId,
      categoryName: categoryName || null,
      parentId: parentId || null,
      description: description || "",
      date: admin.firestore.Timestamp.fromDate(parsedDate), // <-- update tanggal
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await adminDb.collection("transaksi").doc(id).update(update);
    const updated = await adminDb.collection("transaksi").doc(id).get();

    return NextResponse.json({
      ok: true,
      data: { id: updated.id, ...updated.data() },
    });
  } catch (err) {
    console.error("PUT /api/transaksi error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to update transaksi" },
      { status: 500 }
    );
  }
}

/**
 * DELETE
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "id is required" },
        { status: 400 }
      );
    }

    await adminDb.collection("transaksi").doc(id).delete();
    return NextResponse.json({ ok: true, message: "Deleted" });
  } catch (err) {
    console.error("DELETE /api/transaksi error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to delete transaksi" },
      { status: 500 }
    );
  }
}
