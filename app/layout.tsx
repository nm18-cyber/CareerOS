import type { Metadata } from "next";
import "./globals.css";
// Design system — loaded after the legacy stylesheet so it takes precedence.
import "./styles/tokens.css";
import "./styles/components.css";
import "./styles/shell.css";
import "./styles/marketing.css";
import "./styles/screens.css";

export const metadata: Metadata = {
  title: "CareerOS — Resume builder and job search workspace",
  description: "Build evidence-led resumes, tailor them to each role, and keep every application in one workspace.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

const fonts = "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={fonts} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
