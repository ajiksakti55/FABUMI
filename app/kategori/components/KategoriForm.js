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
    setError("");
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Nama kategori wajib diisi");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch("/api/kategori", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editing.id,
            name: name.trim(),
            type,
            parentId,
          }),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "Failed to update");
      } else {
        const res = await fetch("/api/kategori", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), type, parentId }),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "Failed to create");
      }
      onSaved();
      setName("");
      setParentId(null);
      setType("expense");
    } catch (err) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  // parent options = top-level kategori (parentId == null)
  const parentOptions = kategori.filter((c) => !c.parentId);

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-gray-800">
      <h3 className="text-lg font-medium">
        {editing ? "Edit Kategori" : "Tambah Kategori"}
      </h3>

      {error && <div className="text-red-600">{error}</div>}

      <div>
        <label className="block text-sm">Nama</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masukan kategori/sub kategori"
        />
      </div>

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

      <div>
        <label className="block text-sm">Parent (opsional)</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={parentId || ""}
          onChange={(e) => setParentId(e.target.value || null)}
        >
          <option value="">(kategori utama)</option>
          {parentOptions.map((p) =>
            // exclude if editing same id
            editing && p.id === editing.id ? null : (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            )
          )}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white"
          disabled={saving}
        >
          {saving
            ? "Menyimpan..."
            : editing
            ? "Simpan Perubahan"
            : "Tambah Kategori"}
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
