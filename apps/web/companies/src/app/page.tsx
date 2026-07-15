import Link from "next/link";
import { ArrowLeft, LayoutDashboard, Shield, Building, Building2, Eye } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl w-full p-8 rounded-2xl border border-[#1B2936] bg-[#0A1118]/80 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-accent">
          
          <Building className="w-8 h-8" />
          
          
          
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">بيوتنا للشركات</h1>
          <p className="text-accent text-lg font-medium">لوحة تحكم الشركات العقارية والمقاولات</p>
        </div>

        <p className="text-[#9BA3AF] text-sm leading-relaxed max-w-md mx-auto">
          لوحة التحكم المخصصة للشركات لعرض وتحديث عقاراتهم، وإدارة طلبات الصيانة والمقاولات والتواصل مع العملاء.
        </p>

        <div className="pt-4 border-t border-[#1B2936] flex flex-wrap gap-4 justify-center">
          <Link href="/auth/login" className="px-5 py-2.5 rounded-lg font-semibold bg-accent text-primary hover:bg-accent-light transition duration-200">
            تسجيل الدخول
          </Link>
          <Link href="/auth/signup" className="px-5 py-2.5 rounded-lg font-semibold border border-[#1B2936] hover:bg-[#1B2936]/40 transition duration-200">
            حساب جديد
          </Link>
        </div>

        <div className="text-xs text-[#9BA3AF]/50">
          منفذ التشغيل: 3002 • بيئة التطوير Next.js 16
        </div>
      </div>
    </div>
  );
}
