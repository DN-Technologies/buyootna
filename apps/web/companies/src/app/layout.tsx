import type { Metadata } from "next";
import "./globals.css";

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
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-[#0A1118] text-[#ECEFF2]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
