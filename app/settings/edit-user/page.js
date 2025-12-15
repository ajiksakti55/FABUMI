"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth-context";

export default function EditUsersPage() {
  const { currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editUid, setEditUid] = useState("");
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [modalError, setModalError] = useState("");
  const [roles, setRoles] = useState([]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/getUsers");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers(data.users);
    } catch {
      setMessage("❌ Gagal mengambil data user.");
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      if (!currentUser) return;
      const token = await currentUser.getIdToken();
      const res = await fetch("/api/getRoles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setRoles(data.roles);
    } catch (err) {
      console.error(err);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
      fetchRoles();
    }
  }, [currentUser, fetchUsers, fetchRoles]); // ✅ warning hilang


  // ======================================================
  // 🔥 OPEN EDIT MODAL
  // ======================================================
  const openEditModal = (u) => {
    setEditUid(u.uid);
    setEditEmail(u.email);
    setEditRole(u.role);

    setNewPassword("");
    setConfirmPassword("");
    setModalError("");

    setEditModal(true);
  };

  // ======================================================
  // 🔥 DELETE USER
  // ======================================================
  const deleteUser = async (uid, email) => {
    if (!confirm(`Hapus user ${email}?`)) return;

    try {
      const res = await fetch("/api/deleteUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(`🗑️ User ${email} berhasil dihapus`);
      fetchUsers();
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  };

  // ======================================================
  // 🔥 SUBMIT EDIT
  // ======================================================
  const handleEditUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setModalError("");

    if (newPassword || confirmPassword) {
      if (newPassword.length < 6) {
        setModalError("❌ Password minimal 6 karakter.");
        setLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setModalError("❌ Password dan konfirmasi tidak sama.");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: editUid,
          role: editRole,
          newPassword: newPassword || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(`✅ User ${editEmail} berhasil diperbarui`);
      setEditModal(false);
      fetchUsers();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // 🔥 UI MODERN CLEAN
  // ======================================================
  return (
    <div className="flex justify-center w-full py-12 px-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">
          Edit User
        </h1>

        {message && (
          <div
            className={`mb-6 p-3 rounded-xl text-sm ${
              message.startsWith("❌")
                ? "bg-red-100 text-red-700 border border-red-200"
                : "bg-green-100 text-green-700 border border-green-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* TABLE */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-gray-700 text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length ? (
                users.map((u) => (
                  <tr key={u.uid} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3 capitalize">{u.role}</td>

                    <td className="px-4 py-3 text-center space-x-4">
                      <button
                        onClick={() => openEditModal(u)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteUser(u.uid, u.email)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center py-6 text-gray-500 italic"
                  >
                    Belum ada user.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================
          🔥 MODAL EDIT MODERN
          ====================================================== */}
      {editModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-gray-100 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Edit User
            </h2>

            {modalError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-xl text-sm">
                {modalError}
              </div>
            )}

            <form onSubmit={handleEditUser} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Email
                </label>
                <input
                  disabled
                  value={editEmail}
                  className="mt-1 w-full p-3 rounded-xl border border-gray-300 bg-gray-100 text-black"
                />
              </div>

              {/* Role */}
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="mt-1 w-full p-3 rounded-xl border border-gray-300 bg-gray-50 text-black"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Password Baru (opsional)
                </label>
                <input
                  type={showPass ? "text" : "password"}
                  className="mt-1 w-full p-3 rounded-xl border border-gray-300 bg-gray-50 text-black"
                  placeholder="Biarkan kosong jika tidak diganti"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Konfirmasi Password Baru
                </label>
                <input
                  type={showConfirmPass ? "text" : "password"}
                  className="mt-1 w-full p-3 rounded-xl border border-gray-300 bg-gray-50 text-black"
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md"
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
