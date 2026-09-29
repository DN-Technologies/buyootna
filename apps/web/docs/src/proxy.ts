import { NextResponse, type NextRequest } from "next/server";
import { canSeePostman } from "@/lib/access";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session-token";

const PUBLIC_PATHS = new Set(["/login", "/api/auth/login"]);

/**
 * First line only: sends anyone without a valid session to /login. Pages
 * and route handlers check the session (and the role) again on the
 * server; this can't be the only check.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  const user = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  if (!user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/login", request.url);
    return NextResponse.redirect(login);
  }

  // A static file has no page code to check the role, so it's done here
  if (
    pathname === "/buyootna-api.postman_collection.json" &&
    !canSeePostman(user.role)
  ) {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  // Everything except Next's own assets and the images the login page shows
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|favicon\\.png|apple-touch-icon\\.png|logo[^/]*\\.png).*)",
  ],
};
