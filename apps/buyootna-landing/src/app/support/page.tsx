import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Phone,
  MessageSquare,
  Mail,
  HelpCircle,
} from 'lucide-react'

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#0A1118] text-[#ECEFF2] py-12 px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-150 bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto z-10 relative">
        {/* Back navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-accent mb-8 transition-colors group"
        >
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          الرجوع للرئيسية
        </Link>

        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="p-4 rounded-2xl bg-accent/10 text-accent">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            الدعم الفني وتواصل معنا
          </h1>
          <div className="w-16 h-1 bg-primary rounded-full mt-2" />
        </div>

        {/* Intro text */}
        <p className="text-center text-zinc-300 max-w-xl mx-auto leading-relaxed mb-12">
          لا تتردد في الاتصال بنا؛ سواء كان لديك اقتراح لتحسين خدماتنا، أو شكوى
          ترغب في مناقشتها، أو مشكلة تحتاج إلى حل فني. نحن هنا لخدمتكم على مدار
          الساعة.
        </p>

        {/* Support Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {/* WhatsApp Card */}
          <a
            href="https://wa.me/96599507399"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center text-center gap-4 p-8 rounded-3xl bg-primary/30 border border-[#1B2936]/50 hover:border-[#4CD964]/40 hover:bg-primary/60 transition-all duration-350 shadow-md"
          >
            <div className="p-4 rounded-2xl bg-[#4CD964]/10 text-[#4CD964] group-hover:bg-[#4CD964] group-hover:text-white transition-all duration-300">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white">واتساب الدعم</h3>
            <p className="text-sm text-[#4CD964] font-medium">99507399</p>
            <p className="text-xs text-zinc-500">تواصل مباشر وسريع</p>
          </a>

          {/* Support Phone Card */}
          <a
            href="tel:99507399"
            className="group flex flex-col items-center text-center gap-4 p-8 rounded-3xl bg-primary/30 border border-[#1B2936]/50 hover:border-accent/40 hover:bg-primary/60 transition-all duration-350 shadow-md"
          >
            <div className="p-4 rounded-2xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-primary-dark transition-all duration-300">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white">اتصال هاتفي</h3>
            <p className="text-sm text-accent font-medium">99507399</p>
            <p className="text-xs text-zinc-500">دعم مباشر لحل المشكلات</p>
          </a>

          {/* Email Support Card */}
          <a
            href="mailto:buyootna@hotmail.com"
            className="group flex flex-col items-center text-center gap-4 p-8 rounded-3xl bg-primary/30 border border-[#1B2936]/50 hover:border-[#4285F4]/40 hover:bg-[#0F1E2E]/60 transition-all duration-350 shadow-md"
          >
            <div className="p-4 rounded-2xl bg-[#4285F4]/10 text-[#4285F4] group-hover:bg-[#4285F4] group-hover:text-white transition-all duration-300">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white">البريد الإلكتروني</h3>
            <p className="text-sm text-[#4285F4] font-medium truncate max-w-45">
              buyootna@hotmail.com
            </p>
            <p className="text-xs text-zinc-500">
              للمراسلات العامة والاقتراحات
            </p>
          </a>
        </div>

        {/* Footer */}
        <div className="mt-20 text-center text-xs text-zinc-500 flex items-center justify-center gap-3">
          <Image
            src="/logo.png"
            alt="Buyootna Logo"
            width={24}
            height={24}
            className="rounded-md border border-accent/30"
          />
          <span>
            &copy; {new Date().getFullYear()} بيوتنا. جميع الحقوق محفوظة.
          </span>
        </div>
      </div>
    </div>
  )
}
