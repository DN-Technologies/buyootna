"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, User, LogOut, Menu, X } from "lucide-react";
import SideNav from "@/components/SideNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen flex bg-[#F9FAFB] text-[#111111]" dir="rtl">
      {/* Desktop Sidebar (Always Visible) */}
      <div className="hidden md:block shrink-0">
        <SideNav />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Menu */}
      <div className={`fixed inset-y-0 right-0 z-50 transform ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-200 ease-in-out md:hidden`}>
        <SideNav />
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-[70px] bg-white border-b border-[#ECECEC] flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center gap-4">
            {/* Toggle Mobile Navigation */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-[#6B6A6A] hover:bg-[#F8F9FA] transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h2 className="font-['Cairo'] font-bold text-lg text-[#15304D]">لوحة التحكم العامة</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Indicator */}
            <button className="p-2 rounded-full text-[#6B6A6A] hover:bg-[#F8F9FA] transition relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>

            {/* Profile Menu Placeholder */}
            <div className="flex items-center gap-3 pl-2 border-l border-[#ECECEC]">
              <div className="w-9 h-9 rounded-full bg-[#15304D]/10 flex items-center justify-center text-[#15304D]">
                <User className="w-5 h-5" />
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold font-['Cairo'] text-[#111111]">المدير العام</p>
                <p className="text-[10px] text-[#6B6A6A]">admin@buyootna.cloud</p>
              </div>
            </div>

            {/* Log Out */}
            <button 
              onClick={handleLogout}
              className="p-2 rounded-full text-[#6B6A6A] hover:text-red-500 hover:bg-red-50 transition"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
