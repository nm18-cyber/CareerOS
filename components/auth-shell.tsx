import type { InputHTMLAttributes, ReactNode } from "react";
import { AlertCircle, ArrowLeft, Check, CheckCircle2 } from "lucide-react";
import { authSettings } from "../lib/auth/server";
import { Brand } from "./brand";

export type AuthSearchParams = Promise<Record<string, string | string[] | undefined>>;

const MESSAGES: Record<string, { text: string; error?: boolean }> = {
  missing: { text: "Enter your email and password.", error: true },
  invalid: { text: "That email and password don’t match an account.", error: true },
  unconfirmed: { text: "Confirm your email first — check your inbox for the link.", error: true },
  weak: { text: "Use at least 8 characters for your password.", error: true },
  link: { text: "That link is invalid or has expired. Please try again.", error: true },
  oauth: { text: "Google sign-in didn’t finish. Please try again.", error: true },
  exists: { text: "An account with that email already exists. Sign in instead.", error: true },
  code: { text: "That code is wrong or has expired. Check the latest email, or send a new code.", error: true },
  attempts: { text: "Too many tries with that code. Send a new code and try again.", error: true },
  "code-sent": { text: "Code sent. It can take a minute to arrive; check spam too." },
  "code-resent": { text: "A new code is on its way." },
  verified: { text: "Email confirmed. Sign in to continue." },
  unconfigured: { text: "Sign-in isn’t configured. Set NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET.", error: true },
  failed: { text: "Something went wrong. Please try again.", error: true },
  "check-email": { text: "Check your inbox to confirm your email, then sign in." },
  sent: { text: "Code sent. It can take a minute to arrive; check spam too." },
  "signed-out": { text: "You’re signed out." },
  "password-updated": { text: "Password updated. You’re signed in." },
};

export function param(params: Record<string, string | string[] | undefined>, name: string) {
  const value = params[name];
  return typeof value === "string" ? value : "";
}

export function Field({ label, hint, ...input }: { label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const hintId = hint ? `${input.name}-hint` : undefined;
  return <label className="field">
    <span className="field-label">{label}</span>
    <input className="input" aria-describedby={hintId} {...input} />
    {hint && <span className="field-hint" id={hintId}>{hint}</span>}
  </label>;
}

// Google sign-in runs through Neon Auth (enable it under Neon Console → Auth → OAuth providers).
export function SocialButtons({ returnTo, divider }: { returnTo: string; divider: string }) {
  const ready = !!authSettings();
  const mark = <span className="auth-provider-mark google-g" aria-hidden>G</span>;
  return <div className="auth-social">
    <div className="auth-divider"><span>{divider}</span></div>
    {ready
      ? <form method="post" action="/auth/oauth"><input type="hidden" name="provider" value="google" /><input type="hidden" name="return_to" value={returnTo} /><button className="outline-button button-block auth-provider" type="submit">{mark}Continue with Google</button></form>
      : <button className="outline-button button-block auth-provider" disabled aria-describedby="google-off">{mark}Continue with Google<small id="google-off">Not connected yet</small></button>}
  </div>;
}

export function AuthShell({ label, title, intro, message, children, footer }: { label: string; title: ReactNode; intro: string; message?: string; children: ReactNode; footer: ReactNode }) {
  const notice = message ? MESSAGES[message] : undefined;
  return <div className="auth-page">
    <a className="skip-link" href="#auth-form-start">Skip to form</a>
    <main className="auth-main">
      <div className="auth-top"><Brand /><a className="text-button" href="/"><ArrowLeft aria-hidden /> Back to home</a></div>
      <div className="auth-card" id="auth-form-start">
        <span className="label">{label}</span>
        <h1>{title}</h1>
        <p className="auth-intro">{intro}</p>
        {notice && <div className={`alert ${notice.error ? "alert-error" : "alert-success"}`} role={notice.error ? "alert" : "status"}>{notice.error ? <AlertCircle aria-hidden /> : <CheckCircle2 aria-hidden />}<span>{notice.text}</span></div>}
        {children}
        <p className="auth-footer">{footer}</p>
      </div>
    </main>
    <aside className="auth-aside" aria-label="Why CareerOS">
      <div className="auth-aside-inner">
        <p className="auth-quote">“Evidence beats adjectives.”</p>
        <p>Your account keeps every resume, role and application in one private workspace.</p>
        <ul>{["Resumes and cover letters, versioned", "Role matching against real job descriptions", "A tracker for every application"].map((t) => <li key={t}><Check aria-hidden size={18} />{t}</li>)}</ul>
      </div>
    </aside>
  </div>;
}
