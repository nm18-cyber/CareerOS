import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { authConfig } from "./lib/auth-config";

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

    if (path.startsWith("/api/") && request.method !== "DELETE" && !request.headers.get("content-type")?.includes("application/json")) {
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

  let response = NextResponse.next({
    request: { headers: forwarded },
  });

  const config = authConfig();

  if (config) {
    const client = createServerClient(config.url, config.key, {
      cookieOptions: {
        httpOnly: true,
        secure: config.secure,
        sameSite: "lax",
        path: "/",
      },
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(values) {
          for (const { name, value } of values) {
            request.cookies.set(name, value);
          }
          forwarded.set("cookie", request.cookies.toString());
          response = NextResponse.next({ request: { headers: forwarded } });
          for (const { name, value, options } of values) {
            response.cookies.set(name, value, options);
          }
        },
      },
    });

    await client.auth.getUser();
  }

  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|assets/|favicon.ico).*)"],
};
