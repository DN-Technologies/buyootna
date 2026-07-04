"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer id="download" className="bg-[#070D14] border-t border-[#1B2936]/40 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#C5A880]/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Download CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center text-center gap-8 relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
          جاهز لتجربة تطبيق{" "}
          <span className="bg-gradient-to-l from-[#C5A880] to-[#DFCDAB] bg-clip-text text-transparent">
            بيوتنا؟
          </span>
        </h2>
        <p className="text-base text-zinc-400 max-w-xl leading-relaxed">
          حمل التطبيق الآن مجاناً وابدأ بالبحث عن عقارك القادم أو اطلب الخدمات المناسبة لمنزلك بشكل فوري وموثوق.
        </p>

        {/* App download badges */}
        <div className="flex flex-col sm:flex-row gap-4 mt-2 w-full sm:w-auto">
          {/* App Store Button */}
          <a
            href="#"
            className="flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-300 group shadow-lg"
          >
            <svg className="w-7 h-7 text-white fill-current group-hover:scale-105 transition-transform duration-300" viewBox="0 0 24 24">
              <path d="M18.71,19.5C17.88,20.74,17,21.95,15.66,22c-1.31,0-1.72-.8-3.22-.8s-2,.78-3.25.82C7.89,22,6.9,20.65,6.07,19.43,4.37,17,3.07,12.5,4.82,9.47A5.27,5.27,0,0,1,9.27,6.8c1.37,0,2.67.95,3.51.95s2.43-1.15,4.06-1A5.33,5.33,0,0,1,21,9.45c-1.34.82-1.54,2.56-.2,3.62a3.86,3.86,0,0,1,1.15,2.44,3.87,3.87,0,0,1-1.3,2.53M15.91,4.17A4.47,4.47,0,0,0,17,1.07a4.57,4.57,0,0,0-3,1.57,4.14,4.14,0,0,0-1.16,3A3.79,3.79,0,0,0,15.91,4.17Z" />
            </svg>
            <div className="flex flex-col items-start leading-none text-right">
              <span className="text-[10px] text-zinc-400 font-medium mb-1">حمل التطبيق من</span>
              <span className="text-sm font-semibold text-white">App Store</span>
            </div>
          </a>

          {/* Google Play Button */}
          <a
            href="#"
            className="flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-300 group shadow-lg"
          >
            <svg className="w-7 h-7 text-white fill-current group-hover:scale-105 transition-transform duration-300" viewBox="0 0 24 24">
              <path d="M5,3.06a1,1,0,0,0-.46.83V20.11a1,1,0,0,0,.46.83L14.77,12Z M17.65,9.66,15.77,8.57,12,12l3.77,3.43,1.88-1.09A2.43,2.43,0,0,0,19,12,2.43,2.43,0,0,0,17.65,9.66Z M5.81,3.49l9.16,5.31L12,12ZM5.81,20.51,12,12l2.97,3.18-9.16,5.31A1,1,0,0,0,5.81,20.51Z" />
            </svg>
            <div className="flex flex-col items-start leading-none text-right">
              <span className="text-[10px] text-zinc-400 font-medium mb-1">احصل عليه من</span>
              <span className="text-sm font-semibold text-white">Google Play</span>
            </div>
          </a>
        </div>
      </div>

      {/* Footer Info & Copyright */}
      <div className="max-w-7xl mx-auto px-6 py-10 border-t border-[#1B2936]/20 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection("hero")}>
          <Image
            src="/logo.png"
            alt="Buyootna Logo"
            width={32}
            height={32}
            className="rounded-lg shadow-md border border-[#C5A880]/30"
          />
          <span className="text-lg font-bold tracking-tight text-white">بيوتنا</span>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6">
          <Link href="/privacy" className="text-xs text-zinc-500 hover:text-[#C5A880] transition-colors">
            سياسة الخصوصية
          </Link>
          <Link href="/support" className="text-xs text-zinc-500 hover:text-[#C5A880] transition-colors">
            الدعم الفني
          </Link>
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} بيوتنا. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
