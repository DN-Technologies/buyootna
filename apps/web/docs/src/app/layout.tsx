import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Buyootna QA Docs",
  description:
    "QA engineer user stories and test scenarios for the Buyootna platform — mobile app, web portals, and API.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="flex h-full min-h-screen font-sans bg-[#0A1118] text-[#ECEFF2]"
        suppressHydrationWarning
      >
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-8 py-10">{children}</div>
        </main>
      </body>
    </html>
  );
}
