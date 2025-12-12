"use client";

import { useEffect, useState } from "react";

export default function BudgetPage() {
  const [budgets, setBudgets] = useState([]);
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [viewMonth, setViewMonth] = useState(currentMonth);

  useEffect(() => {
    loadBudget();
    loadTransaksi();
  }, []);

  async function loadBudget() {
    try {
      const r = await fetch("/api/budget");
      const j = await r.json();
      if (j.ok) setBudgets(j.data);
    } catch (e) {
      console.error("Load budget error:", e);
    }
  }

  async function loadTransaksi() {
    try {
      const r = await fetch("/api/transaksi");
      const j = await r.json();
      if (j.ok) {
        const data = j.data.map((t) => {
          let d = t.date;
          if (typeof d === "object" && d._seconds) d = new Date(d._seconds * 1000);
          else if (d && typeof d.toDate === "function") d = d.toDate();
          else d = new Date(d);
          return { ...t, date: d };
        });
        setTransaksi(data);
      }
    } catch (e) {
      console.error("Load transaksi error:", e);
    }
  }

  async function handleDeleteBudget(id) {
    if (!confirm("Hapus budget ini?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/budget/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Gagal hapus");
      await loadBudget();
    } catch (e) {
      alert("Gagal hapus budget: " + (e.message || e));
    } finally {
      setLoading(false);
    }
  }

  function getPrevMonth(monthStr) {
    const [y, m] = monthStr.split("-").map(Number);
    let ny = y, nm = m - 1;
    if (nm === 0) { nm = 12; ny--; }
    return `${ny}-${String(nm).padStart(2, "0")}`;
  }

  function getNextMonth(monthStr) {
    const [y, m] = monthStr.split("-").map(Number);
    let ny = y, nm = m + 1;
    if (nm === 13) { nm = 1; ny++; }
    return `${ny}-${String(nm).padStart(2, "0")}`;
  }

  const displayedBudgets = budgets.filter((b) => b.month === viewMonth);
  const prevOneStep = getPrevMonth(currentMonth);
  const nextOneStep = getNextMonth(currentMonth);

  async function goPrevOneStep() {
    setViewMonth(prevOneStep);
  }
  async function goNextOneStep() {
    await loadBudget();
    setViewMonth(nextOneStep);
  }

  function formatMonth(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          💰 Budget Bulanan — <span className="text-blue-600">{viewMonth}</span>
        </h1>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={goPrevOneStep}
            disabled={viewMonth === prevOneStep}
            className={`px-4 py-2 rounded-lg font-medium shadow transition-all duration-300 ${
              viewMonth === prevOneStep
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-gray-700 to-gray-900 text-white hover:scale-105 hover:shadow-lg"
            }`}
          >
            ← Bulan Lalu
          </button>

          <button
            onClick={() => {
              setViewMonth(currentMonth);
              loadBudget();
            }}
            className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow hover:scale-105 transition-all duration-300 hover:shadow-lg"
          >
            Bulan Ini
          </button>

          <button
            onClick={goNextOneStep}
            disabled={viewMonth === nextOneStep}
            className={`px-4 py-2 rounded-lg font-medium shadow transition-all duration-300 ${
              viewMonth === nextOneStep
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-gray-700 to-gray-900 text-white hover:scale-105 hover:shadow-lg"
            }`}
          >
            Bulan Depan →
          </button>

          <a
            href={`/budget/add?month=${viewMonth}`}
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow hover:scale-105 hover:shadow-lg transition-all duration-300"
          >
            + Tambah Budget
          </a>
        </div>
      </div>

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedBudgets.length === 0 && (
          <div className="col-span-full text-gray-600 text-center py-12 bg-white rounded-xl shadow">
            Tidak ada data budget untuk bulan ini 📭
          </div>
        )}

        {displayedBudgets.map((b) => {
          const used = transaksi
            .filter((t) => t.type === "expense")
            .filter((t) => String(t.categoryId) === String(b.categoryId))
            .filter((t) => formatMonth(t.date) === viewMonth)
            .reduce((a, c) => a + Number(c.amount || 0), 0);

          const percent = b.limit ? Math.min((used / b.limit) * 100, 100) : 0;

          return (
            <div
              key={b.id}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group"
            >
              {/* Decorative gradient hover overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition duration-300 bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400"></div>

              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-lg text-gray-800">
                    {b.categoryName || b.category}
                  </h2>
                  <p className="text-sm text-gray-500">Bulan: {viewMonth}</p>
                </div>

                {viewMonth === currentMonth && (
                  <div className="flex flex-col items-end space-y-2">
                    <a
                      href={`/budget/${b.id}/edit`}
                      className="text-sm font-medium px-3 py-1 rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 transition-all duration-200 z-50"
                    >
                      Edit
                    </a>
                    <button
                      onClick={() => handleDeleteBudget(b.id)}
                      disabled={loading}
                      className="text-sm font-medium px-3 py-1 rounded-lg border border-red-400 text-red-500 hover:bg-red-50 transition-all duration-200 z-50"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="text-gray-700">
                    {used.toLocaleString("id-ID")} / {Number(b.limit).toLocaleString("id-ID")}
                  </span>
                  <span className={`font-semibold ${percent >= 100 ? "text-red-600" : "text-green-600"}`}>
                    {percent.toFixed(0)}%
                  </span>
                </div>

                <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-700 ${
                      percent >= 100
                        ? "bg-red-500"
                        : percent >= 80
                        ? "bg-orange-400"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {percent >= 100 && viewMonth === currentMonth && (
                <p className="text-red-600 text-sm mt-3 animate-pulse">
                  ⚠ Pengeluaran melebihi budget!
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
