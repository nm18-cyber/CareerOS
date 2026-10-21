import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { authConfig } from "./auth-config";

export async function supabaseServer() {
  const config = authConfig();

  if (!config) {
    return null;
  }

  const jar = await cookies();

  return createServerClient(config.url, config.key, {
    cookieOptions: {
      httpOnly: true,
      secure: config.secure,
      sameSite: "lax",
      path: "/",
    },

    cookies: {
      getAll() {
        return jar.getAll();
      },

      setAll(values) {
        for (const { name, value, options } of values) {
          try {
            jar.set(name, value, options);
          } catch {
            // Server Components may have read-only cookies.
            // Middleware refreshes cookies for those requests.
          }
        }
      },
    },
  });
}
