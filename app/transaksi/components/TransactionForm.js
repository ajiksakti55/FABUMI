// components/TransactionForm.jsx
"use client";

import { useEffect, useState } from "react";

export default function TransactionForm({
  editing = null,
  onSaved = () => {},
  onCancel = () => {},
}) {
  const [amount, setAmount] = useState("");
  const [rawAmount, setRawAmount] = useState(0); // angka murni
  const [type, setType] = useState("expense");
  const [kategoriList, setKategoriList] = useState([]);
  const [parentId, setParentId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =============================
  // FORMAT INPUT NOMINAL OTOMATIS
  // =============================
  const formatNumber = (num) => {
    if (!num) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleAmountChange = (val) => {
    // Ambil hanya angka
    const cleaned = val.replace(/\D/g, "");

    setRawAmount(Number(cleaned));
    setAmount(formatNumber(cleaned));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (editing) {
      const nominal = editing.amount ? Number(editing.amount) : 0;

      setRawAmount(nominal);
      setAmount(formatNumber(nominal));
      setType(editing.type || "expense");
      setCategoryId(editing.categoryId || "");
      setDescription(editing.description || "");

      setDate(
        editing.createdAt
          ? new Date(editing.createdAt).toISOString().slice(0, 10)
          : ""
      );
    } else {
      setAmount("");
      setRawAmount(0);
      setType("expense");
      setCategoryId("");
      setDescription("");
      setDate("");
    }
  }, [editing]);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/kategori", { cache: "no-store" });
      const json = await res.json();
      if (json.ok) setKategoriList(json.data || []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  }

  const parents = kategoriList.filter((c) => !c.parentId);
  const children = kategoriList.filter((c) => c.parentId === parentId);

  const categoryOptions = parentId ? children : kategoriList;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!rawAmount || rawAmount <= 0) {
      setError("Nominal harus lebih dari 0");
      return;
    }

    const finalCategoryId = categoryId || parentId;
    const selectedCat = kategoriList.find((c) => c.id === finalCategoryId);

    if (!selectedCat) {
      setError("Pilih kategori atau subkategori");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        amount: rawAmount,
        type,
        categoryId: selectedCat.id,
        categoryName: selectedCat.name,
        parentId: selectedCat.parentId || null,
        description,
        date: date || null,
      };

      let json;
      if (editing) {
        const res = await fetch("/api/transaksi", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editing.id }),
        });
        json = await res.json();
      } else {
        const res = await fetch("/api/transaksi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        json = await res.json();
      }

      if (!json.ok) throw new Error(json.error || "Gagal menyimpan");

      onSaved();

      // reset
      setAmount("");
      setRawAmount(0);
      setType("expense");
      setParentId("");
      setCategoryId("");
      setDescription("");
      setDate("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-gray-800">
      <h3 className="text-lg font-medium">
        {editing ? "Edit Transaksi" : "Tambah Transaksi"}
      </h3>

      {error && <div className="text-red-600">{error}</div>}

      {/* TANGGAL */}
      <div>
        <label className="block text-sm">Tanggal</label>
        <input
          type="date"
          className="w-full border rounded px-3 py-2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* NOMINAL */}
      <div>
        <label className="block text-sm">Nominal</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={amount}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder="0"
        />
      </div>

      {/* TIPE */}
      <div>
        <label className="block text-sm">Tipe</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="expense">Pengeluaran</option>
          <option value="income">Pemasukan</option>
        </select>
      </div>

      {/* PARENT */}
      
      {/* SUB KATEGORI */}
      <div>
        <label className="block text-sm">Pilih Kategori</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value || "")}
        >
          <option value="">-- Pilih subkategori atau kategori --</option>
          {categoryOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.parentId ? `↳ ${c.name}` : c.name} ({c.type})
            </option>
          ))}
        </select>
      </div>

      {/* CATATAN */}
      <div>
        <label className="block text-sm">Catatan</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Contoh: Bayar listrik"
        />
      </div>

      {/* ACTION */}
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white"
          disabled={saving}
        >
          {saving
            ? editing
              ? "Menyimpan..."
              : "Menyimpan..."
            : editing
            ? "Simpan Perubahan"
            : "Tambah Transaksi"}
        </button>

        {editing && (
          <button
            type="button"
            className="px-4 py-2 rounded border"
            onClick={onCancel}
            disabled={saving}
          >
            Batal
          </button>
        )}
      </div>
    </form>
  );
}
