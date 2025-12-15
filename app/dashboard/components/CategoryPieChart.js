"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { Wallet } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryPieChart({ categoryExpenseFiltered }) {
  const labels = Object.keys(categoryExpenseFiltered);
  const values = Object.values(categoryExpenseFiltered);

  // 🎨 Warna dinamis pastel lembut tapi kontras (tidak sama)
  const colors = [
    "#60a5fa", "#f87171", "#34d399", "#facc15", "#a78bfa",
    "#fbbf24", "#fb7185", "#2dd4bf", "#c084fc", "#f472b6",
    "#4ade80", "#fcd34d", "#38bdf8", "#f9a8d4", "#93c5fd"
  ].slice(0, labels.length);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: "#ffffff",
        borderWidth: 3,
        hoverOffset: 12,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // ✅ biar chart fleksibel di layar kecil
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#475569",
          font: { size: 11, weight: "500" }, // 🔹 font lebih kecil di HP
          usePointStyle: true,
          padding: 10,
        },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#fff",
        bodyColor: "#cbd5e1",
        borderColor: "#475569",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (ctx) =>
            `${ctx.label}: Rp ${Number(ctx.parsed).toLocaleString("id-ID")}`,
        },
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
    },
  };

  const total = values.reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-indigo-500" /> Pengeluaran per Kategori
        </h2>
        <span className="text-xs sm:text-sm text-gray-500">
          Total: Rp {total.toLocaleString("id-ID")}
        </span>
      </div>

      {/* Chart */}
      {values.length === 0 ? (
        <p className="text-center text-gray-500 italic py-6 text-sm sm:text-base">
          Belum ada data pengeluaran
        </p>
      ) : (
        <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[340px] md:max-w-[400px] h-[220px] sm:h-[280px] md:h-[320px]">
          <Pie data={data} options={options} />
        </div>
      )}
    </div>
  );
}
