import Link from "next/link";
import "../landing.css";
import PricingTable from "@/components/landing/PricingTable";
import { AccountLink, Footer, Mark } from "@/components/landing/Chrome";

export default function PricingPage() {
  return (
    <div className="pc">
      <header className="pc-bar">
        <Mark />
        <nav aria-label="Main">
          <Link href="/#scan">Scanner</Link>
          <Link href="/docs">Docs</Link>
          <AccountLink />
        </nav>
      </header>
      <main>
        <div style={{ marginTop: "-6vw" }}>
          <PricingTable headingLevel={1} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
