import { Prompt } from "next/font/google";
import "./globals.css";

const promptFont = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-prompt",
});

export const metadata = {
  title: "SCI-TECH VOICE - ระบบรับเรื่องร้องเรียน คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสวนดุสิต",
  description: "ระบบบริหารจัดการและติดตามเรื่องร้องเรียน คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสวนดุสิต",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        {/* Tailwind CSS CDN fallback เพื่อให้สไตล์ทำงาน 100% บนทุกสภาพแวดล้อม Windows */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className={`${promptFont.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
