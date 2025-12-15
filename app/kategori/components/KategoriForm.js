"use client";

import { useEffect, useState } from "react";

export default function KategoriForm({
  kategori = [],
  onSaved = () => {},
  editing = null,
  onCancel = () => {},
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [parentId, setParentId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (editing) {
      setName(editing.name || "");
      setType(editing.type || "expense");
      setParentId(editing.parentId || null);
    } else {
      setName("");
      setType("expense");
      setParentId(null);
    }
    setError(null);
  }, [editing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Nama kategori wajib diisi");
      return;
    }

    setSaving(true);
    try {
      const payload = { name: name.trim(), type, parentId };

      const method = editing ? "PUT" : "POST";
      const body = editing ? { ...payload, id: editing.id } : payload;

      const res = await fetch("/api/kategori", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Gagal menyimpan kategori");

      onSaved();
      setName("");
      setType("expense");
      setParentId(null);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const parentOptions = kategori.filter((c) => !c.parentId);

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-md shadow-lg rounded-2xl p-4 sm:p-6 border border-gray-100 transition-all hover:shadow-xl text-gray-800"
    >
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 text-center">
        {editing ? "✏️ Edit Kategori" : "➕ Tambah Kategori"}
      </h3>

      {error && (
        <div className="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Nama */}
      <div className="mb-3">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Nama Kategori
        </label>
        <input
          className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition-all text-sm sm:text-base"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masukkan kategori atau subkategori"
          required
        />
      </div>

      {/* Tipe */}
      <div className="mb-3">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Jenis Kategori
        </label>
        <select
          className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-white text-sm sm:text-base"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="expense">💸 Pengeluaran</option>
          <option value="income">💰 Pemasukan</option>
        </select>
      </div>

      {/* Parent */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Parent (opsional)
        </label>
        <select
          className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-white text-sm sm:text-base"
          value={parentId || ""}
          onChange={(e) => setParentId(e.target.value || null)}
        >
          <option value="">(Kategori Utama)</option>
          {parentOptions.map(
            (p) =>
              (!editing || p.id !== editing.id) && (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              )
          )}
        </select>
      </div>

      {/* Tombol */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mt-5">
        {editing && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="w-full sm:w-auto px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-300 text-sm sm:text-base"
          >
            Batal
          </button>
        )}

        <button
          type="submit"
          disabled={saving}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-lg text-white font-medium shadow-md transition-all duration-300 text-sm sm:text-base ${
            saving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 hover:shadow-lg"
          }`}
        >
          {saving
            ? "Menyimpan..."
            : editing
            ? "💾 Simpan Perubahan"
            : "💡 Tambah Kategori"}
        </button>
      </div>
    </form>
  );
}
