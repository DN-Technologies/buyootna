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
  title: "بيوتنا | منصة العقارات والخدمات الأولى في الكويت",
  description: "تطبيق بيوتنا يتيح لك البحث عن عقارات للبيع أو الإيجار أو البدل في الكويت، بالإضافة إلى تصفح وطلب خدمات الصيانة والمقاولات من شركات معتمدة.",
  keywords: ["بيوتنا", "عقارات الكويت", "شقق للإيجار", "منازل للبيع", "بدل عقاري", "مقاولات الكويت", "صيانة منازل"],
  openGraph: {
    title: "بيوتنا | منصة العقارات والخدمات الأولى في الكويت",
    description: "تطبيق بيوتنا يتيح لك البحث عن عقارات للبيع أو الإيجار أو البدل في الكويت، بالإضافة إلى تصفح وطلب خدمات الصيانة والمقاولات من شركات معتمدة.",
    images: ["/logo.png"],
  },
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
      className={`${cairo.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-[#0A1118] text-[#ECEFF2]" suppressHydrationWarning>{children}</body>
    </html>
  );
}
