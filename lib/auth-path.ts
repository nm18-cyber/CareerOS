export function safeReturnPath(
  value: unknown,
  fallback = "/home",
) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\r\n]/.test(value)
  ) {
    return fallback;
  }

  const url = new URL(value, "https://app.local");

  if (
    url.origin !== "https://app.local" ||
    /^\/(auth|login|signup|logout|forgot-password)(\/|$)/.test(
      url.pathname,
    )
  ) {
    return fallback;
  }

  return url.pathname + url.search + url.hash;
}
