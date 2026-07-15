"use client";

import React, { useState } from "react";
import { Mail, Loader2, ArrowRight } from "lucide-react";

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  onBackToLoginLinkClick?: () => void;
}

export function ForgotPasswordForm({
  onSubmit,
  onBackToLoginLinkClick,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("يرجى إدخال البريد الإلكتروني");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit(email);
      setSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "حدث خطأ أثناء إرسال طلب استعادة كلمة المرور."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md p-8 rounded-2xl border border-[#1B2936] bg-[#0A1118]/80 backdrop-blur-xl shadow-2xl space-y-6 text-right" dir="rtl">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">تفقد بريدك الإلكتروني</h2>
          <p className="text-sm text-[#9BA3AF]">
            لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى <strong>{email}</strong>. يرجى اتباع التعليمات المرفقة بالرسالة.
          </p>
        </div>

        <button
          onClick={onBackToLoginLinkClick}
          type="button"
          className="w-full py-2.5 bg-[#0D151F] border border-[#1B2936] text-[#ECEFF2] hover:bg-[#1B2936]/40 font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لتسجيل الدخول</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 rounded-2xl border border-[#1B2936] bg-[#0A1118]/80 backdrop-blur-xl shadow-2xl space-y-6 text-right" dir="rtl">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">استعادة كلمة المرور</h2>
        <p className="text-sm text-[#9BA3AF]">أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً لإعادة تعيين كلمة المرور</p>
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
              required
            />
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
              <span>جاري الإرسال...</span>
            </>
          ) : (
            <span>أرسل رابط الاستعادة</span>
          )}
        </button>
      </form>

      {onBackToLoginLinkClick && (
        <div className="text-center">
          <button
            onClick={onBackToLoginLinkClick}
            type="button"
            className="text-sm text-[#9BA3AF] hover:text-[#ECEFF2] transition duration-150 flex items-center justify-center gap-1 mx-auto"
          >
            <span>العودة لتسجيل الدخول</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
