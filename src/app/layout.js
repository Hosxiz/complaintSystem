import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ระบบรับเรื่องร้องเรียน (Complaint Management System)",
  description: "ระบบบริหารจัดการเรื่องร้องเรียนระดับองค์กร",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        {/* Tailwind CSS CDN fallback เพื่อให้สไตล์ทำงาน 100% บนทุกสภาพแวดล้อม Windows */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
