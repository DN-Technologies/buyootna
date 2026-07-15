"use client";

import { useRouter } from "next/navigation";
import { LoginForm } from "@buyootna/ui";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (data: any) => {
    // API endpoint call
    const res = await api.post("/auth/login", {
      emailOrPhone: data.identifier,
      password: data.password,
    });
    
    if (res.data && res.data.token) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      router.push("/");
    }
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
