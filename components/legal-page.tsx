import type { ReactNode } from "react";
import { Brand } from "./brand";

// Shared details for the legal pages. Update OPERATOR once the business name and domain are final.
export const LEGAL = {
  operator: "CareerOS",
  email: "connect.nmukherjee@gmail.com",
  effective: "6 November 2026",
};

export function LegalPage({ title, intro, children }: { title: string; intro: ReactNode; children: ReactNode }) {
  return <div className="legal-page">
    <header className="mk-header">
      <div className="mk-header-inner container">
        <Brand />
        <nav className="legal-nav" aria-label="Legal">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
      </div>
    </header>
    <main className="container legal-main">
      <article className="legal-article">
        <span className="eyebrow">Last updated {LEGAL.effective}</span>
        <h1>{title}</h1>
        <div className="legal-intro">{intro}</div>
        {children}
      </article>
    </main>
    <footer className="container legal-footer">
      <small>© 2026 {LEGAL.operator} · <a href="/privacy">Privacy policy</a> · <a href="/terms">Terms of use</a> · <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a></small>
    </footer>
  </div>;
}

export function Mail() {
  return <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>;
}
