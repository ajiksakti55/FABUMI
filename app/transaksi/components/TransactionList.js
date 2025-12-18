"use client";

import { useState, useEffect, useRef } from "react";

export default function TransactionList({ transaksi = [], onEdit = () => {}, onDeleted = () => {} }) {
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [kategoriList, setKategoriList] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    loadKategori();
  }, []);

  async function loadKategori() {
    const res = await fetch("/api/kategori");
    const json = await res.json();
    if (json.ok) setKategoriList(json.data || []);
  }

  // Hitung posisi dropdown agar tidak menggeser layout
  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (isDropdownOpen) {
      updateDropdownPosition();
      window.addEventListener("scroll", updateDropdownPosition);
      window.addEventListener("resize", updateDropdownPosition);
    } else {
      window.removeEventListener("scroll", updateDropdownPosition);
      window.removeEventListener("resize", updateDropdownPosition);
    }
  }, [isDropdownOpen]);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Urut kategori induk > sub
  function getSortedCategories() {
    const map = {};
    kategoriList.forEach((c) => {
      if (c.parentId) {
        if (!map[c.parentId]) map[c.parentId] = [];
        map[c.parentId].push(c);
      }
    });

    const parents = kategoriList
      .filter((c) => !c.parentId)
      .sort((a, b) => a.name.localeCompare(b.name));

    const result = [];
    parents.forEach((p) => {
      result.push({ ...p, isSub: false });
      const subs = (map[p.id] || []).sort((a, b) => a.name.localeCompare(b.name));
      subs.forEach((s) => result.push({ ...s, isSub: true }));
    });
    return result;
  }

  const sortedKategori = getSortedCategories();

  // Toggle filter kategori
  const toggleFilter = (id) => {
    const kategori = kategoriList.find((k) => k.id === id);
    let newFilters = [...selectedFilters];

    if (!kategori) return;

    if (selectedFilters.includes(id)) {
      newFilters = newFilters.filter((x) => x !== id);
      const subs = kategoriList.filter((k) => k.parentId === id).map((k) => k.id);
      newFilters = newFilters.filter((x) => !subs.includes(x));
    } else {
      newFilters.push(id);
      const subs = kategoriList.filter((k) => k.parentId === id).map((k) => k.id);
      newFilters = [...new Set([...newFilters, ...subs])];
    }

    setSelectedFilters(newFilters);
    setCurrentPage(1);
  };

  // Filter transaksi
  const parseDate = (val) => {
    if (!val) return null;
    if (val._seconds) return new Date(val._seconds * 1000);
    if (val.toDate) return val.toDate();
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const filtered = transaksi.filter((t) => {
    const d = parseDate(t.date);
    if (!d) return false;
    if (startDate && d < new Date(startDate)) return false;
    if (endDate && d > new Date(endDate)) return false;
    if (selectedFilters.length > 0 && !selectedFilters.includes(t.categoryId)) return false;
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pageItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  async function handleDelete(id) {
    if (!confirm("Hapus transaksi ini?")) return;
    setDeletingId(id);
    setError("");
    try {
      const res = await fetch(`/api/transaksi?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Gagal hapus");
      onDeleted();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  // ========================
  // RENDER
  // ========================
  return (
    <div className="space-y-5 text-gray-800 relative">
      {error && (
        <div className="text-red-600 bg-red-50 p-2 rounded border border-red-200">
          {error}
        </div>
      )}

      {/* Filter tanggal */}
      <div className="bg-white/70 p-4 rounded-xl shadow-sm border border-gray-100 z-10">
        <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
          📅 Filter Transaksi
        </h3>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 w-full sm:w-auto">
            <label className="text-sm font-medium">Dari:</label>
            <input
              type="date"
              className="flex-1 sm:w-auto p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 w-full sm:w-auto">
            <label className="text-sm font-medium">Sampai:</label>
            <input
              type="date"
              className="flex-1 sm:w-auto p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filter kategori */}
      <div className="bg-white/70 p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
          📂 Filter Kategori
        </h3>

        <button
          ref={buttonRef}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full text-left px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 transition-all flex justify-between items-center text-sm"
        >
          <span className="text-gray-700 truncate">
            {selectedFilters.length > 0
              ? `${selectedFilters.length} kategori dipilih`
              : "Pilih kategori..."}
          </span>
          <span className="text-gray-500">{isDropdownOpen ? "▲" : "▼"}</span>
        </button>
      </div>

      {/* DROPDOWN FIXED */}
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="fixed bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto p-3 text-sm z-[9999]"
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
          }}
        >
          {sortedKategori.map((k) => (
            <label
              key={k.id}
              className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer hover:bg-blue-50 ${
                k.isSub ? "pl-6" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={selectedFilters.includes(k.id)}
                onChange={() => toggleFilter(k.id)}
              />
              <span className={k.isSub ? "text-gray-600" : "font-medium"}>
                {k.isSub ? ` ${k.name}` : k.name}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* === 💻 DESKTOP TABLE === */}
      {pageItems.length === 0 ? (
        <p className="text-center text-gray-500 italic text-sm sm:text-base py-3">
          Belum ada transaksi
        </p>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden sm:block overflow-x-auto bg-white/80 rounded-xl shadow border border-gray-100">
            <table className="min-w-full text-sm text-gray-700">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-700">
                  <th className="py-3 px-4 text-left">Tanggal</th>
                  <th className="py-3 px-4 text-left">Deskripsi</th>
                  <th className="py-3 px-4 text-left">Kategori</th>
                  <th className="py-3 px-4 text-left">Tipe</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((t) => {
                  const d = parseDate(t.date);
                  return (
                    <tr
                      key={t.id}
                      className={`border-t hover:bg-blue-50/50 transition-all ${
                        t.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      <td className="py-2 px-4 whitespace-nowrap">
                        {d ? d.toLocaleDateString("id-ID") : "-"}
                      </td>
                      <td className="py-2 px-4">{t.description || "-"}</td>
                      <td className="py-2 px-4">{t.categoryName || "-"}</td>
                      <td className="py-2 px-4 capitalize">{t.type}</td>
                      <td className="py-2 px-4 text-right whitespace-nowrap">
                        Rp {Number(t.amount).toLocaleString("id-ID")}
                      </td>
                      <td className="py-2 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => onEdit(t)}
                          className="px-3 py-1 rounded-md border text-sm hover:bg-gray-100"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={deletingId === t.id}
                          className="px-3 py-1 rounded-md border border-red-300 text-sm text-red-600 ml-2 hover:bg-red-50"
                        >
                          {deletingId === t.id ? "..." : "🗑️"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* === 📱 MOBILE CARD LIST === */}
          <div className="sm:hidden space-y-3">
            {pageItems.map((t) => {
              const d = parseDate(t.date);
              return (
                <div
                  key={t.id}
                  className="p-4 rounded-xl border border-gray-100 shadow-sm bg-white flex flex-col gap-1 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {d ? d.toLocaleDateString("id-ID") : "-"}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        t.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      Rp {Number(t.amount).toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="text-sm font-medium text-gray-700">
                    {t.description || "-"}
                  </div>

                  <div className="text-xs text-gray-500 flex justify-between items-center">
                    <span>{t.categoryName || "-"}</span>
                    <span
                      className={`capitalize ${
                        t.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {t.type}
                    </span>
                  </div>

                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => onEdit(t)}
                      className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={deletingId === t.id}
                      className="px-3 py-1 border border-red-300 rounded-md text-sm text-red-600 hover:bg-red-50"
                    >
                      {deletingId === t.id ? "..." : "🗑️"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 pt-3">
          <button
            className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50 text-sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ‹ Prev
          </button>
          <span className="text-sm text-gray-700">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50 text-sm"
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
