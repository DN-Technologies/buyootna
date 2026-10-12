"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Where the payment gateway sends the browser back, with ?status=success|failed
function PaymentResult() {
  const paid = useSearchParams().get("status") === "success";

  return (
    <div className="w-full max-w-md space-y-6 rounded-2xl border border-[#1B2936] bg-[#0A1118]/80 p-8 text-center">
      {paid ? (
        <CheckCircle2 className="mx-auto h-16 w-16 text-accent" />
      ) : (
        <XCircle className="mx-auto h-16 w-16 text-red-400" />
      )}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white">
          {paid ? "تم تفعيل اشتراك شركتك" : "لم تكتمل عملية الدفع"}
        </h1>
        <p className="text-sm leading-relaxed text-[#9BA3AF]">
          {paid
            ? "تم الدفع بنجاح، والباقة مفعّلة الآن في تطبيق بيوتنا أيضاً."
            : "فشلت عملية الدفع أو تم إلغاؤها، ولم يُخصم أي مبلغ. يمكنك المحاولة مرة أخرى."}
        </p>
      </div>
      <Link
        href="/plans"
        className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-primary transition hover:bg-accent-light"
      >
        {paid ? "عرض الباقات" : "العودة إلى الباقات"}
      </Link>
    </div>
  );
}

export default function PlansCallbackPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Suspense>
        <PaymentResult />
      </Suspense>
    </main>
  );
}
