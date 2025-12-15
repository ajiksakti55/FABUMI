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
import { CalendarDays } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function DailyExpenseChart({ filtered, isIncomeCategory, formatDate }) {
  const daily = {};
  filtered
    .filter((t) => t.type === "expense" && !isIncomeCategory(t))
    .forEach((t) => {
      const key = formatDate(t.date);
      if (!daily[key]) daily[key] = 0;
      daily[key] += Number(t.amount);
    });

  const labels = Object.keys(daily).sort((a, b) => new Date(a) - new Date(b));

  const data = {
    labels,
    datasets: [
      {
        label: "Pengeluaran Harian",
        data: labels.map((d) => daily[d]),
        borderRadius: 8,
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return "rgba(249,115,22,0.8)";
          const gradient = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, "#fdba74");
          gradient.addColorStop(1, "#f97316");
          return gradient;
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // ✅ agar chart fleksibel di HP
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
          callback: function (value) {
            const label = this.getLabelForValue(value);
            return label.length > 10 ? label.substring(0, 10) + "…" : label; // 🔹 potong label panjang
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
    animation: { duration: 800, easing: "easeOutQuart" },
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-orange-500" /> Pengeluaran Harian
        </h2>
        <span className="text-xs sm:text-sm text-gray-500">
          {labels.length} hari
        </span>
      </div>

      {/* Chart */}
      {labels.length === 0 ? (
        <p className="text-center text-gray-500 italic py-6 text-sm sm:text-base">
          Belum ada data pengeluaran
        </p>
      ) : (
        <div className="h-[220px] sm:h-[300px] md:h-[360px] overflow-x-auto scrollbar-hide">
          <div className="min-w-[480px] sm:min-w-0 h-full">
            <Bar data={data} options={options} />
          </div>
        </div>
      )}
    </div>
  );
}
