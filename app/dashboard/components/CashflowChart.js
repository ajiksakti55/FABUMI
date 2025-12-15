"use client";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { TrendingUp, TrendingDown } from "lucide-react";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

export default function CashflowChart({ filtered, formatDate }) {
  let running = 0;
  const cashflowLabels = [];
  const cashflowValues = [];

  filtered
    .filter((t) => t.date)
    .sort((a, b) => a.date - b.date)
    .forEach((t) => {
      const amt = Number(t.amount || 0);
      if (isNaN(amt) || amt <= 0) return;
      running += t.type === "income" ? amt : -amt;
      cashflowLabels.push(formatDate(t.date));
      cashflowValues.push(running);
    });

  const gradientBorder = (ctx) => {
    const chart = ctx.chart;
    const { ctx: c, chartArea } = chart;
    if (!chartArea) return;
    const gradient = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, "#60a5fa");
    gradient.addColorStop(1, "#4f46e5");
    return gradient;
  };

  const data = {
    labels: cashflowLabels,
    datasets: [
      {
        label: "Saldo Berjalan",
        data: cashflowValues,
        borderColor: (ctx) => gradientBorder(ctx),
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return;
          const gradient = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, "rgba(99, 102, 241, 0.05)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.15)");
          return gradient;
        },
        tension: 0.35,
        fill: true,
        borderWidth: 3,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: "#4f46e5",
        pointHoverBackgroundColor: "#3b82f6",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // ✅ penting untuk responsif
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#fff",
        bodyColor: "#cbd5e1",
        borderColor: "#475569",
        borderWidth: 1,
        displayColors: false,
        padding: 10,
        callbacks: {
          label: (ctx) => `Saldo: Rp ${Number(ctx.parsed.y).toLocaleString("id-ID")}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#64748b",
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 30,
        },
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
    interaction: { mode: "index", intersect: false },
  };

  const firstValue = cashflowValues[0] || 0;
  const lastValue = cashflowValues[cashflowValues.length - 1] || 0;
  const trendUp = lastValue > firstValue;

  return (
    <div className="bg-white/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 transition-all duration-500 hover:shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
          💹 Cashflow
        </h2>
        <div
          className={`flex items-center gap-2 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full ${
            trendUp
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {trendUp ? (
            <>
              <TrendingUp className="w-4 h-4" /> Positif
            </>
          ) : (
            <>
              <TrendingDown className="w-4 h-4" /> Negatif
            </>
          )}
        </div>
      </div>

      {cashflowValues.length === 0 ? (
        <p className="text-center text-gray-500 italic py-6 text-sm sm:text-base">
          Belum ada data cashflow
        </p>
      ) : (
        <div className="h-[220px] sm:h-[300px] md:h-[360px]">
          {/* ✅ tinggi chart menyesuaikan device */}
          <Line data={data} options={options} />
        </div>
      )}
    </div>
  );
}
