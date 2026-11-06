import { NextResponse, type NextRequest } from "next/server";
import { processAuthMiddleware } from "@neon/auth/server";
import { authSettings } from "./lib/auth/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    // Browsers send Sec-Fetch-Site on every request; fall back to Origin for older clients.
    // Origin alone is unreliable: some referrer policies make form posts send "Origin: null".
    const site = request.headers.get("sec-fetch-site");
    const origin = request.headers.get("origin");
    const crossOrigin = site
      ? site !== "same-origin"
      : !!origin && origin !== request.nextUrl.origin;

    if (crossOrigin) {
      return NextResponse.json({ error: "Cross-origin request rejected" }, { status: 403 });
    }

    const jsonApi = path.startsWith("/api/") && !path.startsWith("/api/auth/");

    if (jsonApi && request.method !== "DELETE" && !request.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json({ error: "JSON required" }, { status: 415 });
    }

    if (Number(request.headers.get("content-length") ?? 0) > 131072) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }
  }

  const forwarded = new Headers(request.headers);

  for (const name of [...forwarded.keys()]) {
    if (name.startsWith("oai-authenticated-")) {
      forwarded.delete(name);
    }
  }

  // Lets requireUser() send signed-out visitors back here after they sign in.
  forwarded.set("x-careeros-path", path + request.nextUrl.search);

  // Neon Auth: finish Google sign-in (swap the one-time verifier for a session cookie) and
  // refresh the session. Pages decide who may see them (requireUser), so a "go to login"
  // result is ignored here and API routes keep answering 401 instead of redirecting.
  const settings = authSettings();
  let cookies: string[] = [];

  if (settings && !path.startsWith("/api/auth/")) {
    const result = await processAuthMiddleware({
      request,
      pathname: path,
      skipRoutes: [],
      loginUrl: "/login",
      baseUrl: settings.baseUrl,
      cookieSecret: settings.cookies.secret,
    });

    if (result.action === "redirect_oauth") {
      const redirect = NextResponse.redirect(result.redirectUrl);
      for (const cookie of result.cookies) redirect.headers.append("Set-Cookie", cookie);
      return redirect;
    }

    if (result.action === "allow") {
      for (const [name, value] of Object.entries(result.headers ?? {})) forwarded.set(name, value);
    }

    cookies = result.cookies ?? [];
  }

  const response = NextResponse.next({
    request: { headers: forwarded },
  });

  for (const cookie of cookies) {
    response.headers.append("Set-Cookie", cookie);
  }

  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|assets/|favicon.ico).*)"],
};
