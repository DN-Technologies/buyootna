"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-350 ${
        isScrolled
          ? "bg-[#0A1118]/80 backdrop-blur-md border-b border-[#1B2936]/40 shadow-lg py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection("hero")}>
          <Image
            src="/logo.png"
            alt="Buyootna Logo"
            width={40}
            height={40}
            className="rounded-xl shadow-md border border-[#C5A880]/30"
          />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-l from-white via-zinc-100 to-[#C5A880] bg-clip-text text-transparent">
            بيوتنا
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("hero")}
            className="text-sm font-medium text-zinc-300 hover:text-[#C5A880] transition-colors"
          >
            الرئيسية
          </button>
          <button
            onClick={() => scrollToSection("features")}
            className="text-sm font-medium text-zinc-300 hover:text-[#C5A880] transition-colors"
          >
            المميزات
          </button>
          <button
            onClick={() => scrollToSection("showcase")}
            className="text-sm font-medium text-zinc-300 hover:text-[#C5A880] transition-colors"
          >
            معرض التطبيق
          </button>
          <button
            onClick={() => scrollToSection("download")}
            className="text-sm font-medium text-zinc-300 hover:text-[#C5A880] transition-colors"
          >
            التحميل
          </button>
        </div>

        {/* CTA Button */}
        <div>
          <button
            onClick={() => scrollToSection("download")}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-[#070D14] bg-[#C5A880] hover:bg-[#DFCDAB] hover:shadow-lg hover:shadow-[#C5A880]/20 transition-all duration-300 active:scale-95"
          >
            تحميل التطبيق
          </button>
        </div>
      </div>
    </nav>
  );
}
