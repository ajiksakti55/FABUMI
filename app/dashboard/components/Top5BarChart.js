"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Trophy } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Top5BarChart({ filtered, formatDate, isIncomeCategory }) {
  const top5 = filtered
    .filter((t) => t.type === "expense" && !isIncomeCategory(t))
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5);

  const data = {
    labels: top5.map((t) => `${t.categoryName} (${formatDate(t.date)})`),
    datasets: [
      {
        label: "Pengeluaran Terbesar",
        data: top5.map((t) => Number(t.amount)),
        borderRadius: 8,
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return "#ef4444";
          const gradient = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, "#f87171");
          gradient.addColorStop(1, "#dc2626");
          return gradient;
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // ✅ agar chart menyesuaikan container
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#fff",
        bodyColor: "#cbd5e1",
        borderColor: "#475569",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (ctx) => `Rp ${Number(ctx.parsed.y).toLocaleString("id-ID")}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#475569",
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 30,
          callback: function (value, index, values) {
            const label = this.getLabelForValue(value);
            return label.length > 12 ? label.substring(0, 12) + "…" : label; // 🔹 potong label panjang
          },
        },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: "#64748b",
          font: { size: 10 },
          callback: (v) => "Rp " + v.toLocaleString("id-ID"),
        },
        grid: { color: "rgba(203,213,225,0.2)" },
      },
    },
    animation: { duration: 900, easing: "easeOutQuart" },
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" /> Top 5 Pengeluaran Terbesar
        </h2>
        <span className="text-xs sm:text-sm text-gray-500">
          {top5.length} item
        </span>
      </div>

      {/* Chart area */}
      {top5.length === 0 ? (
        <p className="text-center text-gray-500 italic py-6 text-sm sm:text-base">
          Belum ada data pengeluaran
        </p>
      ) : (
        <div className="h-[220px] sm:h-[300px] md:h-[360px]">
          <Bar data={data} options={options} />
        </div>
      )}
    </div>
  );
}
