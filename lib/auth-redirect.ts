import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";

// Public origin of the site. APP_URL wins so redirects never follow a spoofed Host header.
export function appOrigin(request: Request) {
  return new URL(env.APP_URL || request.url).origin;
}

export function authRedirect(
  request: Request,
  path: string,
  params: Record<string, string> = {},
) {
  const url = new URL(path, appOrigin(request));

  for (const [name, value] of Object.entries(params)) {
    url.searchParams.set(name, value);
  }

  return NextResponse.redirect(url, 303);
}

export function formText(form: FormData, name: string) {
  const value = form.get(name);

  return typeof value === "string" ? value.trim() : "";
}
