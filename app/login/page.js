"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../auth-context";
import { auth } from "../../firebase_setup";
import Image from "next/image";
import { signInWithEmailAndPassword } from "firebase/auth";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { currentUser, loading, configError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Redirect otomatis jika sudah login
  useEffect(() => {
    if (!loading && currentUser) {
      router.replace("/");
    }
  }, [currentUser, loading, router]);

  // LOGIN UTAMA
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!auth) {
      setError(
        "Layanan otentikasi tidak tersedia. Cek konfigurasi Firebase Anda."
      );
      return;
    }

    try {
      // LOGIN
      await signInWithEmailAndPassword(auth, email, password);

      // ————————————————
      // 🔥 AMBIL ROLE DARI BACKEND
      // ————————————————
      const user = auth.currentUser;

      if (user) {
        const token = await user.getIdToken(true);

        const res = await fetch("/api/getRole", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (data.role) {
          // simpan cookie untuk Sidebar
          document.cookie = `firebaseRole=${data.role}; path=/;`;
        }
      }

      // Redirect otomatis oleh useEffect
    } catch (err) {
      let errorMessage = err.message;
      if (err.code) {
        errorMessage = err.code
          .replace("auth/", "")
          .replace(/-/g, " ")
          .toUpperCase();
      }
      setError("Gagal: " + errorMessage);
    }
  };

  // Firewall error config
  if (configError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-red-700 p-8 bg-white rounded-xl shadow-lg text-center">
          🚨 <strong>ERROR KONFIGURASI FIREBASE</strong> 🚨
          <p className="text-sm mt-2">
            Cek file <code>.env.local</code> Anda lalu restart server Next.js.
          </p>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center p-4"
        style={{ backgroundImage: "url('/bg-login.jpg')" }}
      >
        <div className="animate-pulse text-white text-xl">Loading . . .</div>
      </div>
    );
  }

  // Jika sudah login, jangan tampilkan form
  if (currentUser) {
    return null;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center  p-4"
      style={{ backgroundImage: "url('/bg-login.jpg')" }}
    >
      <div
        className="bg-white/50 backdrop-blur-xl 
        border border-white/80 
        shadow-2xl
        p-10 rounded-3xl 
        w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center text-black pb-2">
          Login
        </h2>

        <p className="text-center text-gray-700 pb-2 text-[14px]">
          Hubungi admin untuk mendapatkan account
        </p>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-black">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukan email"
              className="mt-1 block w-full px-3 py-2 border border-black rounded-md shadow-sm text-black focus:ring-black focus:border-black"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-black">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 block w-full px-3 py-2 border border-black rounded-md shadow-sm focus:ring-white-500 focus:border-white-2000 text-black"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-11 -translate-y-1/2 text-gray-600"
            >
              {showPassword ? (
                <Image
                  src="/icons/show.png"
                  width={20}
                  height={20}
                  alt="show password"
                />
              ) : (
                <Image
                  src="/icons/hide.png"
                  width={20}
                  height={20}
                  alt="hide password"
                />
              )}
            </button>
          </div>

          {/* Tombol Login */}
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
