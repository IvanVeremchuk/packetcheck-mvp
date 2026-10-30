import Link from "next/link";
import "../landing.css";
import { AccountLink, Footer, Mark } from "@/components/landing/Chrome";
import { GUIDES } from "@/lib/guides";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guides · PacketCheck",
  description: "Plain-language guides for checking a computer after a remote-access scam.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  return (
    <div className="pc">
      <header className="pc-bar">
        <Mark />
        <nav aria-label="Main">
          <Link href="/#scan">Scanner</Link>
          <Link href="/pricing">Pricing</Link>
          <AccountLink />
        </nav>
      </header>

      <main className="pc-docs">
        <div className="pc-docs__intro">
          <h1 className="pc-h2">Guides</h1>
          <p>What to do after a remote-access scam, and how to check a computer by hand. Every step works without PacketCheck.</p>
        </div>
        <ul className="pc-guides">
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link href={`/guides/${g.slug}`}>
                <span className="pc-guides__short">{g.short}</span>
                <span className="pc-guides__title">{g.title}</span>
                <span className="pc-guides__desc">{g.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <Footer />
    </div>
  );
}
