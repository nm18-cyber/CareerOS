/** CareerOS mark: an ascending path of three points — progress you can trace. */
export function BrandMark({ size = 30 }: { size?: number }) {
  return <span className="brand-mark" style={{ width: size, height: size }} aria-hidden>
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M4 14.5 9 9.5l3 3L16.5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16.5" cy="6" r="2" fill="#4169E1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  </span>;
}

export function Brand({ href = "/", size }: { href?: string; size?: number }) {
  return <a className="brand" href={href} aria-label="CareerOS home"><BrandMark size={size} /><span>career<span className="brand-os">os</span></span></a>;
}
