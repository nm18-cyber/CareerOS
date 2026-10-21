import { NextResponse } from "next/server";
import { authConfig } from "./auth-config";

export function authRedirect(
  request: Request,
  path: string,
  params: Record<string, string> = {},
) {
  const url = new URL(path, authConfig()?.origin ?? request.url);

  for (const [name, value] of Object.entries(params)) {
    url.searchParams.set(name, value);
  }

  return NextResponse.redirect(url, 303);
}

export function formText(form: FormData, name: string) {
  const value = form.get(name);

  return typeof value === "string" ? value.trim() : "";
}
