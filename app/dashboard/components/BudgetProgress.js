"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, AlertTriangle, Wallet } from "lucide-react";

export default function BudgetProgress({ transaksi }) {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBudgets();
  }, []);

  async function loadBudgets() {
    try {
      const res = await fetch("/api/budget", { cache: "no-store" });
      const text = await res.text();

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);

      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error("Response bukan JSON valid: " + text);
      }

      if (!json.ok) throw new Error(json.error || "Gagal mengambil data budget");
      setBudgets(json.data || []);
    } catch (err) {
      console.error("Budget fetch error:", err);
      setError(err.message || "Gagal memuat data budget");
    } finally {
      setLoading(false);
    }
  }

  // === Hitung penggunaan transaksi bulan ini ===
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const categoryUsage = {};
  transaksi.forEach((t) => {
    if (!t.date || t.type !== "expense") return;
    const d = t.date;
    const tMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (tMonth !== monthKey) return;

    const cat = t.categoryParent || t.categoryParentName || t.categoryName || "Lainnya";
    if (!categoryUsage[cat]) categoryUsage[cat] = 0;
    categoryUsage[cat] += Number(t.amount || 0);
  });

  // === Filter hanya budget bulan ini ===
  const currentBudgets = budgets.filter((b) => b.month === monthKey);

  // === Gabungkan & hitung persentase ===
  const budgetList = currentBudgets.map((b) => {
    const used = categoryUsage[b.categoryName] || b.used || 0;
    const percent = b.limit ? Math.min(Math.round((used / b.limit) * 100), 999) : 0;
    return { ...b, used, percent };
  });

  // === Urutkan & ambil 5 tertinggi ===
  const topBudgets = budgetList.sort((a, b) => b.percent - a.percent).slice(0, 5);

  // === UI: Loading/Error ===
  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2 mb-2">
          <Wallet className="w-5 h-5 text-indigo-500" /> Budget Bulanan
        </h2>
        <p className="text-gray-500 animate-pulse text-sm sm:text-base">
          Memuat data budget...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 text-red-600">
        <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-red-500" /> Budget Bulanan
        </h2>
        <p className="text-sm sm:text-base">{error}</p>
      </div>
    );
  }

  // === UI: Main ===
  return (
    <div className="bg-white/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 transition-all duration-500 hover:shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-indigo-500" /> 5 Budget Hampir Habis
        </h2>
        <span className="text-xs sm:text-sm text-gray-500">
          Periode: {monthKey}
        </span>
      </div>

      {/* Body */}
      {topBudgets.length === 0 ? (
        <p className="text-gray-500 italic text-center py-6 text-sm sm:text-base">
          Belum ada data budget bulan ini.
        </p>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {topBudgets.map((b, idx) => {
            const getColor = () => {
              if (b.percent >= 100) return "from-red-500 to-red-700";
              if (b.percent >= 90) return "from-orange-400 to-red-500";
              if (b.percent >= 70) return "from-amber-400 to-orange-400";
              return "from-emerald-400 to-green-600";
            };

            return (
              <div
                key={b.id}
                className="bg-white/70 border border-gray-100 p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Nama dan Angka */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2 gap-1">
                  <span className="font-medium text-gray-800 capitalize text-sm sm:text-base">
                    {idx + 1}. {b.categoryName}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-600">
                    Rp {b.used.toLocaleString("id-ID")} / Rp{" "}
                    {b.limit.toLocaleString("id-ID")} ({b.percent}%)
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="relative w-full h-3 sm:h-4 bg-gray-200/70 rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full bg-gradient-to-r ${getColor()} transition-all duration-700 ease-out`}
                    style={{ width: `${Math.min(b.percent, 100)}%` }}
                  ></div>
                </div>

                {/* Status Info */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mt-2 text-xs sm:text-sm gap-1">
                  {b.percent >= 100 ? (
                    <p className="text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Budget terlampaui!
                    </p>
                  ) : b.percent >= 80 ? (
                    <p className="text-orange-500 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Hampir mencapai batas
                    </p>
                  ) : (
                    <p className="text-green-600 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" /> Aman
                    </p>
                  )}
                  <p className="text-gray-500">
                    Sisa: Rp {(b.limit - b.used).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
