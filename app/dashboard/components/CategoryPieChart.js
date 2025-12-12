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
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#475569",
          font: { size: 13, weight: "500" },
          usePointStyle: true,
          padding: 20,
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
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-500">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-indigo-500" /> Pengeluaran per Kategori
        </h2>
        <span className="text-sm text-gray-500">Total: Rp {total.toLocaleString("id-ID")}</span>
      </div>

      {values.length === 0 ? (
        <p className="text-center text-gray-500 italic py-6">Belum ada data pengeluaran</p>
      ) : (
        <div className="relative mx-auto max-w-[350px]">
          <Pie data={data} options={options} />
        </div>
      )}
    </div>
  );
}
