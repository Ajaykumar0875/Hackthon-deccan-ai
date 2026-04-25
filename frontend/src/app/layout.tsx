import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KizunaHire | Intelligent Candidate Shortlisting",
  description:
    "AI-powered talent scouting agent that parses job descriptions, discovers matching candidates, simulates outreach, and produces a ranked shortlist scored on match and interest.",
  keywords: ["AI recruiting", "talent scout", "candidate matching", "HR AI", "intelligent hiring"],
  authors: [{ name: "KizunaHire" }],
  openGraph: {
    title: "KizunaHire | Intelligent Candidate Shortlisting",
    description: "Discover and engage the right candidates, automatically.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ scrollPaddingTop: "70px" }} suppressHydrationWarning>
      <body>
        <div className="hero-bg">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <div className="hero-blob hero-blob-3" />
        </div>
        {children}
      </body>
    </html>
  );
}
