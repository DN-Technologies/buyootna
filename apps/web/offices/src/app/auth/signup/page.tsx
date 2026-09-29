"use client";

import { useRouter } from "next/navigation";
import { SignupForm, createPortalAuth } from "@buyootna/ui";
import { api } from "@/lib/api";

const auth = createPortalAuth(api);

export default function SignupPage() {
  const router = useRouter();

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#0A1118]">
      <SignupForm
        onSubmit={async (data) => {
          const result = await auth.signup(data);
          if (!result) router.push("/");
          return result;
        }}
        onVerifyCode={async (code, codeSentTo) => {
          await auth.verifyCode(code, codeSentTo);
          router.push("/");
        }}
        onLoginLinkClick={() => router.push("/auth/login")}
        defaultRole="OFFICE"
      />
    </div>
  );
}
