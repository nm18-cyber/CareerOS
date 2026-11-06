import { auth } from "../../../../lib/auth/server";

export const dynamic = "force-dynamic";

// Proxies Neon Auth's own endpoints (email verification links, session refresh) through this
// origin so its cookies stay first-party.
const unavailable = () => Response.json({ error: "Sign-in is not configured" }, { status: 503 });
const handlers = auth?.handler();

export const GET = handlers?.GET ?? unavailable;
export const POST = handlers?.POST ?? unavailable;
export const PUT = handlers?.PUT ?? unavailable;
export const PATCH = handlers?.PATCH ?? unavailable;
export const DELETE = handlers?.DELETE ?? unavailable;
