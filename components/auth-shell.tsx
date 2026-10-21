import type { ReactNode } from "react";

export type AuthSearchParams = Promise<Record<string, string | string[] | undefined>>;

const MESSAGES: Record<string, { text: string; error?: boolean }> = {
  missing: { text: "Enter your email and password.", error: true },
  invalid: { text: "That email and password don’t match an account.", error: true },
  unconfirmed: { text: "Confirm your email first — check your inbox for the link.", error: true },
  weak: { text: "Use at least 8 characters for your password.", error: true },
  link: { text: "That link is invalid or has expired. Please try again.", error: true },
  unconfigured: { text: "Sign-in isn’t configured. Set SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY and APP_URL.", error: true },
  failed: { text: "Something went wrong. Please try again.", error: true },
  "check-email": { text: "Check your inbox to confirm your email, then sign in." },
  sent: { text: "If an account exists for that email, a reset link is on its way." },
  "signed-out": { text: "You’re signed out." },
  "password-updated": { text: "Password updated. You’re signed in." },
};

export function param(params: Record<string, string | string[] | undefined>, name: string) {
  const value = params[name];
  return typeof value === "string" ? value : "";
}

export function AuthShell({ eyebrow, title, intro, message, children, footer }: { eyebrow: string; title: ReactNode; intro: string; message?: string; children: ReactNode; footer: ReactNode }) {
  const notice = message ? MESSAGES[message] : undefined;
  return <main className="auth-page"><div className="auth-shell"><a href="/" className="brand"><span className="brand-mark">✳</span><span>career<span className="brand-os">os</span></span></a><div className="auth-card"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p className="auth-intro">{intro}</p>{notice && <p className={`auth-message${notice.error ? " error" : ""}`} role={notice.error ? "alert" : "status"}>{notice.text}</p>}{children}</div><p className="auth-footer">{footer}</p><a className="auth-home" href="/">← Back to CareerOS</a></div></main>;
}
