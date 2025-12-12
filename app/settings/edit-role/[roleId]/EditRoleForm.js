"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditRoleForm({ params }) {
  const { roleId } = params;
  const router = useRouter();

  const [accessList] = useState([
    "dashboard",
    "transaksi",   
    "kategori",     
    "budget",
    "add-users",
    "edit-users",
    "add-role",
    "edit-role",
  ]);

  const [selectedAccess, setSelectedAccess] = useState([]);
  const [loading, setLoading] = useState(true);

  // =============================
  // 🔥 Ambil role detail existing
  // =============================
  useEffect(() => {
    fetch(`/api/roles/get-one?roleId=${roleId}`)
      .then((res) => res.json())
      .then((data) => {
        setSelectedAccess(data.access || []);
        setLoading(false);
      });
  }, [roleId]);

  function toggleAccess(item) {
    setSelectedAccess((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();

    fetch("/api/roles/update", {
      method: "POST",
      body: JSON.stringify({
        roleId,
        access: selectedAccess,
      }),
    }).then(() => {
      alert("Role berhasil diperbarui!");
      router.push("/settings/edit-role");
    });
  }

  function handleCancel() {
    router.push("/settings/edit-role");
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600 text-lg">
        Loading data role...
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full py-10 px-4">
      <div className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        {/* =============================
            TITLE
        ============================== */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Edit Role: {roleId}
        </h1>

        <form onSubmit={handleSubmit}>
          {/* ACCESS LIST */}
          <div className="grid grid-cols-2 gap-4">
            {accessList.map((item) => (
              <label
                key={item}
                className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer transition shadow-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedAccess.includes(item)}
                  onChange={() => toggleAccess(item)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="capitalize text-gray-800 font-medium">
                  {item.replace("-", " ")}
                </span>
              </label>
            ))}
          </div>

          {/* BUTTON ACTION */}
          <div className="flex gap-3 mt-8 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition font-semibold shadow-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-md"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
