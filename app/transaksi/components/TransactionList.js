"use client";

import { useState, useEffect } from "react";

export default function TransactionList({
  transaksi = [],
  onEdit = () => {},
  onDeleted = () => {},
}) {
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const [kategoriList, setKategoriList] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);

  // FILTER TANGGAL
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // PAGINATION
  const ITEMS_PER_PAGE = 15;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadKategori();
  }, []);

  async function loadKategori() {
    const res = await fetch("/api/kategori");
    const json = await res.json();
    if (json.ok) setKategoriList(json.data || []);
  }

  const toggleFilter = (id) => {
    setSelectedFilters((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
    setCurrentPage(1); // RESET halaman setelah filter berubah
  };

  // Ambil semua anak kategori
  function getAllChildIds(parentId) {
    return kategoriList
      .filter((c) => c.parentId === parentId)
      .map((c) => c.id);
  }

  const expandedFilterIds = selectedFilters.flatMap((id) => {
    const childIds = getAllChildIds(id);
    return [id, ...childIds];
  });

  // PARSE DATE
  const parseDate = (val) => {
    if (!val) return null;

    if (val._seconds) return new Date(val._seconds * 1000);
    if (val.toDate) return val.toDate();

    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  // FILTERING
  const filteredTransaksi = transaksi.filter((t) => {
    // FILTER KATEGORI
    if (
      expandedFilterIds.length > 0 &&
      !expandedFilterIds.includes(t.categoryId)
    ) {
      return false;
    }

    // FILTER TANGGAL
    const d = parseDate(t.date);
    if (!d) return false;

    if (startDate && d < new Date(startDate)) return false;
    if (endDate && d > new Date(endDate)) return false;

    return true;
  });

  // ==============================
  // PAGINATION PROSES
  // ==============================
  const totalPages = Math.ceil(filteredTransaksi.length / ITEMS_PER_PAGE);

  const paginatedTransaksi = filteredTransaksi.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDelete = async (id) => {
    if (!confirm("Hapus transaksi ini?")) return;

    setDeletingId(id);
    setError("");

    try {
      const res = await fetch(`/api/transaksi?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!json.ok) throw new Error(json.error || "Failed to delete");

      onDeleted();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && <div className="text-red-600 mb-2">{error}</div>}

      {/* FILTER TANGGAL */}
      <div className="p-3 border rounded bg-gray-50">
        <p className="font-medium mb-2">Filter Tanggal:</p>

        <div className="flex flex-wrap gap-3">
          <div>
            <label className="text-sm">Dari:</label>
            <input
              type="date"
              className="border rounded px-2 py-1 ml-2"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div>
            <label className="text-sm">Sampai:</label>
            <input
              type="date"
              className="border rounded px-2 py-1 ml-2"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* FILTER KATEGORI */}
      <div className="p-3 border rounded bg-gray-50">
        <p className="font-medium mb-2">Filter Kategori:</p>

        <div className="flex flex-wrap gap-3">
          {kategoriList.map((k) => (
            <label key={k.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedFilters.includes(k.id)}
                onChange={() => toggleFilter(k.id)}
              />
              {k.parentId ? `↳ ${k.name}` : k.name}
            </label>
          ))}
        </div>
      </div>

      {/* TABLE */}
      {paginatedTransaksi.length === 0 ? (
        <p>Belum ada transaksi.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2">Tanggal</th>
                <th className="py-2">Deskripsi</th>
                <th className="py-2">Kategori</th>
                <th className="py-2">Tipe</th>
                <th className="py-2 text-right">Nominal</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {paginatedTransaksi.map((t) => {
                const d = parseDate(t.date);

                return (
                  <tr key={t.id} className="border-t">
                    <td className="py-2">
                      {d ? d.toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="py-2">{t.description || "-"}</td>
                    <td className="py-2">{t.categoryName || "-"}</td>
                    <td className="py-2 capitalize">{t.type}</td>
                    <td className="py-2 text-right">
                      {Number(t.amount).toLocaleString("id-ID")}
                    </td>

                    <td className="py-2">
                      <div className="flex gap-2">
                        <button
                          className="px-2 py-1 border rounded text-sm"
                          onClick={() => onEdit(t)}
                        >
                          Edit
                        </button>

                        <button
                          className="px-2 py-1 border rounded text-sm"
                          onClick={() => handleDelete(t.id)}
                          disabled={deletingId === t.id}
                        >
                          {deletingId === t.id ? "Menghapus..." : "Hapus"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION BUTTON */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ‹ Prev
          </button>

          <span className="text-sm">
            Halaman {currentPage} / {totalPages}
          </span>

          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
}
