import { api } from "@/lib/api";

export interface CompanyPlan {
  id: string;
  slug: string;
  name: string;
  durationMonths: number;
  // KWD
  price: number;
  features: string[];
  badge: string | null;
}

export interface CompanySubscriptionState {
  status: "TRIAL" | "ACTIVE" | "EXPIRED" | "NONE";
  currentPlanId: string | null;
  endsAt: string | null;
  daysLeft: number;
}

interface ChargeResponse {
  checkoutUrl: string | null;
  invoiceId: string;
  status: "PAID" | "PENDING";
}

export const getPlans = async () =>
  (await api.get<CompanyPlan[]>("/company-plans")).data;

export const getMySubscription = async () =>
  (await api.get<CompanySubscriptionState>("/company-subscriptions/me")).data;

/** Starts the checkout; Tap sends the browser back to `returnUrl`. */
export const createSubscriptionCharge = async (
  companyPlanId: string,
  returnUrl: string,
) =>
  (
    await api.post<ChargeResponse>("/payments/subscription-charge", {
      companyPlanId,
      appRedirectUrl: returnUrl,
    })
  ).data;

export function apiErrorMessage(error: unknown, fallback: string): string {
  const message = (
    error as { response?: { data?: { message?: string | string[] } } }
  ).response?.data?.message;
  if (!message) return fallback;
  return Array.isArray(message) ? message.join("\n") : message;
}
