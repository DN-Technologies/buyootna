import { NextResponse, type NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";
import { getSessionToken } from "@/lib/session";

/** Rotates a role's password; the API allows it for ADMIN only. */
export async function PUT(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    role?: string;
    password?: string;
  } | null;
  if (!body?.role) {
    return NextResponse.json({ message: "role is required" }, { status: 400 });
  }

  const res = await apiFetch(
    `/qa-portal/roles/${encodeURIComponent(body.role)}/password`,
    {
      method: "PUT",
      token: await getSessionToken(),
      body: JSON.stringify({ password: body.password }),
    },
  );
  const data: unknown = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
