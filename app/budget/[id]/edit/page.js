"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditBudgetPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [limit, setLimit] = useState("");
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  async function loadData() {
    try {
      // Ambil data budget berdasarkan id
      const r = await fetch(`/api/budget/${id}`);
      const j = await r.json();
      if (!j.ok) {
        alert("Budget tidak ditemukan");
        router.push("/budget");
        return;
      }

      const budget = j.data;
      setCategoryId(budget.categoryId);
      setCategoryName(budget.categoryName);
      setLimit(budget.limit.toLocaleString("id-ID"));
      setMonth(budget.month);

      // Ambil daftar kategori
      const k = await fetch("/api/kategori");
      const kj = await k.json();
      if (kj.ok) setCategories(kj.data);

      setLoading(false);
    } catch (err) {
      console.error("Error loading:", err);
      alert("Gagal memuat data");
    }
  }

  // Format angka limit (misal 200000 → 200.000)
  function formatNumberInput(value) {
    const numeric = value.replace(/\D/g, "");
    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function handleLimitChange(e) {
    const formatted = formatNumberInput(e.target.value);
    setLimit(formatted);
  }

  // Buat urutan kategori induk → sub
  function getSortedCategories() {
    const map = {};
    categories.forEach((c) => {
      if (c.parentId) {
        if (!map[c.parentId]) map[c.parentId] = [];
        map[c.parentId].push(c);
      }
    });

    const parents = categories
      .filter((c) => !c.parentId)
      .sort((a, b) => a.name.localeCompare(b.name));

    const result = [];
    parents.forEach((parent) => {
      result.push({
        id: parent.id,
        label: parent.name,
        name: parent.name,
        isSub: false,
      });
      const subs = map[parent.id] || [];
      subs
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((sub) =>
          result.push({
            id: sub.id,
            label: `↳ ${sub.name}`,
            name: sub.name,
            isSub: true,
          })
        );
    });

    return result;
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);

    try {
      const numericLimit = Number(limit.replace(/\./g, "") || 0);

      const res = await fetch(`/api/budget/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          categoryName,
          limit: numericLimit,
          month,
        }),
      });

      const j = await res.json();
      if (!j.ok) {
        alert("Gagal update: " + j.error);
      } else {
        router.push("/budget");
      }
    } catch (err) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
        Memuat data...
      </div>
    );
  }

  const sortedCategories = getSortedCategories();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8 border border-gray-100 transition-all duration-500 hover:shadow-2xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
          ✏️ Edit Budget
        </h1>

        <form onSubmit={handleSave} className="space-y-5 text-gray-800">
          {/* Kategori */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Kategori
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 outline-none bg-white"
              value={categoryId}
              onChange={(e) => {
                const selected = sortedCategories.find(
                  (c) => c.id === e.target.value
                );
                if (selected) {
                  setCategoryId(selected.id);
                  setCategoryName(selected.name);
                }
              }}
              required
            >
              <option value="">-- Pilih Kategori --</option>
              {sortedCategories.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                  className={
                    c.isSub
                      ? "pl-6 text-gray-500 italic"
                      : "font-semibold text-gray-800"
                  }
                >
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Limit */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Limit (Rp)
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 outline-none"
              type="text"
              value={limit}
              onChange={handleLimitChange}
              placeholder="Contoh: 2.000.000"
              required
            />
          </div>

          {/* Bulan */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Bulan
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 outline-none"
              placeholder="contoh: 2025-12"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
            />
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={() => router.push("/budget")}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-300"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={saving}
              className={`px-5 py-2.5 rounded-lg text-white font-medium shadow-md transition-all duration-300 ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 hover:shadow-lg"
              }`}
            >
              {saving ? "Menyimpan..." : "💾 Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
