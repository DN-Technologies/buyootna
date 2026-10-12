import { api } from "@/lib/api";

interface Identity {
  id: string;
  type: "INDIVIDUAL" | "COMPANY" | "OFFICE";
}

export type CompanySession = "ok" | "signed-out" | "no-company";

/**
 * Subscriptions belong to the company persona. An account can also hold an
 * individual or office persona, so make the company one the active persona
 * of this browser's session before anything is charged.
 */
export async function ensureCompanySession(): Promise<CompanySession> {
  if (!localStorage.getItem("token")) return "signed-out";

  try {
    const [{ data: current }, { data: identities }] = await Promise.all([
      api.get<Identity>("/identities/current"),
      api.get<Identity[]>("/identities"),
    ]);
    if (current.type === "COMPANY") return "ok";

    const company = identities.find((identity) => identity.type === "COMPANY");
    if (!company) return "no-company";

    const { data } = await api.post<{ access_token: string; user: unknown }>(
      "/auth/identity/switch",
      { identityId: company.id },
    );
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return "ok";
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response
      ?.status;
    if (status === 401) {
      localStorage.removeItem("token");
      return "signed-out";
    }
    throw error;
  }
}
