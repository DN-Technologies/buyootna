"use client";

import { useRouter } from "next/navigation";
import { LoginForm, createPortalAuth } from "@buyootna/ui";
import { api } from "@/lib/api";

const auth = createPortalAuth(api);

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (data: { identifier: string; password: string }) => {
    await auth.login(data.identifier, data.password);
    router.push("/");
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#0A1118]">
      <LoginForm
        onSubmit={handleLogin}
        onRegisterLinkClick={() => router.push("/auth/signup")}
        onForgotPasswordLinkClick={() => router.push("/auth/forgot-password")}
      />
    </div>
  );
}
