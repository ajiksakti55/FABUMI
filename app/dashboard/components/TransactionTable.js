export default function TransactionTable({ filtered, formatDate }) {
  return (
    <div className="bg-white/80 backdrop-blur-md p-6 shadow-lg rounded-2xl border border-gray-100 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          💰 Transaksi Terbaru
        </h2>
        <span className="text-sm text-gray-500">
          Menampilkan {Math.min(filtered.length, 5)} dari {filtered.length} transaksi
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 italic py-4">
          Belum ada transaksi
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-sm text-gray-700">
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
                  <td className="py-3 px-4">{formatDate(t.date)}</td>
                  <td className="py-3 px-4 font-medium">{t.categoryName}</td>
                  <td
                    className={`py-3 px-4 capitalize font-medium ${
                      t.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.type === "income" ? "Pemasukan" : "Pengeluaran"}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-semibold ${
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
