"use client";

import { useRouter } from "next/navigation";
import { SignupForm } from "@buyootna/ui";
import { api } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();

  const handleSignup = async (data: any) => {
    // API endpoint call
    const res = await api.post("/auth/register", data);
    
    if (res.data && res.data.token) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      router.push("/");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#0A1118]">
      <SignupForm
        onSubmit={handleSignup}
        onLoginLinkClick={() => router.push("/auth/login")}
        defaultRole="INDIVIDUAL"
      />
    </div>
  );
}
