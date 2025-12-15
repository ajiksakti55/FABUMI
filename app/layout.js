import "./globals.css";
import ClientLayout from "./ClientLayout";
import { Poppins, Roboto_Mono } from "next/font/google"; // Ganti Geist dengan Roboto Mono biar stabil di Next 15+

// Font utama (Poppins)
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

// Font monospace pengganti Geist_Mono
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto-mono",
});

export const metadata = {
  title: "FABUMI",
  description: "Sistem Manajemen Keuangan Modern",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body
        className={`
          ${poppins.variable} 
          ${robotoMono.variable} 
          antialiased 
          bg-gradient-to-br from-gray-50 via-white to-gray-100
          text-gray-800
          min-h-screen
        `}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
