import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { LanguageProvider } from "@/contexts/LanguageContext";

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
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body
        className="flex h-full min-h-screen font-sans bg-[#0A1118] text-[#ECEFF2]"
        suppressHydrationWarning
      >
        <LanguageProvider>
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-4xl px-8 py-10">{children}</div>
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
