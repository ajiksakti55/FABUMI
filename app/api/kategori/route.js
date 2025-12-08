// app/api/kategori/route.js
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase_admin";
import admin from "firebase-admin";

export async function GET() {
  try {
    const snapshot = await adminDb.collection("kategori")
      .orderBy("createdAt", "desc")
      .get();

    const kategori = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ ok: true, data: kategori });
  } catch (err) {
    console.error("GET /api/kategori error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch kategori" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, type, parentId } = body;

    if (!name || !type) {
      return NextResponse.json(
        { ok: false, error: "name and type are required" },
        { status: 400 }
      );
    }

    const data = {
      name: name.trim(),
      type: type === "income" ? "income" : "expense",
      parentId: parentId || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection("kategori").add(data);
    const newDoc = await docRef.get();

    return NextResponse.json(
      { ok: true, data: { id: newDoc.id, ...newDoc.data() } },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/kategori error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, type, parentId } = body;

    if (!id || !name || !type) {
      return NextResponse.json(
        { ok: false, error: "id, name and type are required" },
        { status: 400 }
      );
    }

    if (parentId && parentId === id) {
      return NextResponse.json(
        { ok: false, error: "parentId cannot be same as id" },
        { status: 400 }
      );
    }

    const update = {
      name: name.trim(),
      type: type === "income" ? "income" : "expense",
      parentId: parentId || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await adminDb.collection("kategori").doc(id).update(update);
    const updated = await adminDb.collection("kategori").doc(id).get();

    return NextResponse.json({
      ok: true,
      data: { id: updated.id, ...updated.data() },
    });
  } catch (err) {
    console.error("PUT /api/kategori error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to update category" },
      { status: 500 }
    );
  }
}

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

    const q = await adminDb
      .collection("kategori")
      .where("parentId", "==", id)
      .limit(1)
      .get();

    if (!q.empty) {
      return NextResponse.json(
        {
          ok: false,
          error: "Category has subkategori; delete them first or reassign.",
        },
        { status: 400 }
      );
    }

    await adminDb.collection("kategori").doc(id).delete();

    return NextResponse.json({ ok: true, message: "Deleted" });
  } catch (err) {
    console.error("DELETE /api/kategori error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to delete" },
      { status: 500 }
    );
  }
}
