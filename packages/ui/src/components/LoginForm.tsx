"use client";

import React, { useState } from "react";
import { Mail, Lock, Loader2, Phone } from "lucide-react";

interface LoginFormProps {
  onSubmit: (data: any) => Promise<void>;
  onRegisterLinkClick?: () => void;
  onForgotPasswordLinkClick?: () => void;
  allowedRoles?: ("INDIVIDUAL" | "COMPANY" | "OFFICE")[];
}

export function LoginForm({
  onSubmit,
  onRegisterLinkClick,
  onForgotPasswordLinkClick,
  allowedRoles,
}: LoginFormProps) {
  const [identifier, setIdentifier] = useState(""); // email or phone
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit({ identifier, password });
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl border border-[#1B2936] bg-[#0A1118]/80 backdrop-blur-xl shadow-2xl space-y-6 text-right" dir="rtl">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">تسجيل الدخول</h2>
        <p className="text-sm text-[#9BA3AF]">أهلاً بك مجدداً في بيوتنا</p>
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#ECEFF2]">البريد الإلكتروني أو الهاتف</label>
          <div className="relative">
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9BA3AF] pointer-events-none">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="name@example.com أو 96512345678"
              className="w-full pr-10 pl-3 py-2.5 bg-[#0D151F] border border-[#1B2936] rounded-lg text-white placeholder-[#9BA3AF]/40 text-sm focus:outline-none focus:border-accent transition duration-150"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-[#ECEFF2]">كلمة المرور</label>
            {onForgotPasswordLinkClick && (
              <button
                type="button"
                onClick={onForgotPasswordLinkClick}
                className="text-xs text-accent hover:text-accent-light transition duration-150"
              >
                نسيت كلمة المرور؟
              </button>
            )}
          </div>
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-accent hover:bg-accent-light text-primary font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جاري التحميل...</span>
            </>
          ) : (
            <span>تسجيل الدخول</span>
          )}
        </button>
      </form>

      {onRegisterLinkClick && (
        <div className="text-center text-sm text-[#9BA3AF]">
          ليس لديك حساب؟{" "}
          <button
            onClick={onRegisterLinkClick}
            type="button"
            className="text-accent hover:text-accent-light font-semibold transition duration-150"
          >
            إنشاء حساب جديد
          </button>
        </div>
      )}
    </div>
  );
}
