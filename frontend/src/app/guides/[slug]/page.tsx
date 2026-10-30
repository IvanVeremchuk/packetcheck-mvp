import Link from "next/link";
import { notFound } from "next/navigation";
import "../../landing.css";
import { AccountLink, Footer, Mark } from "@/components/landing/Chrome";
import { GUIDES, getGuide } from "@/lib/guides";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  if (!guide) return {};
  return {
    title: `${guide.title} · PacketCheck`,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: "article",
      images: [{ url: `/images/og/${guide.slug}.png`, width: 1200, height: 630, alt: guide.title }],
    },
    twitter: { card: "summary_large_image", images: [`/images/og/${guide.slug}.png`] },
  };
}

export default async function GuidePage({ params }: Props) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();
  const others = GUIDES.filter((g) => g.slug !== guide.slug);

  return (
    <div className="pc">
      <header className="pc-bar">
        <Mark />
        <nav aria-label="Main">
          <Link href="/guides">Guides</Link>
          <Link href="/#scan">Scanner</Link>
          <AccountLink />
        </nav>
      </header>

      <main className="pc-docs">
        <article className="pc-legal pc-guide">
          <h1 className="pc-h2">{guide.title}</h1>
          <p className="pc-legal__date">Updated {guide.updated}</p>
          {guide.body}
        </article>

        <nav aria-label="More guides" className="pc-guides pc-guides--more">
          {others.map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`}>
              <span className="pc-guides__short">{g.short}</span>
              <span className="pc-guides__title">{g.title}</span>
            </Link>
          ))}
        </nav>
      </main>

      <Footer />
    </div>
  );
}
