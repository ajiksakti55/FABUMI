"use client";

import { ArrowDownCircleIcon, ArrowUpCircleIcon, WalletIcon } from "lucide-react";

export default function SummaryCards({ totalIncomeFiltered, totalExpenseFiltered, balance }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Pemasukan */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 border border-emerald-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">Total Pemasukan</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-2">
              Rp {totalIncomeFiltered.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="bg-emerald-500/10 p-3 rounded-full">
            <ArrowDownCircleIcon className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Pengeluaran */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-rose-100 border border-rose-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-rose-700">Total Pengeluaran</p>
            <p className="text-3xl font-extrabold text-rose-600 mt-2">
              Rp {totalExpenseFiltered.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="bg-rose-500/10 p-3 rounded-full">
            <ArrowUpCircleIcon className="w-8 h-8 text-rose-600" />
          </div>
        </div>
      </div>

      {/* Saldo */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-indigo-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-700">Sisa Saldo (Total)</p>
            <p
              className={`text-3xl font-extrabold mt-2 ${
                balance >= 0 ? "text-indigo-600" : "text-rose-600"
              }`}
            >
              Rp {balance.toLocaleString("id-ID")}
            </p>
          </div>
          <div
            className={`p-3 rounded-full ${
              balance >= 0 ? "bg-indigo-500/10" : "bg-rose-500/10"
            }`}
          >
            <WalletIcon
              className={`w-8 h-8 ${
                balance >= 0 ? "text-indigo-600" : "text-rose-600"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
