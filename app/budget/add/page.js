"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddBudgetPage() {
  const router = useRouter();

  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [limit, setLimit] = useState("");
  const [month, setMonth] = useState("");
  const [continueNextMonth, setContinueNextMonth] = useState(false);

  const [kategoriList, setKategoriList] = useState([]);
  const [loadingKategori, setLoadingKategori] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadKategori();
  }, []);

  async function loadKategori() {
    try {
      const res = await fetch("/api/kategori");
      const json = await res.json();
      if (!json.ok) return;

      const list = json.data || [];

      // Buat map parent->children
      const map = {};
      list.forEach((item) => {
        if (item.parentId) {
          if (!map[item.parentId]) map[item.parentId] = [];
          map[item.parentId].push(item);
        }
      });

      // Ambil kategori induk dan urutkan alfabet
      const parents = list
        .filter((c) => !c.parentId)
        .sort((a, b) => a.name.localeCompare(b.name));

      const result = [];

      // Tambahkan induk dan sub di bawahnya
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

      setKategoriList(result);
    } catch (e) {
      console.error("Load kategori error:", e);
    } finally {
      setLoadingKategori(false);
    }
  }

  // Format angka limit jadi 200.000 saat diketik
  function formatNumberInput(value) {
    const numeric = value.replace(/\D/g, "");
    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function handleLimitChange(e) {
    const formatted = formatNumberInput(e.target.value);
    setLimit(formatted);
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);

    try {
      const numericLimit = Number(limit.replace(/\./g, "") || 0);

      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          categoryName,
          limit: numericLimit,
          month,
          continueNextMonth,
        }),
      });

      const json = await res.json();
      if (json.ok) router.push("/budget");
      else alert("Gagal menambah budget");
    } catch (err) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8 border border-gray-100 transition-all duration-500 hover:shadow-2xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
          <span>✨</span> Tambah Budget Baru
        </h1>

        <form onSubmit={submit} className="space-y-5 text-gray-800">
          {/* Kategori */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Kategori
            </label>

            {loadingKategori ? (
              <div className="text-gray-500 text-sm">
                Memuat daftar kategori...
              </div>
            ) : (
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 outline-none bg-white"
                value={categoryId}
                onChange={(e) => {
                  const found = kategoriList.find(
                    (x) => x.id === e.target.value
                  );
                  setCategoryId(e.target.value);
                  setCategoryName(found ? found.name : "");
                }}
                required
              >
                <option value="">-- Pilih Kategori --</option>
                {kategoriList.map((k) => (
                  <option
                    key={k.id}
                    value={k.id}
                    className={
                      k.isSub
                        ? "pl-6 text-gray-600"
                        : "font-semibold text-gray-800"
                    }
                  >
                    {k.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Limit */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Limit (Rp)
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 outline-none"
              type="text"
              placeholder="Contoh: 2.000.000"
              value={limit}
              onChange={handleLimitChange}
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
              placeholder="contoh : 2025-12"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
            />
          </div>

          {/* Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={continueNextMonth}
              onChange={(e) => setContinueNextMonth(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label className="text-sm text-gray-700">
              Gunakan juga untuk bulan depan
            </label>
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
              {saving ? "Menyimpan..." : "💾 Simpan Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
