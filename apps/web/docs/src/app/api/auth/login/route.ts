import { NextResponse, type NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session-token";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    role?: string;
    password?: string;
    name?: string;
  } | null;

  // The visitor's IP as nginx saw it, for the API's per-IP login limit
  const clientIp =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  let res: Response;
  try {
    res = await apiFetch("/qa-portal/auth/login", {
      method: "POST",
      body: JSON.stringify({
        role: body?.role,
        password: body?.password,
        name: body?.name,
      }),
      clientIp,
    });
  } catch {
    return NextResponse.json(
      { message: "تعذر الاتصال بالخادم" },
      { status: 503 },
    );
  }

  const data = (await res.json().catch(() => ({}))) as {
    accessToken?: string;
    user?: unknown;
    message?: string | string[];
  };
  if (!res.ok || !data.accessToken) {
    return NextResponse.json(
      { message: data.message ?? "تعذر تسجيل الدخول" },
      { status: res.status || 500 },
    );
  }

  const response = NextResponse.json({ user: data.user });
  response.cookies.set(SESSION_COOKIE, data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
