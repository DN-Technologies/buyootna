import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "بيوتنا لوحة التحكم — الإدارة العامة للنظام",
  description: "لوحة التحكم الإدارية العليا للتحكم الشامل بالمستخدمين، الصلاحيات، الإعدادات، والتقارير المالية.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
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
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-[#F9FAFB] text-[#111111] antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
