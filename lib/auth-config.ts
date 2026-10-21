import { env } from "cloudflare:workers";

export function authConfig() {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_PUBLISHABLE_KEY;
  const origin = env.APP_URL;

  if (!url || !key || !origin) {
    return null;
  }

  const app = new URL(origin);

  const isLocalHttp =
    app.protocol === "http:" &&
    ["localhost", "127.0.0.1"].includes(app.hostname);

  if (app.protocol !== "https:" && !isLocalHttp) {
    throw new Error("APP_URL must use HTTPS");
  }

  return {
    url,
    key,
    origin: app.origin,
    secure: app.protocol === "https:",
  };
}
