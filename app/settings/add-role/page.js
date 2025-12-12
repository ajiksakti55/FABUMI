"use client";

import { useState } from "react";

export default function AddRolePage() {
  const [roleName, setRoleName] = useState("");
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [message, setMessage] = useState("");

  const availableMenus = [
    { id: "dashboard", name: "Dashboard" }, 
    { id: "transaksi", name: "transaksi" },    
    { id: "kategori", name: "kategori" }, 
    { id: "budget", name: "budget" },    
    { id: "add-users", name: "Tambah User" },
    { id: "edit-users", name: "Edit User" },
    { id: "add-role", name: "Tambah Role" },
    { id: "edit-role", name: "Edit Role" },
  ];

  const toggleMenu = (id) => {
    if (selectedMenus.includes(id)) {
      setSelectedMenus(selectedMenus.filter((m) => m !== id));
    } else {
      setSelectedMenus([...selectedMenus, id]);
    }
  };

  const submitRole = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/createRole", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roleName,
        allowedMenus: selectedMenus,
      }),
    });

    const data = await res.json();
    if (!res.ok) return setMessage("❌ " + data.error);

    setMessage("✅ Role berhasil ditambahkan!");
    setRoleName("");
    setSelectedMenus([]);
  };

  return (
    <div className="flex justify-center w-full py-10 px-4">
      <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl border">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Tambah Role
        </h1>

        {message && (
          <div className="mb-5 p-4 rounded-lg text-sm border bg-gray-50 text-gray-800">
            {message}
          </div>
        )}

        <form onSubmit={submitRole} className="space-y-6">
          {/* INPUT ROLE NAME */}
          <div>
            <label className="font-semibold text-gray-700 ">Nama Role</label>
            <input
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full p-3 mt-1 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
              placeholder="Misal: supervisor"
              required
            />
          </div>

          {/* MENU ACCESS CHECKBOX */}
          <div>
            <label className="font-semibold text-gray-700">Akses Menu</label>

            <div className="grid grid-cols-2 gap-3 mt-3">
              {availableMenus.map((menu) => (
                <label
                  key={menu.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition
                    ${
                      selectedMenus.includes(menu.id)
                        ? "bg-blue-100 border-blue-500"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={selectedMenus.includes(menu.id)}
                    onChange={() => toggleMenu(menu.id)}
                  />
                  <span className="text-gray-800">{menu.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 transition">
            Simpan Role
          </button>
        </form>
      </div>
    </div>
  );
}
