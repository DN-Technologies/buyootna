"use client";

import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ensureCompanySession } from "@/lib/companySession";
import {
  apiErrorMessage,
  type CompanyPlan,
  type CompanySubscriptionState,
  createSubscriptionCharge,
  getMySubscription,
  getPlans,
} from "@/lib/subscriptions";

const STATUS_TEXT: Record<
  CompanySubscriptionState["status"],
  (days: number) => string
> = {
  TRIAL: (days) => `أنت على الفترة التجريبية، يتبقى ${days} يوماً.`,
  ACTIVE: (days) => `اشتراكك فعّال، يتبقى ${days} يوماً.`,
  EXPIRED: () => "انتهى اشتراكك. اشترك في إحدى الباقات للمتابعة.",
  NONE: () => "لا يوجد اشتراك بعد. اختر الباقة المناسبة لشركتك.",
};

export default function PlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<CompanyPlan[]>([]);
  const [subscription, setSubscription] =
    useState<CompanySubscriptionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [payingPlanId, setPayingPlanId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const session = await ensureCompanySession();
        if (cancelled) return;
        if (session === "signed-out") {
          router.replace("/auth/login");
          return;
        }
        if (session === "no-company") {
          setNotice("هذا الحساب لا يملك حساب شركة. الاشتراكات متاحة للشركات فقط.");
          return;
        }
        const [planList, mine] = await Promise.all([
          getPlans(),
          getMySubscription(),
        ]);
        if (cancelled) return;
        setPlans(planList);
        setSubscription(mine);
      } catch (error) {
        if (!cancelled) {
          setNotice(apiErrorMessage(error, "تعذر تحميل الباقات، حاول مرة أخرى."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const subscribe = async (plan: CompanyPlan) => {
    if (payingPlanId) return;
    setPayingPlanId(plan.id);
    setNotice(null);
    try {
      const charge = await createSubscriptionCharge(
        plan.id,
        `${window.location.origin}/plans/callback`,
      );
      if (charge.status === "PAID" || !charge.checkoutUrl) {
        router.push("/plans/callback?status=success");
        return;
      }
      window.location.assign(charge.checkoutUrl);
    } catch (error) {
      setNotice(apiErrorMessage(error, "تعذر بدء عملية الدفع، حاول مرة أخرى."));
      setPayingPlanId(null);
    }
  };

  return (
    <main className="flex-1 px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-white">الباقات</h1>
          {subscription && (
            <p className="text-sm text-accent" data-testid="subscription-status">
              {STATUS_TEXT[subscription.status](subscription.daysLeft)}
            </p>
          )}
        </header>

        {notice && (
          <p
            role="alert"
            className="rounded-lg border border-[#1B2936] bg-[#0A1118]/80 p-4 text-center text-sm text-[#ECEFF2]"
          >
            {notice}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-16 text-accent">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = subscription?.currentPlanId === plan.id;
              return (
                <section
                  key={plan.id}
                  className={`relative flex min-h-[390px] flex-col justify-between gap-6 rounded-xl border bg-[#0A1118]/80 p-6 ${
                    plan.badge ? "border-[#D06400]" : "border-[#1B2936]"
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-l from-[#FF8D28] to-[#FACC15] px-4 py-1.5 text-xs font-semibold text-[#111111]">
                      {plan.badge}
                    </span>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="text-base font-semibold text-white">
                          {plan.name}
                        </h2>
                        <p className="text-xl font-bold text-white">
                          {plan.price} دينار كويتي
                        </p>
                      </div>
                      {isCurrent && (
                        <span className="rounded-lg bg-[#FBC817] px-2 py-1 text-xs text-[#111111]">
                          باقتك الحالية
                        </span>
                      )}
                    </div>

                    <hr className="border-[#1B2936]" />

                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm text-[#ECEFF2]"
                        >
                          <Check className="h-4 w-4 shrink-0 text-accent" />
                          {feature.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    disabled={isCurrent || payingPlanId !== null}
                    onClick={() => subscribe(plan)}
                    className={`flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold transition ${
                      isCurrent
                        ? "cursor-not-allowed bg-[#A6A6A6] text-white"
                        : "bg-accent text-primary hover:bg-accent-light disabled:opacity-60"
                    }`}
                  >
                    {payingPlanId === plan.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "اشترك الان"
                    )}
                  </button>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
