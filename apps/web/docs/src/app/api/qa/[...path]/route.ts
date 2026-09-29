import { NextResponse, type NextRequest } from "next/server";
import { apiFetch } from "@/lib/api";
import { getSessionToken } from "@/lib/session";

type Context = { params: Promise<{ path: string[] }> };

/**
 * Forwards the browser's test-tracking calls to the API's /qa-portal
 * routes with the session token from the httpOnly cookie. Each path
 * segment is encoded, so a call can't reach anything outside /qa-portal.
 */
async function forward(request: NextRequest, { params }: Context) {
  const { path } = await params;
  const target =
    "/qa-portal/" +
    path.map(encodeURIComponent).join("/") +
    request.nextUrl.search;

  const isRead = request.method === "GET";
  const contentType = request.headers.get("content-type") ?? "";
  const res = await apiFetch(target, {
    method: request.method,
    token: await getSessionToken(),
    // Screenshots arrive as multipart form data; pass it through untouched
    ...(isRead
      ? {}
      : {
          body: Buffer.from(await request.arrayBuffer()),
          headers: { "Content-Type": contentType || "application/json" },
        }),
  });

  const data: unknown = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
