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
      Promise.resolve().then(() => {
        setConfigError(true);
        setLoadingUser(false);
        setLoadingAccess(false);
      });
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoadingUser(false);

      // Tidak ada user → hapus cookie dan reset state
      if (!user) {
        document.cookie = "firebaseToken=; Max-Age=0; path=/";
        setCurrentUser(null);
        setRole(null);
        setAccess([]);
        setLoadingAccess(false);
        return;
      }

      // Ada user → update cookie dan ambil role
      try {
        const token = await user.getIdToken();

        const isLocal = window.location.hostname === "localhost";
        const cookieStr = isLocal
          ? `firebaseToken=${token}; path=/; max-age=3600; SameSite=Lax`
          : `firebaseToken=${token}; path=/; max-age=3600; SameSite=None; Secure`;

        document.cookie = cookieStr;

        setCurrentUser(user);
        setLoadingAccess(true);

        // Ambil role dari API
        const res = await fetch("/api/role", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setRole(data.role || null);
          setAccess(data.access || []);
        } else {
          setRole(null);
          setAccess([]);
        }
      } catch {
        setRole(null);
        setAccess([]);
      } finally {
        setLoadingAccess(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Logout
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
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-300">
        <div>Loading...</div>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-400">
        <div className="text-center">
          <p>🚨 <strong>FATAL ERROR KONFIGURASI</strong></p>
          <p className="mt-2 text-sm">Periksa file <code>firebase_setup.js</code></p>
        </div>
      </div>
    );
  }

  if (!currentUser && loadingAccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-300">
        <div>Loading...</div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
