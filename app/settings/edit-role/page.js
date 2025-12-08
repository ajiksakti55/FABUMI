"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../auth-context";

export default function EditRolePage() {
  const { currentUser } = useAuth();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // ======================================================
  // 🔥 FETCH ROLE LIST DARI FIRESTORE
  // ======================================================
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        if (!currentUser) return;
        const token = await currentUser.getIdToken();

        const res = await fetch("/api/getRoles", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok) setRoles(data.roles);
      } catch (err) {
        console.error("Gagal load role:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [currentUser]);

  const handleDelete = (roleName) => {
    if (!confirm(`Hapus role "${roleName}" ?`)) return;

    fetch("/api/deleteRole", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleName }),
    })
      .then((res) => {
        if (res.ok) {
          alert("Role berhasil dihapus!");
          setRoles((prev) => prev.filter((r) => r !== roleName));
        } else {
          alert("Gagal menghapus role!");
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="flex justify-center py-10 w-full px-4">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-8 border">
        {/* TITLE */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          ✏ Edit Role
        </h1>

        {/* TABLE WRAPPER */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="2" className="text-center py-5 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan="2" className="text-center py-5 text-gray-500">
                    Tidak ada role ditemukan.
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr
                    key={role}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-5 py-3 text-gray-900 font-medium">
                      {role}
                    </td>

                    <td className="px-5 py-3 flex justify-center gap-5">
                      <a
                        href={`/settings/edit-role/${role}`}
                        className="text-blue-600 font-medium hover:underline"
                      >
                        Edit
                      </a>

                      <button
                        onClick={() => handleDelete(role)}
                        className=" font-medium hover:underline text-red-500 hover:text-red-600"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
