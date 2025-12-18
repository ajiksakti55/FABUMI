"use client";

export default function TransactionTable({ filtered, formatDate }) {
  return (
    <div className="bg-white/80 backdrop-blur-md p-4 sm:p-6 shadow-lg rounded-2xl border border-gray-100 transition-all duration-300 hover:shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
          💰 Transaksi Terbaru
        </h2>
        <span className="text-xs sm:text-sm text-gray-500">
          Menampilkan {Math.min(filtered.length, 5)} dari {filtered.length} transaksi
        </span>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 italic py-6 text-sm sm:text-base">
          Belum ada transaksi
        </p>
      ) : (
        <>
          {/* === 💻 DESKTOP MODE === */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full text-sm text-gray-700">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-700">
                  <th className="py-3 px-4 text-left font-semibold">Tanggal</th>
                  <th className="py-3 px-4 text-left font-semibold">Kategori</th>
                  <th className="py-3 px-4 text-left font-semibold">Tipe</th>
                  <th className="py-3 px-4 text-right font-semibold">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 5).map((t, idx) => (
                  <tr
                    key={t.id || idx}
                    className={`transition-all duration-200 hover:bg-blue-50/50 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/70"
                    }`}
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      {formatDate(t.date)}
                    </td>
                    <td className="py-3 px-4 font-medium whitespace-nowrap">
                      {t.categoryName}
                    </td>
                    <td
                      className={`py-3 px-4 capitalize font-medium whitespace-nowrap ${
                        t.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {t.type === "income" ? "Pemasukan" : "Pengeluaran"}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-semibold whitespace-nowrap ${
                        t.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      Rp {Number(t.amount).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* === 📱 MOBILE MODE === */}
          <div className="sm:hidden space-y-3">
            {filtered.slice(0, 5).map((t, idx) => (
              <div
                key={t.id || idx}
                className="p-3 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{formatDate(t.date)}</span>
                  <span
                    className={`text-xs font-semibold ${
                      t.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.type === "income" ? "+ " : "- "}Rp{" "}
                    {Number(t.amount).toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="mt-1 font-medium text-gray-700 text-sm">
                  {t.categoryName}
                </div>

                <div
                  className={`text-xs mt-1 font-semibold ${
                    t.type === "income" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {t.type === "income" ? "Pemasukan" : "Pengeluaran"}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Footer link */}
      {filtered.length > 5 && (
        <div className="text-center mt-4">
          <a
            href="/transaksi"
            className="inline-block text-sm text-blue-600 hover:text-indigo-700 font-medium transition-colors"
          >
            Lihat semua transaksi →
          </a>
        </div>
      )}
    </div>
  );
}
