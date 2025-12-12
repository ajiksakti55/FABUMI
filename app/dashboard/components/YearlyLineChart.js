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

export default function YearlyLineChart({ transaksi, thisYear }) {
  // ======== Hitung pemasukan & pengeluaran bulanan ==========
  const monthlyIncome = {};
  const monthlyExpense = {};

  const transactionsThisYear = transaksi.filter(
    (t) => t.date && new Date(t.date).getFullYear() === thisYear
  );

  transactionsThisYear.forEach((t) => {
    const date = new Date(t.date);
    const amt = Number(t.amount || 0);
    if (isNaN(amt) || amt <= 0) return;

    const key = String(date.getMonth() + 1).padStart(2, "0");
    if (!monthlyIncome[key]) monthlyIncome[key] = 0;
    if (!monthlyExpense[key]) monthlyExpense[key] = 0;

    if (t.type === "income") monthlyIncome[key] += amt;
    else monthlyExpense[key] += amt;
  });

  const monthLabels = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];

  // ======== Dataset ==========
  const data = {
    labels: monthLabels,
    datasets: [
      {
        label: "Pemasukan",
        data: monthLabels.map((_, i) => monthlyIncome[String(i + 1).padStart(2, "0")] || 0),
        borderColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return "#22c55e";
          const gradient = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, "#86efac");
          gradient.addColorStop(1, "#16a34a");
          return gradient;
        },
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return "rgba(34,197,94,0.1)";
          const gradient = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, "rgba(34,197,94,0.05)");
          gradient.addColorStop(1, "rgba(34,197,94,0.25)");
          return gradient;
        },
        fill: true,
        tension: 0.35,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#16a34a",
      },
      {
        label: "Pengeluaran",
        data: monthLabels.map((_, i) => monthlyExpense[String(i + 1).padStart(2, "0")] || 0),
        borderColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return "#ef4444";
          const gradient = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, "#fca5a5");
          gradient.addColorStop(1, "#dc2626");
          return gradient;
        },
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return "rgba(239,68,68,0.1)";
          const gradient = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, "rgba(239,68,68,0.05)");
          gradient.addColorStop(1, "rgba(239,68,68,0.25)");
          return gradient;
        },
        fill: true,
        tension: 0.35,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#dc2626",
      },
    ],
  };

  // ======== Opsi Chart ==========
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#475569",
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: "500" },
        },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#fff",
        bodyColor: "#cbd5e1",
        borderColor: "#475569",
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        callbacks: {
          label: (ctx) =>
            `${ctx.dataset.label}: Rp ${Number(ctx.parsed.y).toLocaleString("id-ID")}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { size: 11 } },
      },
      y: {
        ticks: {
          color: "#64748b",
          font: { size: 11 },
          callback: (v) => "Rp " + v.toLocaleString("id-ID"),
        },
        grid: { color: "rgba(203,213,225,0.2)" },
      },
    },
    interaction: { mode: "index", intersect: false },
  };

  // Hitung tren saldo tahunan
  const totalIncome = Object.values(monthlyIncome).reduce((a, b) => a + b, 0);
  const totalExpense = Object.values(monthlyExpense).reduce((a, b) => a + b, 0);
  const trendUp = totalIncome >= totalExpense;

  return (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-100 transition-all duration-500 hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          📊 Pemasukan vs Pengeluaran ({thisYear})
        </h2>
        <div
          className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full ${
            trendUp
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {trendUp ? (
            <>
              <TrendingUp className="w-4 h-4" /> Surplus
            </>
          ) : (
            <>
              <TrendingDown className="w-4 h-4" /> Defisit
            </>
          )}
        </div>
      </div>

      <div className="h-72">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
