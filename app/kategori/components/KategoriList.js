"use client";

import { useState } from "react";

export default function CategoryList({ kategori = [], onEdit = () => {}, onDeleted = () => {} }) {
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  const parents = kategori.filter((c) => !c.parentId);
  const childrenMap = {};
  kategori.forEach((c) => {
    if (c.parentId) {
      childrenMap[c.parentId] = childrenMap[c.parentId] || [];
      childrenMap[c.parentId].push(c);
    }
  });

  async function handleDelete(id) {
    const ok = confirm("Hapus kategori ini? Jika masih ada subkategori, hapus subkategori dahulu.");
    if (!ok) return;
    setError(null);
    setDeletingId(id);
    try {
      const res = await fetch(`/api/kategori?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Gagal menghapus kategori");
      onDeleted();
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat menghapus");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      {error && (
        <div className="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {parents.length === 0 ? (
        <div className="text-gray-600 text-center bg-white/70 p-6 rounded-xl shadow-sm border border-gray-100">
          Belum ada kategori. Tambahkan kategori utama terlebih dahulu.
        </div>
      ) : (
        <div className="space-y-4">
          {parents.map((p) => (
            <div
              key={p.id}
              className="bg-white/70 backdrop-blur-md border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4"
            >
              {/* Kategori Induk */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-gray-800">{p.name}</div>
                  <div className="text-sm text-gray-500 capitalize">
                    {p.type === "income" ? "💰 Pemasukan" : "💸 Pengeluaran"}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(p)}
                    className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700 transition-all duration-200"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    className="px-3 py-1.5 text-sm rounded-md border border-red-300 hover:bg-red-50 text-red-600 transition-all duration-200"
                  >
                    {deletingId === p.id ? "⏳ Menghapus..." : "🗑️ Hapus"}
                  </button>
                </div>
              </div>

              {/* Subkategori */}
              <div className="mt-3 pl-4 border-l-2 border-gray-200">
                {childrenMap[p.id] ? (
                  <ul className="space-y-1">
                    {childrenMap[p.id].map((c) => (
                      <li
                        key={c.id}
                        className="flex justify-between items-center text-sm bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100 transition-all duration-200"
                      >
                        <div>
                          <span className="font-medium text-gray-800">{c.name}</span>
                          <span className="text-gray-500 ml-2">
                            {c.type === "income" ? "(Pemasukan)" : "(Pengeluaran)"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="px-2 py-1 border rounded-md text-gray-600 hover:bg-gray-200 text-xs"
                            onClick={() => onEdit(c)}
                          >
                            ✏️
                          </button>
                          <button
                            className="px-2 py-1 border border-red-300 rounded-md text-red-600 hover:bg-red-50 text-xs"
                            onClick={() => handleDelete(c.id)}
                            disabled={deletingId === c.id}
                          >
                            {deletingId === c.id ? "..." : "🗑️"}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-gray-500 italic">
                    Belum ada subkategori
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
