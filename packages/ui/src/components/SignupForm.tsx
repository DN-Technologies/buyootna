"use client";

import React, { useState } from "react";
import { User, Mail, Lock, Loader2, Phone, Briefcase } from "lucide-react";

interface SignupFormProps {
  onSubmit: (data: any) => Promise<void>;
  onLoginLinkClick?: () => void;
  defaultRole?: "INDIVIDUAL" | "COMPANY" | "OFFICE";
}

export function SignupForm({
  onSubmit,
  onLoginLinkClick,
  defaultRole = "INDIVIDUAL",
}: SignupFormProps) {
  const [role, setRole] = useState<"INDIVIDUAL" | "COMPANY" | "OFFICE">(defaultRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !password || !confirmPassword) {
      setError("يرجى ملء جميع الحقول الإلزامية");
      return;
    }
    if (password !== confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit({ role, name, email: email || null, phone, whatsapp: whatsapp || null, password });
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg p-8 rounded-2xl border border-[#1B2936] bg-[#0A1118]/80 backdrop-blur-xl shadow-2xl space-y-6 text-right" dir="rtl">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">إنشاء حساب جديد</h2>
        <p className="text-sm text-[#9BA3AF]">انضم إلى منصة بيوتنا العقارية</p>
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Selection */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#ECEFF2]">نوع الحساب</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "INDIVIDUAL", label: "فرد" },
              { id: "COMPANY", label: "شركة" },
              { id: "OFFICE", label: "مكتب عقاري" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRole(opt.id as any)}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition duration-150 cursor-pointer ${
                  role === opt.id
                    ? "bg-accent border-accent text-primary"
                    : "bg-[#0D151F] border-[#1B2936] text-[#9BA3AF] hover:border-[#1B2936]/80"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#ECEFF2]">الاسم بالكامل *</label>
          <div className="relative">
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9BA3AF] pointer-events-none">
              <User className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: أحمد محمد"
              className="w-full pr-10 pl-3 py-2.5 bg-[#0D151F] border border-[#1B2936] rounded-lg text-white placeholder-[#9BA3AF]/40 text-sm focus:outline-none focus:border-accent transition duration-150"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#ECEFF2]">البريد الإلكتروني</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9BA3AF] pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pr-10 pl-3 py-2.5 bg-[#0D151F] border border-[#1B2936] rounded-lg text-white placeholder-[#9BA3AF]/40 text-sm focus:outline-none focus:border-accent transition duration-150"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#ECEFF2]">رقم الهاتف *</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9BA3AF] pointer-events-none">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="96512345678"
                className="w-full pr-10 pl-3 py-2.5 bg-[#0D151F] border border-[#1B2936] rounded-lg text-white placeholder-[#9BA3AF]/40 text-sm focus:outline-none focus:border-accent transition duration-150"
                required
              />
            </div>
          </div>
        </div>

        {/* WhatsApp (Optional) */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#ECEFF2]">رقم الواتساب (اختياري)</label>
          <div className="relative">
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9BA3AF] pointer-events-none">
              <Phone className="w-4 h-4" />
            </span>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="96512345678"
              className="w-full pr-10 pl-3 py-2.5 bg-[#0D151F] border border-[#1B2936] rounded-lg text-white placeholder-[#9BA3AF]/40 text-sm focus:outline-none focus:border-accent transition duration-150"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#ECEFF2]">كلمة المرور *</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9BA3AF] pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pr-10 pl-3 py-2.5 bg-[#0D151F] border border-[#1B2936] rounded-lg text-white placeholder-[#9BA3AF]/40 text-sm focus:outline-none focus:border-accent transition duration-150"
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#ECEFF2]">تأكيد كلمة المرور *</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9BA3AF] pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pr-10 pl-3 py-2.5 bg-[#0D151F] border border-[#1B2936] rounded-lg text-white placeholder-[#9BA3AF]/40 text-sm focus:outline-none focus:border-accent transition duration-150"
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-accent hover:bg-accent-light text-primary font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جاري إنشاء الحساب...</span>
            </>
          ) : (
            <span>إنشاء الحساب</span>
          )}
        </button>
      </form>

      {onLoginLinkClick && (
        <div className="text-center text-sm text-[#9BA3AF]">
          لديك حساب بالفعل؟{" "}
          <button
            onClick={onLoginLinkClick}
            type="button"
            className="text-accent hover:text-accent-light font-semibold transition duration-150"
          >
            تسجيل الدخول
          </button>
        </div>
      )}
    </div>
  );
}
