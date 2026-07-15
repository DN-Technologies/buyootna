import type { Metadata } from "next";
import { Cairo, Inter } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "بيوتنا للشركات — لوحة تحكم الشركات العقارية والمقاولات",
  description: "لوحة التحكم المخصصة للشركات لعرض وتحديث عقاراتهم، وإدارة طلبات الصيانة والمقاولات والتواصل مع العملاء.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-[#0A1118] text-[#ECEFF2]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
