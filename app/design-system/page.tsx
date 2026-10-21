import type { Metadata } from "next";
import { SiteHeader } from "../../components/site-header";
import Showcase from "./showcase";

export const metadata: Metadata = { title: "Design system — CareerOS", robots: { index: false } };

export default function DesignSystemPage() {
  return <div className="lib">
    <a className="skip-link" href="#main">Skip to content</a>
    <SiteHeader />
    <main id="main" className="container ds-page">
      <header>
        <span className="label">Modern Intelligence</span>
        <h1>CareerOS design system</h1>
        <p className="mk-lead">Tokens and components used across the product. Everything on this page is the real component, wired to the same CSS the app uses. Source: <code>app/styles/</code> and <code>DESIGN.md</code>.</p>
      </header>
      <Showcase />
    </main>
  </div>;
}
