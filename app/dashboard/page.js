"use client";

import { useEffect, useState } from "react";
import {
  Line, Pie, Bar
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
  ArcElement,
  BarElement,
} from "chart.js";

import SummaryCards from "./components/SummaryCards";
import CashflowChart from "./components/CashflowChart";
import YearlyLineChart from "./components/YearlyLineChart";
import CategoryPieChart from "./components/CategoryPieChart";
import BudgetProgress from "./components/BudgetProgress";
import Top5BarChart from "./components/Top5BarChart";
import DailyExpenseChart from "./components/DailyExpenseChart";
import TransactionTable from "./components/TransactionTable";
import FilterSelect from "./components/FilterSelect";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
  ArcElement,
  BarElement
);

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [transaksi, setTransaksi] = useState([]);
  const [filter, setFilter] = useState("bulan-ini");
  const [totalIncomeAll, setTotalIncomeAll] = useState(0);
  const [totalExpenseAll, setTotalExpenseAll] = useState(0);
  const monthlyBudget = 5000000;

  function isIncomeCategory(t) {
    const txt = (
      (t.categoryName || "") +
      " " +
      (t.categoryParent || "") +
      " " +
      (t.categoryParentName || "")
    ).toLowerCase();
    return ["gaji", "salary", "pendapatan", "income"].some((w) =>
      txt.includes(w)
    );
  }

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await fetch("/api/transaksi");
      const json = await res.json();
      if (!json.ok) throw new Error("Gagal mengambil transaksi");

      let data = json.data || [];
      data = data.map((t) => ({
        ...t,
        date: normalizeDate(t.date),
        createdAt: normalizeDate(t.createdAt),
      }));
      setTransaksi(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function normalizeDate(val) {
    if (!val) return null;
    if (typeof val === "object" && val._seconds) return new Date(val._seconds * 1000);
    if (val && typeof val.toDate === "function") return val.toDate();
    if (typeof val === "number") return new Date(val);
    if (typeof val === "string") {
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    }
    if (val instanceof Date) return val;
    return null;
  }

  function formatDate(val) {
    if (!val) return "-";
    if (!(val instanceof Date) || isNaN(val.getTime())) return "-";
    return val.toLocaleDateString("id-ID");
  }

  // === Filter Date Logic ===
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  const filtered = transaksi.filter((t) => {
    if (!t || !t.date) return false;
    const d = t.date;
    if (filter === "bulan-ini")
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    if (filter === "bulan-lalu")
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    return true;
  });

  useEffect(() => {
    let inc = 0;
    let exp = 0;
    transaksi.forEach((t) => {
      const amt = Number(t.amount || 0);
      if (isNaN(amt) || amt <= 0) return;
      if (t.type === "income") inc += amt;
      if (t.type === "expense") exp += amt;
    });
    setTotalIncomeAll(inc);
    setTotalExpenseAll(exp);
  }, [transaksi]);

  // === Hitung semua data turunan ===
  let totalIncomeFiltered = 0;
  let totalExpenseFiltered = 0;
  let categoryExpenseFiltered = {};

  filtered.forEach((t) => {
    const amt = Number(t.amount || 0);
    if (isNaN(amt) || amt <= 0) return;
    if (t.type === "income") totalIncomeFiltered += amt;
    else if (t.type === "expense") {
      totalExpenseFiltered += amt;
      if (!isIncomeCategory(t)) {
        const cat =
          t.categoryParent || t.categoryParentName || t.categoryName || "Lainnya";
        if (!categoryExpenseFiltered[cat]) categoryExpenseFiltered[cat] = 0;
        categoryExpenseFiltered[cat] += amt;
      }
    }
  });

  const balance = totalIncomeAll - totalExpenseAll;
  const budgetPercent = Math.min(
    Math.round((totalExpenseFiltered / monthlyBudget) * 100),
    100
  );

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 text-gray-800 space-y-6">
      <FilterSelect filter={filter} setFilter={setFilter} />
      <SummaryCards
        totalIncomeFiltered={totalIncomeFiltered}
        totalExpenseFiltered={totalExpenseFiltered}
        balance={balance}
      />
      <CashflowChart filtered={filtered} formatDate={formatDate} />
      <YearlyLineChart transaksi={transaksi} thisYear={thisYear} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoryPieChart categoryExpenseFiltered={categoryExpenseFiltered} />
        <BudgetProgress transaksi={filtered} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Top5BarChart filtered={filtered} formatDate={formatDate} isIncomeCategory={isIncomeCategory} />
        <DailyExpenseChart filtered={filtered} isIncomeCategory={isIncomeCategory} formatDate={formatDate} />
      </div>
      <TransactionTable filtered={filtered} formatDate={formatDate} />
    </div>
  );
}
