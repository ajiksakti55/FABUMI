"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
);

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [transaksi, setTransaksi] = useState([]);

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await fetch("/api/transaksi");
      const json = await res.json();

      if (!json.ok) throw new Error("Gagal mengambil data transaksi");

      let data = json.data || [];

      // ===========================
      // NORMALISASI TANGGAL FIX
      // ===========================
      data = data.map((t) => ({
        ...t,
        date: normalizeDate(t.date),
        createdAt: normalizeDate(t.createdAt),
      }));

      setTransaksi(data);

      // ===========================
      // HITUNG SUMMARY
      // ===========================
      let income = 0;
      let expense = 0;

      data.forEach((t) => {
        if (t.type === "income") income += Number(t.amount);
        else if (t.type === "expense") expense += Number(t.amount);
      });

      setTotalIncome(income);
      setTotalExpense(expense);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ===============================
  // FIX ALL FORMAT TANGGAL
  // ===============================
  function normalizeDate(val) {
    if (!val) return null;

    // Firestore Timestamp (admin)
    if (typeof val === "object" && val._seconds) {
      return new Date(val._seconds * 1000);
    }

    // Firestore client Timestamp
    if (val.toDate) {
      return val.toDate();
    }

    // Number timestamp
    if (typeof val === "number") {
      return new Date(val);
    }

    // String (ISO)
    if (typeof val === "string") {
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    }

    // Sudah Date
    if (val instanceof Date) return val;

    return null;
  }

  function formatDate(val) {
    if (!val) return "-";
    if (!(val instanceof Date) || isNaN(val.getTime())) return "-";
    return val.toLocaleDateString("id-ID");
  }

  // ===============================
  // GRAFIK BULANAN
  // ===============================
  const monthlyIncome = {};
  const monthlyExpense = {};

  transaksi.forEach((t) => {
    if (!t.date) return;

    const d = t.date;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    if (!monthlyIncome[key]) monthlyIncome[key] = 0;
    if (!monthlyExpense[key]) monthlyExpense[key] = 0;

    if (t.type === "income") monthlyIncome[key] += Number(t.amount);
    else if (t.type === "expense") monthlyExpense[key] += Number(t.amount);
  });

  const bulanLabels = Object.keys(monthlyIncome).sort();

  const chartData = {
    labels: bulanLabels,
    datasets: [
      {
        label: "Pemasukan",
        data: bulanLabels.map((b) => monthlyIncome[b] || 0),
        borderColor: "green",
        borderWidth: 2,
      },
      {
        label: "Pengeluaran",
        data: bulanLabels.map((b) => monthlyExpense[b] || 0),
        borderColor: "red",
        borderWidth: 2,
      },
    ],
  };

  if (loading) return <p>Loading...</p>;

  const balance = totalIncome - totalExpense;

  return (
    <div className="p-6 text-gray-800">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="p-4 bg-white shadow rounded">
          <p className="text-gray-600 text-sm">Total Pemasukan</p>
          <p className="text-xl font-bold text-green-600">
            {totalIncome.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <p className="text-gray-600 text-sm">Total Pengeluaran</p>
          <p className="text-xl font-bold text-red-600">
            {totalExpense.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <p className="text-gray-600 text-sm">Sisa Saldo</p>
          <p
            className={`text-xl font-bold ${
              balance >= 0 ? "text-blue-600" : "text-red-600"
            }`}
          >
            {balance.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* GRAFIK */}
      <div className="bg-white p-6 rounded shadow mb-10">
        <h2 className="text-lg font-semibold mb-4">Grafik pemasukan vs pengeluaran</h2>
        <Line data={chartData} />
      </div>

      {/* TRANSAKSI TERBARU */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Transaksi Terbaru</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Tanggal</th>
              <th className="py-2 text-left">Kategori</th>
              <th className="py-2 text-left">Tipe</th>
              <th className="py-2 text-right">Nominal</th>
            </tr>
          </thead>

          <tbody>
            {transaksi.slice(0, 5).map((t) => (
              <tr key={t.id} className="border-b">
                <td className="py-2">{formatDate(t.date)}</td>
                <td className="py-2">{t.categoryName}</td>
                <td className="py-2 capitalize">{t.type}</td>
                <td className="py-2 text-right">
                  {Number(t.amount).toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
