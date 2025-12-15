"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../auth-context";

export default function AddUserPage() {
  const router = useRouter();
  const { currentUser, access } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState("");
  const [roleList, setRoleList] = useState([]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ============================================================
  // 🔒 PROTEKSI HALAMAN BERDASARKAN AKSES
  // ============================================================
  useEffect(() => {
    if (!currentUser) return;
    if (!access.includes("add-users")) {
      router.push("/");
    }
  }, [access, currentUser, router]); // ✅ tambahkan router
  // ============================================================
  // 🔥 FETCH ROLE
  // ============================================================
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        if (!currentUser) return;
        const token = await currentUser.getIdToken();

        const res = await fetch("/api/getRoles", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok) {
          setRoleList(data.roles);
          if (data.roles.length > 0) setRole(data.roles[0]);
        }
      } catch (err) {
        console.error("Gagal fetch role:", err);
      }
    };

    fetchRoles();
  }, [currentUser]);

  // ============================================================
  // 🔥 ADD USER
  // ============================================================
  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/createUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal menambahkan user");

      setMessage(`User ${email} berhasil dibuat!`);
      setEmail("");
      setPassword("");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 🔥 UI MODERN CLEAN CARD
  // ============================================================
  return (
    <div className="flex justify-center py-12 w-full px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        {/* TITLE */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">
          Tambah User Baru
        </h1>

        {/* FORM */}
        <form onSubmit={handleAddUser} className="space-y-5">
          {/* EMAIL */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Email User
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-3 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="contoh: user@email.com"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-3 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="minimal 6 karakter"
            />
          </div>

          {/* ROLE */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full p-3 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              {roleList.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-bold shadow-md transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Menambahkan..." : "Tambah User"}
          </button>
        </form>

        {/* MESSAGE */}
        {message && (
          <div className="mt-5 p-3 rounded-xl text-center text-sm bg-blue-50 text-blue-700 border border-blue-200">
            {message}
          </div>
        )}

        <p className="text-xs text-gray-500 mt-5 text-center">
          Login sebagai: {currentUser?.email}
        </p>
      </div>
    </div>
  );
}
