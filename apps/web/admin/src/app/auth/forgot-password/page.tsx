"use client";

import { useRouter } from "next/navigation";
import { ForgotPasswordForm } from "@buyootna/ui";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const handleForgotPassword = async (email: string) => {
    await api.post("/auth/forgot-password", { email });
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#0A1118]">
      <ForgotPasswordForm
        onSubmit={handleForgotPassword}
        onBackToLoginLinkClick={() => router.push("/auth/login")}
      />
    </div>
  );
}
