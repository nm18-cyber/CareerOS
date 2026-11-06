import { auth } from "../../lib/auth/server";
import { authRedirect } from "../../lib/auth-redirect";

export const dynamic = "force-dynamic";

// POST only: a GET link could be triggered by any page (e.g. an <img> tag) to sign people out.
export async function POST(request: Request) {
  await auth?.signOut();

  return authRedirect(request, "/login", { notice: "signed-out" });
}
