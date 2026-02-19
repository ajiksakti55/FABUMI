import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase_admin";
import admin from "firebase-admin";

/**
 * ✅ GET transaksi — aman untuk data lama & baru
 * Support: month, type, limit
 */
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const month = url.searchParams.get("month");
    const type = url.searchParams.get("type");
    const limit = parseInt(url.searchParams.get("limit") || "200", 10);

    let query = adminDb.collection("transaksi");

    if (type) query = query.where("type", "==", type);
    if (month) query = query.where("month", "==", month);

    let snap;
    try {
      // 🔹 Coba ambil data berdasarkan date
      snap = await query.orderBy("date", "desc").limit(limit).get();
    } catch (err) {
      console.warn("⚠️ orderBy('date') gagal, fallback tanpa order:", err.message);
      // 🔹 Kalau gagal (karena field hilang / salah tipe), ambil tanpa order
      snap = await query.limit(limit).get();
    }

    // 🔹 Jika hasil kosong, ambil semua transaksi tanpa filter
    if (snap.empty) {
      console.warn("⚠️ Tidak ada hasil, fallback ambil semua transaksi tanpa filter");
      const allSnap = await adminDb.collection("transaksi").orderBy("createdAt", "desc").limit(limit).get();
      snap = allSnap;
    }

    const data = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        ...d,
        date: d.date?.toDate ? d.date.toDate().toISOString() : null,
        createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : null,
      };
    });

    console.log(`✅ GET /api/transaksi -> ${data.length} transaksi`);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("🔥 GET /api/transaksi fatal error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch transaksi" },
      { status: 500 }
    );
  }
}

/**
 * ✅ POST transaksi + AUTO UPDATE BUDGET
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, type, categoryId, categoryName, parentId, description, date } = body;

    if (amount == null || !type || !categoryId || !date) {
      return NextResponse.json(
        { ok: false, error: "amount, type, categoryId, and date are required" },
        { status: 400 }
      );
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ ok: false, error: "Invalid date format" }, { status: 400 });
    }

    const y = parsedDate.getUTCFullYear();
    const m = String(parsedDate.getUTCMonth() + 1).padStart(2, "0");
    const monthKey = `${y}-${m}`;

    const data = {
      amount: Number(amount),
      type,
      categoryId,
      categoryName: categoryName || null,
      parentId: parentId || null,
      description: description || "",
      date: admin.firestore.Timestamp.fromDate(parsedDate),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      month: monthKey,
    };

    const docRef = await adminDb.collection("transaksi").add(data);

    // 🔹 Auto-update budget bila expense
    if (type === "expense") {
      const budgetSnap = await adminDb
        .collection("budgets")
        .where("categoryId", "==", categoryId)
        .where("month", "==", monthKey)
        .limit(1)
        .get();

      if (!budgetSnap.empty) {
        const budgetDoc = budgetSnap.docs[0];
        const budget = budgetDoc.data();

        const transSnap = await adminDb
          .collection("transaksi")
          .where("categoryId", "==", categoryId)
          .where("type", "==", "expense")
          .where("month", "==", monthKey)
          .get();

        const totalUsed = transSnap.docs.reduce(
          (sum, d) => sum + (d.data().amount || 0),
          0
        );

        const remaining = Number(budget.limit || 0) - totalUsed;
        let status = "safe";
        if (remaining <= 0) status = "over";
        else if (remaining <= (budget.limit || 0) * 0.2) status = "warning";

        await budgetDoc.ref.update({
          used: totalUsed,
          remaining,
          status,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

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
 * ✅ PUT transaksi (update)
 */
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, amount, type, categoryId, categoryName, parentId, description, date } = body;

    if (!id || amount == null || !type || !categoryId || !date) {
      return NextResponse.json(
        { ok: false, error: "id, amount, type, categoryId, and date are required" },
        { status: 400 }
      );
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ ok: false, error: "Invalid date" }, { status: 400 });
    }

    const update = {
      amount: Number(amount),
      type,
      categoryId,
      categoryName: categoryName || null,
      parentId: parentId || null,
      description: description || "",
      date: admin.firestore.Timestamp.fromDate(parsedDate),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      month: `${parsedDate.getUTCFullYear()}-${String(parsedDate.getUTCMonth() + 1).padStart(2, "0")}`,
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
 * ✅ DELETE transaksi
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
