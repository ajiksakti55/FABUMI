import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CTR BISA",
  description: "yee kan",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${geistSans.variable} ${geistMono.variable} antialiased bg-transparent`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
