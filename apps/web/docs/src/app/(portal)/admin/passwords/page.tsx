import { PasswordsView, type RoleCredentialInfo } from "@/components/PasswordsView";
import { apiFetch } from "@/lib/api";
import { getSessionToken, requireRole } from "@/lib/session";

export default async function PasswordsPage() {
  await requireRole("ADMIN");
  const res = await apiFetch("/qa-portal/roles", {
    token: await getSessionToken(),
  });
  const roles = res.ok ? ((await res.json()) as RoleCredentialInfo[]) : [];
  return <PasswordsView roles={roles} />;
}
