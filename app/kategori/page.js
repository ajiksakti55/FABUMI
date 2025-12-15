"use client";

import { useEffect, useState } from "react";
import KategoriForm from "../kategori/components/KategoriForm";
import KategoriList from "../kategori/components/KategoriList";

export default function KategoriPage() {
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/kategori", { cache: "no-store" });
      const json = await res.json();
      if (json.ok) {
        setKategori(json.data || []);
      } else {
        console.error(json.error);
      }
    } catch (err) {
      console.error("Failed to load kategori:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6 text-gray-800">
      <h1 className="text-2xl font-semibold mb-6">🗂️ Kelola Kategori</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Form tambah/edit kategori */}
        <div className="bg-white/80 backdrop-blur-sm shadow-md rounded-xl p-5 flex-1 border border-gray-100">
          <KategoriForm
            kategori={kategori}
            onSaved={() => {
              setEditing(null);
              load();
            }}
            editing={editing}
            onCancel={() => setEditing(null)}
          />
        </div>

        {/* Daftar kategori */}
        <div className="bg-white/80 backdrop-blur-sm shadow-md rounded-xl p-5 flex-1 border border-gray-100">
          <h2 className="font-medium mb-3 text-lg">📋 Daftar Kategori</h2>
          {loading ? (
            <p className="text-gray-500 italic">Memuat data...</p>
          ) : (
            <KategoriList
              kategori={kategori}
              onEdit={(cat) => setEditing(cat)}
              onDeleted={() => load()}
            />
          )}
        </div>
      </div>
    </div>
  );
}
