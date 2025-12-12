"use client";

import { useEffect, useState } from "react";

export default function TransactionForm({
  editing = null,
  onSaved = () => {},
  onCancel = () => {},
}) {
  const [amount, setAmount] = useState("");
  const [rawAmount, setRawAmount] = useState(0);
  const [type, setType] = useState("expense");
  const [kategoriList, setKategoriList] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Format angka ke format "200.000"
  const formatNumber = (num) =>
    num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";

  const handleAmountChange = (val) => {
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

  const sortedCategories = (() => {
    const map = {};
    kategoriList.forEach((c) => {
      if (c.parentId) {
        if (!map[c.parentId]) map[c.parentId] = [];
        map[c.parentId].push(c);
      }
    });

    const parents = kategoriList.filter((c) => !c.parentId);
    const result = [];
    parents.forEach((p) => {
      result.push({ ...p, isSub: false });
      const subs = map[p.id] || [];
      subs.forEach((s) => result.push({ ...s, isSub: true }));
    });
    return result;
  })();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!rawAmount || rawAmount <= 0) return setError("Nominal harus lebih dari 0");

    const selectedCat = kategoriList.find((c) => c.id === categoryId);
    if (!selectedCat) return setError("Pilih kategori atau subkategori");

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

      const res = await fetch("/api/transaksi", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { ...payload, id: editing.id } : payload),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Gagal menyimpan");

      onSaved();
      setAmount("");
      setRawAmount(0);
      setType("expense");
      setCategoryId("");
      setDescription("");
      setDate("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto w-full bg-white/80 backdrop-blur-md shadow-lg rounded-2xl p-6 border border-gray-100 transition-all hover:shadow-xl text-gray-800"
    >
      <h3 className="text-2xl font-bold text-gray-800 mb-5 text-center flex justify-center items-center gap-2">
        {editing ? "✏️ Edit Transaksi" : "💰 Tambah Transaksi"}
      </h3>

      {error && (
        <div className="text-red-600 bg-red-50 p-2 rounded-lg mb-3 text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Tanggal */}
      <div>
        <label className="block text-sm font-semibold mb-1">📅 Tanggal</label>
        <input
          type="date"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition-all"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      {/* Nominal */}
      <div>
        <label className="block text-sm font-semibold mb-1 mt-3">💸 Nominal</label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-500">Rp</span>
          <input
            type="text"
            className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition-all"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      {/* Tipe */}
      <div className="mt-3">
        <label className="block text-sm font-semibold mb-1">Jenis Transaksi</label>
        <select
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition-all bg-white"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="expense">Pengeluaran 💵</option>
          <option value="income">Pemasukan 💰</option>
        </select>
      </div>

      {/* Kategori */}
      <div className="mt-3">
        <label className="block text-sm font-semibold mb-1">Kategori</label>
        <select
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition-all bg-white"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="">-- Pilih kategori --</option>
          {sortedCategories.map((c) => (
            <option
              key={c.id}
              value={c.id}
              className={c.isSub ? "pl-6 text-gray-500 italic" : "font-semibold"}
            >
              {c.isSub ? `↳ ${c.name}` : c.name} ({c.type})
            </option>
          ))}
        </select>
      </div>

      {/* Catatan */}
      <div className="mt-3">
        <label className="block text-sm font-semibold mb-1">📝 Catatan</label>
        <input
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition-all"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Contoh: Bayar listrik, beli kopi..."
        />
      </div>

      {/* Tombol */}
      <div className="flex justify-between items-center mt-5">
        {editing && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-300"
          >
            Batal
          </button>
        )}

        <button
          type="submit"
          disabled={saving}
          className={`px-5 py-2.5 rounded-lg text-white font-medium shadow-md transition-all duration-300 ${
            saving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 hover:shadow-lg"
          }`}
        >
          {saving
            ? "Menyimpan..."
            : editing
            ? "💾 Simpan Perubahan"
            : "💡 Tambah Transaksi"}
        </button>
      </div>
    </form>
  );
}
