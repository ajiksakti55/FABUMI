"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

export default function TransactionForm({
  editing = null,
  onSaved = () => {},
  onCancel = () => {},
}) {
  const [amount, setAmount] = useState("");
  const [rawAmount, setRawAmount] = useState(0);
  const [type, setType] = useState("expense");
  const [kategoriList, setKategoriList] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Dropdown state
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedParent, setExpandedParent] = useState(null);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  // ===== Format angka =====
  const formatNumber = (num) =>
    num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";

  const handleAmountChange = (val) => {
    const cleaned = val.replace(/\D/g, "");
    setRawAmount(Number(cleaned));
    setAmount(formatNumber(cleaned));
  };

  // ===== Fetch kategori =====
  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/kategori", { cache: "no-store" });
      const json = await res.json();
      if (json.ok) setKategoriList(json.data || []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  }

  // ===== Tutup dropdown kalau klik di luar =====
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ===== Hitung posisi dropdown =====
  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener("scroll", updateDropdownPosition);
      window.addEventListener("resize", updateDropdownPosition);
    }
    return () => {
      window.removeEventListener("scroll", updateDropdownPosition);
      window.removeEventListener("resize", updateDropdownPosition);
    };
  }, [isOpen]);

  // ===== Struktur kategori =====
  const filteredCategories = kategoriList.filter((c) => c.type === type);
  const parents = filteredCategories.filter((c) => !c.parentId);
  const childrenMap = {};
  filteredCategories.forEach((c) => {
    if (c.parentId) {
      if (!childrenMap[c.parentId]) childrenMap[c.parentId] = [];
      childrenMap[c.parentId].push(c);
    }
  });

  // ===== Search logic (parent & subkategori) =====
  const searchLower = search.toLowerCase();
  const matchedParents = [];
  const matchedChildrenMap = {};

  parents.forEach((p) => {
    const parentMatch = p.name.toLowerCase().includes(searchLower);
    const matchedChildren = (childrenMap[p.id] || []).filter((sub) =>
      sub.name.toLowerCase().includes(searchLower)
    );

    // tampilkan parent kalau dia cocok, atau ada child yang cocok, atau tidak sedang search
    if (parentMatch || matchedChildren.length > 0 || search === "") {
      matchedParents.push(p);
      matchedChildrenMap[p.id] =
        matchedChildren.length > 0 ? matchedChildren : childrenMap[p.id];
    }
  });

  // ===== Submit =====
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!rawAmount || rawAmount <= 0)
      return setError("Nominal harus lebih dari 0");

    const selectedCat = kategoriList.find((c) => c.id === categoryId);
    if (!selectedCat) return setError("Pilih kategori atau subkategori");

    setSaving(true);
    try {
      const payload = {
        amount: rawAmount,
        type,
        categoryId: selectedCat.id,
        categoryName: selectedCat.name,
        parentId: selectedCat.parentId || null,
        description,
        date: date || null,
      };

      const res = await fetch("/api/transaksi", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editing ? { ...payload, id: editing.id } : payload
        ),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Gagal menyimpan");

      onSaved();
      setAmount("");
      setRawAmount(0);
      setType("expense");
      setCategoryId("");
      setDescription("");
      setDate("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ===== Dropdown Portal =====
  const dropdownElement =
    isOpen &&
    createPortal(
      <div
        ref={dropdownRef}
        className="absolute bg-white border border-gray-200 rounded-xl shadow-2xl max-h-72 overflow-y-auto z-[999999] text-gray-800"
        style={{
          position: "absolute",
          top: dropdownPos.top,
          left: dropdownPos.left,
          width: dropdownPos.width,
        }}
      >
        {/* Sticky search bar */}
        <div className="sticky top-0 bg-white z-[1000000]">
          <input
            type="text"
            placeholder="Cari kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-75 p-2 my-3 mx-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        {/* Daftar hasil */}
        {matchedParents.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-2">
            Tidak ada hasil
          </p>
        ) : (
          matchedParents.map((p) => (
            <div key={p.id} className="mb-2">
              <div
                className={`flex justify-between items-center px-3 py-2 rounded-md cursor-pointer hover:bg-blue-50 ${
                  expandedParent === p.id ? "bg-blue-50" : ""
                }`}
                onClick={() =>
                  setExpandedParent(expandedParent === p.id ? null : p.id)
                }
              >
                <span className="font-semibold">{p.name}</span>
                {matchedChildrenMap[p.id] && (
                  <span className="text-gray-400 text-sm">
                    {expandedParent === p.id ? "▲" : "▼"}
                  </span>
                )}
              </div>

              {/* Subkategori */}
              {(expandedParent === p.id || search !== "") &&
                (matchedChildrenMap[p.id] || []).map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => {
                      setCategoryId(sub.id);
                      setIsOpen(false);
                      setExpandedParent(null);
                      setSearch("");
                    }}
                    className={`ml-5 px-3 py-2 rounded-md cursor-pointer text-sm hover:bg-blue-50 ${
                      sub.id === categoryId
                        ? "bg-blue-100 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {sub.name}
                  </div>
                ))}
            </div>
          ))
        )}
      </div>,
      document.body
    );

  // ===== Render utama =====
  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="relative max-w-3xl mx-auto w-full bg-white/80 backdrop-blur-md shadow-lg rounded-2xl p-4 sm:p-6 border border-gray-100 transition-all hover:shadow-xl text-gray-800 overflow-visible"
      >
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-5 text-center flex justify-center items-center gap-2">
          {editing ? "✏️ Edit Transaksi" : "💰 Tambah Transaksi"}
        </h3>

        {error && (
          <div className="text-red-600 bg-red-50 p-2 rounded-lg mb-3 text-sm border border-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tanggal */}
          <div>
            <label className="block text-sm font-semibold mb-1">📅 Tanggal</label>
            <input
              type="date"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm sm:text-base"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Nominal */}
          <div>
            <label className="block text-sm font-semibold mb-1">💸 Nominal</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500 text-sm">Rp</span>
              <input
                type="text"
                className="w-full pl-9 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition-all text-sm sm:text-base"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Jenis Transaksi */}
          <div>
            <label className="block text-sm font-semibold mb-1">Jenis Transaksi</label>
            <select
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-white text-sm sm:text-base"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setCategoryId("");
              }}
            >
              <option value="expense">Pengeluaran 💵</option>
              <option value="income">Pemasukan 💰</option>
            </select>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-semibold mb-1">Kategori</label>
            <button
              ref={buttonRef}
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full p-3 border rounded-lg bg-white text-left flex justify-between items-center text-sm sm:text-base hover:bg-gray-50"
            >
              <span>
                {categoryId
                  ? kategoriList.find((c) => c.id === categoryId)?.name
                  : `Pilih kategori ${
                      type === "income" ? "pemasukan" : "pengeluaran"
                    }`}
              </span>
              <span className="text-gray-500">{isOpen ? "▲" : "▼"}</span>
            </button>
          </div>
        </div>

        {/* Catatan */}
        <div className="mt-4">
          <label className="block text-sm font-semibold mb-1">📝 Catatan</label>
          <input
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition-all text-sm sm:text-base"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Bayar listrik, beli kopi..."
          />
        </div>

        {/* Tombol */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-6 gap-3">
          {editing && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-300 text-sm sm:text-base"
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
              : "💡 Tambah Transaksi"}
          </button>
        </div>
      </form>

      {dropdownElement}
    </>
  );
}
