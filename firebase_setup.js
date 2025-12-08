import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Konfigurasi Firebase dibaca dari variabel lingkungan (NEXT_PUBLIC_...)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Cek jika project ID hilang (validasi dasar)
if (!firebaseConfig.projectId) {
  console.error(
    "ERROR FATAL: NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing! Konfigurasi Firebase tidak ditemukan."
  );
  // Kita tidak akan melempar error, tapi membiarkan app tetap null
}

// Inisialisasi Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Dapatkan layanan Auth dan Firestore.
// Jika inisialisasi gagal (misalnya project ID hilang), ini akan menjadi null.
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

// Ekspor instance Firebase App dan Auth
export { app, auth, db };
