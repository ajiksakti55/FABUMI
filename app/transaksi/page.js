// app/transaksi/page.jsx
"use client";

import { useEffect, useState } from "react";
import TransactionForm from "../transaksi/components/TransactionForm";
import TransactionList from "../transaksi/components/TransactionList";

export default function TransaksiPage() {
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [filterMonth, setFilterMonth] = useState(""); // YYYY-MM

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
    <div className="p-6 text-gray-800">
      <h1 className="text-xl font-semibold mb-4">Transaksi</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white p-4 rounded shadow">
          <TransactionForm
            editing={editing}
            onSaved={() => {
              setEditing(null);
              load(filterMonth);
            }}
            onCancel={() => setEditing(null)}
          />
        </div>

        <div className="md:col-span-2 bg-white p-4 rounded shadow">
          <div className="flex items-center justify-between mb-4">
            
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <TransactionList
              transaksi={transaksi}
              onEdit={(t) => setEditing(t)}
              onDeleted={() => load(filterMonth)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
