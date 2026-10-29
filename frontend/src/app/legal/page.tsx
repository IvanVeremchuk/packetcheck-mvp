import Link from "next/link";
import "../landing.css";
import { AccountLink, Footer, Mark } from "@/components/landing/Chrome";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy and terms · PacketCheck",
  description: "What PacketCheck reads, what leaves your computer and when.",
};

export default function LegalPage() {
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
        <article className="pc-legal">
          <h1 className="pc-h2">Privacy and terms</h1>
          <p className="pc-legal__date">Last updated 29 October 2026</p>

          <h2>What stays on your computer</h2>
          <p>
            The scanner script runs only on your computer. It reads connection, settings and startup
            lists, writes one report file, and sends nothing over the network.
          </p>
          <p>
            The free check on our website runs in your browser. Text you paste into it is not sent to us
            or anyone else. Our analytics tool is told to ignore the report box and the results.
          </p>

          <h2>What leaves it, and only when you ask</h2>
          <p>When you request an AI second opinion or a server log check:</p>
          <ul>
            <li>
              Your report, with connections between programs on your own computer removed, goes to our
              server and on to an AI model provider through OpenRouter to write the explanation.
            </li>
            <li>The public IP addresses in it are looked up on AbuseIPDB to check their reputation.</li>
            <li>
              We do not save the report or the answer. Our providers handle the data under their own
              privacy policies.
            </li>
          </ul>
          <p>
            Reports can contain your computer&apos;s IP addresses, program names and account names.
            Remove anything you do not want to share before you send it.
          </p>

          <h2>Accounts, payments and analytics</h2>
          <ul>
            <li>Sign-in is handled by Clerk, which stores your email address and login details.</li>
            <li>Payments are handled by Stripe. We never see your card number.</li>
            <li>
              We store your plan, how many checks you used this month and your remaining credits with
              your account.
            </li>
            <li>PostHog records which pages you visit and which buttons you press, to improve the site.</li>
          </ul>

          <h2>Terms</h2>
          <p>
            PacketCheck is a quick check for signs of remote access, not a full antivirus or a guarantee
            that a computer is safe. A clear result means nothing was found in that snapshot. You decide
            what to do with the results.
          </p>
          <p>
            Checks are charged only when an answer is delivered. Pack credits do not expire. Pro renews
            monthly until you cancel, and you keep it until the end of the period you paid for.
          </p>
          <p>
            Do not use the scanner on computers you are not allowed to inspect.
          </p>
        </article>
      </main>

      <Footer />
    </div>
  );
}
