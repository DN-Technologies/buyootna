"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Languages, LogIn } from "lucide-react";
import { t } from "@/data/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { chrome } from "@/lib/chrome";
import { DOCS_ROLES, ROLE_LABELS, type DocsRole } from "@/lib/access";

const inputClass =
  "mt-1 w-full rounded-lg border border-[#1B2936] bg-[#0F1E2E] px-3 py-2 text-sm text-white outline-none focus:border-accent";

export default function LoginPage() {
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const c = chrome[lang];
  const [role, setRole] = useState<DocsRole>("QA");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, password, name }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          message?: string | string[];
        };
        const message = Array.isArray(data.message)
          ? data.message[0]
          : data.message;
        setError(message ?? c.loginFailed);
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError(c.loginFailed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-[#1B2936] bg-[#0A1118]/80 p-6 shadow-lg shadow-black/20"
      >
        <div className="flex items-center justify-between">
          <Image
            src="/logo-icon.png"
            alt="Buyootna Logo"
            width={36}
            height={36}
            className="object-contain"
          />
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="flex items-center gap-1.5 text-xs text-[#B9C3CC] hover:text-white"
          >
            <Languages className="h-4 w-4" />
            {lang === "en" ? "عربي" : "EN"}
          </button>
        </div>

        <h1 className="mt-4 text-xl font-bold text-white">{c.loginTitle}</h1>
        <p className="mt-1 text-sm text-[#B9C3CC]">{c.loginSubtitle}</p>

        <label className="mt-5 block text-sm text-[#DCE1E6]">
          {c.loginRole}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as DocsRole)}
            className={inputClass}
          >
            {DOCS_ROLES.map((r) => (
              <option key={r} value={r}>
                {t(ROLE_LABELS[r], lang)}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-3 block text-sm text-[#DCE1E6]">
          {c.loginPassword}
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="mt-3 block text-sm text-[#DCE1E6]">
          {c.loginName}
          <input
            required
            minLength={2}
            maxLength={60}
            value={name}
            placeholder={c.loginNamePlaceholder}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </label>

        {error && (
          <p role="alert" className="mt-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#0A1118] transition-colors hover:bg-accent-light disabled:opacity-60"
        >
          <LogIn className="h-4 w-4 rtl:rotate-180" />
          {c.loginSubmit}
        </button>
      </form>
    </main>
  );
}
