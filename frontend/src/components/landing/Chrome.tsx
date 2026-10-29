import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export function Mark() {
  return (
    <Link href="/" className="pc-mark" aria-label="PacketCheck home">
      <svg viewBox="0 0 28 28" aria-hidden>
        <rect width="28" height="28" rx="6" fill="#2a2a26" />
        <path d="M8 9h12v7a6 6 0 0 1-12 0z" fill="#ddd6c6" />
        <rect x="11" y="5" width="2.4" height="5" rx="1" fill="#ddd6c6" />
        <rect x="14.6" y="5" width="2.4" height="5" rx="1" fill="#ddd6c6" />
        <circle cx="14" cy="15.5" r="2.2" fill="#4f6238" />
      </svg>
      PacketCheck
    </Link>
  );
}

export function AccountLink() {
  return (
    <>
      <SignedOut>
        <SignInButton>
          <button type="button" className="pc-link" style={{ background: "none", border: 0, padding: 0, font: "inherit", cursor: "pointer" }}>
            Sign in
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <Link href="/app" className="pc-link">Open app</Link>
        <UserButton />
      </SignedIn>
    </>
  );
}

export function Footer() {
  return (
    <footer className="pc-foot">
      <span>PacketCheck · remote-access checks</span>
      <nav aria-label="Footer">
        <Link href="/#scan">Scanner</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/docs">Docs</Link>
        <Link href="/legal">Legal</Link>
      </nav>
      <span className="pc-foot__right">
        <a href="https://commons.wikimedia.org/wiki/File:Switchboard_in_the_early_1900s.jpg">Photo: public domain</a>
        {" · "}© {new Date().getFullYear()} · <Link href="/legal">Privacy</Link>
      </span>
    </footer>
  );
}
