"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase_setup";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [access, setAccess] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingAccess, setLoadingAccess] = useState(true);
  const [configError, setConfigError] = useState(false);

  useEffect(() => {
    if (!auth) {
      console.error("Firebase Auth not initialized. Check firebase_setup.js");

      // ✅ Perubahan penting: tunda setState agar tidak dianggap sinkron oleh React
      Promise.resolve().then(() => {
        setConfigError(true);
        setLoadingUser(false);
        setLoadingAccess(false);
      });

      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoadingUser(false);

      if (!user) {
        document.cookie = "firebaseToken=; Max-Age=0; path=/";
        setCurrentUser(null);
        setRole(null);
        setAccess([]);
        setLoadingAccess(false);
        return;
      }

      setCurrentUser(user);

      const token = await user.getIdToken();
      document.cookie = `firebaseToken=${token}; path=/; max-age=3600;`;

      setLoadingAccess(true);
      try {
        const res = await fetch("/api/role", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setRole(data.role || null);
          setAccess(data.access || []);
        } else {
          console.warn("API role tidak OK:", res.status);
          setRole(null);
          setAccess([]);
        }
      } catch (err) {
        console.error("Gagal mengambil role:", err);
        setRole(null);
        setAccess([]);
      }

      setLoadingAccess(false);
    });

    return () => unsubscribe();
  }, []); // ✅ tidak perlu ubah dependency

  // LOGOUT
  const logout = async () => {
    await signOut(auth);
    document.cookie = "firebaseToken=; Max-Age=0; path=/";
    setCurrentUser(null);
    setRole(null);
    setAccess([]);
    setLoadingAccess(false);
  };

  const value = {
    currentUser,
    role,
    access,
    loadingAccess,
    loadingUser,
    logout,
    configError,
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-gray-300 text-lg">
          Loading . . .
        </div>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-xl font-semibold text-red-500 p-8 bg-black rounded-xl text-center">
          🚨 <strong>FATAL ERROR KONFIGURASI</strong> 🚨
          <p className="text-sm mt-3 text-red-400">
            Periksa file <code>firebase_setup.js</code>
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser && loadingAccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-gray-300 text-lg">Loading . . .</div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
