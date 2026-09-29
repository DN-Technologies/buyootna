"use client";

import React, { useState } from "react";
import { User, Mail, Lock, Loader2, Phone, Briefcase, FileBadge, KeyRound } from "lucide-react";

export interface SignupFormData {
  role: "INDIVIDUAL" | "COMPANY" | "OFFICE";
  name: string;
  email: string | null;
  phone: string;
  whatsapp: string | null;
  password: string;
  licenseNumber: string | null;
}

interface SignupFormProps {
  /** Resolve with `codeSentTo` when a verification code was sent (individuals). */
  onSubmit: (data: SignupFormData) => Promise<void | { codeSentTo: string }>;
  /** Confirms the code sent to `codeSentTo` and finishes signing up. */
  onVerifyCode?: (code: string, codeSentTo: string) => Promise<void>;
  onLoginLinkClick?: () => void;
  defaultRole?: "INDIVIDUAL" | "COMPANY" | "OFFICE";
}

// The API answers validation errors with a list of messages
function apiErrorMessage(err: any, fallback: string): string {
  const message = err?.response?.data?.message;
  if (Array.isArray(message)) return message[0] ?? fallback;
  return message || err?.message || fallback;
}

export function SignupForm({
  onSubmit,
  onVerifyCode,
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
  const [licenseNumber, setLicenseNumber] = useState("");
  const [codeSentTo, setCodeSentTo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const isBusiness = role !== "INDIVIDUAL";
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
    // Companies and offices sign in with their email and need a licence
    if (isBusiness && (!email || !licenseNumber.trim())) {
      setError("البريد الإلكتروني ورقم الترخيص مطلوبان للشركات والمكاتب");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await onSubmit({
        role,
        name,
        email: email || null,
        phone,
        whatsapp: whatsapp || null,
        password,
        licenseNumber: isBusiness ? licenseNumber.trim() : null,
      });
      if (result?.codeSentTo) setCodeSentTo(result.codeSentTo);
    } catch (err: any) {
      setError(apiErrorMessage(err, "حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeSentTo || !onVerifyCode) return;
    setError(null);
    setLoading(true);
    try {
      await onVerifyCode(code.trim(), codeSentTo);
    } catch (err: any) {
      setError(apiErrorMessage(err, "رمز التحقق غير صحيح أو منتهي الصلاحية"));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full pr-10 pl-3 py-2.5 bg-[#0D151F] border border-[#1B2936] rounded-lg text-white placeholder-[#9BA3AF]/40 text-sm focus:outline-none focus:border-accent transition duration-150";

  // Step 2 (individuals): the code sent by SMS or email
  if (codeSentTo) {
    return (
      <div className="w-full max-w-lg p-8 rounded-2xl border border-[#1B2936] bg-[#0A1118]/80 backdrop-blur-xl shadow-2xl space-y-6 text-right" dir="rtl">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">تأكيد الحساب</h2>
          <p className="text-sm text-[#9BA3AF]">
            أدخل رمز التحقق المرسل إلى <span dir="ltr" className="text-white">{codeSentTo}</span>
          </p>
        </div>
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="relative">
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9BA3AF] pointer-events-none">
              <KeyRound className="w-4 h-4" />
            </span>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              dir="ltr"
              className={`${inputClass} text-center tracking-[0.5em]`}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full py-2.5 bg-accent hover:bg-accent-light text-primary font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>تأكيد</span>}
          </button>
          <button
            type="button"
            onClick={() => {
              setCodeSentTo(null);
              setCode("");
              setError(null);
            }}
            className="w-full text-sm text-[#9BA3AF] hover:text-white"
          >
            تعديل البيانات
          </button>
        </form>
      </div>
    );
  }

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
            <label className="text-sm font-medium text-[#ECEFF2]">البريد الإلكتروني{isBusiness ? " *" : ""}</label>
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

        {/* Licence number (companies and offices) */}
        {isBusiness && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#ECEFF2]">رقم الترخيص *</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9BA3AF] pointer-events-none">
                <FileBadge className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="رقم الترخيص التجاري"
                className={inputClass}
                required
              />
            </div>
          </div>
        )}

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
