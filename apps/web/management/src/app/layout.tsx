import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "بيوتنا للإدارة — نظام إدارة العمليات والطلبات",
  description: "النظام الداخلي لإدارة عمليات بيوتنا، مراجعة طلبات الشركات والمكاتب، وتدقيق الإعلانات والفوترة.",
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
      <body className="min-h-full flex flex-col font-sans bg-[#0A1118] text-[#ECEFF2]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
