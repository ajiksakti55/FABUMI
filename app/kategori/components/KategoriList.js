"use client";

import { useState } from "react";

export default function CategoryList({ kategori = [], onEdit = () => {}, onDeleted = () => {} }) {
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  // build parent -> children map
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
      if (!json.ok) throw new Error(json.error || "Failed to delete");
      onDeleted();
    } catch (err) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat delete");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      {error && <div className="text-red-600 mb-2">{error}</div>}

      {parents.length === 0 ? (
        <p className="text-gray-800">Belum ada kategori. Tambahkan kategori utama terlebih dahulu.</p>
      ) : (
        <div className="space-y-4 ">
          {parents.map((p) => (
            <div key={p.id} className="border rounded p-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-500">{p.type}</div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 border rounded text-sm"
                    onClick={() => onEdit(p)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 border rounded text-sm"
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                  >
                    {deletingId === p.id ? "Menghapus..." : "Hapus"}
                  </button>
                </div>
              </div>

              {/* children */}
              <div className="mt-3 pl-4">
                {childrenMap[p.id] ? (
                  <ul className="list-disc pl-4">
                    {childrenMap[p.id].map((c) => (
                      <li key={c.id} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{c.name}</span>
                          <span className="text-sm text-gray-500"> — {c.type}</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-2 py-1 border rounded text-sm" onClick={() => onEdit(c)}>
                            Edit
                          </button>
                          <button
                            className="px-2 py-1 border rounded text-sm"
                            onClick={() => handleDelete(c.id)}
                            disabled={deletingId === c.id}
                          >
                            {deletingId === c.id ? "Menghapus..." : "Hapus"}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-500">Belum ada subkategori</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
