"use client";

import { useEffect, useState } from "react";
import TransactionForm from "../transaksi/components/TransactionForm";
import TransactionList from "../transaksi/components/TransactionList";

export default function TransaksiPage() {
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [filterMonth, setFilterMonth] = useState(""); // YYYY-MM

  // Load transaksi
  async function load(month = "") {
    setLoading(true);
    try {
      let url = "/api/transaksi";
      if (month) url += `?month=${encodeURIComponent(month)}`;
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();
      if (json.ok) setTransaksi(json.data || []);
      else console.error(json.error);
    } catch (err) {
      console.error("Failed to load transaksi", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(filterMonth);
  }, [filterMonth]);

  return (
    <div className="p-6 text-gray-800 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          💼 Transaksi
        </h1>        
      </div>

      {/* FORM */}
      <div className="">
        <TransactionForm
          editing={editing}
          onSaved={() => {
            setEditing(null);
            load(filterMonth);
          }}
          onCancel={() => setEditing(null)}
        />
      </div>

      {/* LIST */}
      <div className="bg-white/80 rounded-xl shadow-md p-5 border border-gray-100">
        {loading ? (
          <div className="flex justify-center py-8 text-gray-500">Loading...</div>
        ) : (
          <TransactionList
            transaksi={transaksi}
            onEdit={(t) => setEditing(t)}
            onDeleted={() => load(filterMonth)}
          />
        )}
      </div>
    </div>
  );
}
