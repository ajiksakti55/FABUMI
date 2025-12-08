"use client";

import { useEffect, useState } from "react";
import KategoriForm from "../kategori/components/KategoriForm";
import KategoriList from "../kategori/components/KategoriList";

export default function kategoriPage() {
  const [kategori, setkategori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/kategori", { cache: "no-store" });
      const json = await res.json();
      if (json.ok) {
        setkategori(json.data || []);
      } else {
        console.error(json.error);
      }
    } catch (err) {
      console.error("Failed to load kategori", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4 text-gray-800">Manage Kategori</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
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

        <div className="bg-white p-4 rounded shadow text-gray-800">
          <h2 className="font-medium mb-3">Daftar Kategori</h2>
          {loading ? (
            <p>Loading...</p>
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
