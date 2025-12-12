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

      if (editing) {
        payload.id = editing.id;
        const res = await fetch("/api/kategori", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "Gagal update kategori");
      } else {
        const res = await fetch("/api/kategori", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "Gagal menambah kategori");
      }

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
      className="w-full max-w-md bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6 border border-gray-100 transition-all duration-300 hover:shadow-xl"
    >
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        {editing ? "✏️ Edit Kategori" : "➕ Tambah Kategori"}
      </h3>

      {error && (
        <div className="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Nama */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Nama Kategori
        </label>
        <input
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-gray-700"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masukkan kategori atau subkategori"
          required
        />
      </div>

      {/* Tipe */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Jenis Kategori
        </label>
        <select
          className="w-full p-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all bg-white text-gray-700"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="expense">💸 Pengeluaran</option>
          <option value="income">💰 Pemasukan</option>
        </select>
      </div>

      {/* Parent */}
      <div className="mb-4 text-gray-700">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Parent (opsional)
        </label>
        <select
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all bg-white"
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
      <div className="flex justify-between items-center">
        {editing && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-300"
          >
            Batal
          </button>
        )}

        <button
          type="submit"
          disabled={saving}
          className={`ml-auto px-5 py-2.5 rounded-lg text-white font-medium shadow-md transition-all duration-300 ${
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
