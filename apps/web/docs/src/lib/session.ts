import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { apiFetch } from "./api";
import type { DocsRole, DocsUser } from "./access";
import { SESSION_COOKIE, verifySessionToken } from "./session-token";

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

/**
 * The signed-in docs user for this request. The token is checked locally
 * and then with the API, which also refuses tokens from before the role's
 * password was changed. Fails closed: if the API can't confirm, the user
 * is treated as signed out.
 */
export const getSession = cache(async (): Promise<DocsUser | null> => {
  const token = await getSessionToken();
  const user = await verifySessionToken(token);
  if (!user) return null;
  try {
    const res = await apiFetch("/qa-portal/auth/me", { token });
    return res.ok ? user : null;
  } catch {
    return null;
  }
});

export async function requireSession(): Promise<DocsUser> {
  const user = await getSession();
  if (!user) redirect("/login");
  return user;
}

/** 404 rather than 403, so a role can't tell a hidden page exists. */
export async function requireRole(...roles: DocsRole[]): Promise<DocsUser> {
  const user = await requireSession();
  if (!roles.includes(user.role)) notFound();
  return user;
}
