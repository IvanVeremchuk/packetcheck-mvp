import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          PacketCheck
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-300">
          <Link href="/pricing" className="hover:text-white">
            Pricing
          </Link>
          <Link href="/docs" className="hover:text-white">
            Docs
          </Link>
          <Link href="/legal" className="hover:text-white">
            Legal
          </Link>
          <SignedOut>
            <SignInButton>
              <button className="rounded-full border border-slate-700 px-4 py-2 hover:border-slate-400">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="rounded-full bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-400">
                Get started
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/app"
              className="rounded-full border border-slate-700 px-4 py-2 hover:border-slate-400"
            >
              Open app
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-12">
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">
              Threat Intel + AI
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Drag-and-drop log analysis that tells you what the threats mean.
            </h1>
            <p className="text-lg text-slate-300">
              Upload your Wireshark or server logs. PacketCheck extracts risky
              IPs, checks AbuseIPDB, and explains in simple language what to do
              next.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <SignedOut>
                <SignUpButton>
                  <button className="rounded-full bg-indigo-500 px-6 py-3 text-white hover:bg-indigo-400">
                    Start free analysis
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/app"
                  className="rounded-full bg-indigo-500 px-6 py-3 text-white hover:bg-indigo-400"
                >
                  Go to dashboard
                </Link>
              </SignedIn>
              <Link
                href="/pricing"
                className="rounded-full border border-slate-700 px-6 py-3 text-slate-200 hover:border-slate-400"
              >
                See pricing
              </Link>
            </div>
            <div className="grid gap-4 text-sm text-slate-300 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 p-4">
                <p className="text-white">Simple outputs</p>
                <p>Plain-language guidance for any skill level.</p>
              </div>
              <div className="rounded-2xl border border-slate-800 p-4">
                <p className="text-white">Team-ready</p>
                <p>Shareable results and API access for firms.</p>
              </div>
              <div className="rounded-2xl border border-slate-800 p-4">
                <p className="text-white">Low friction</p>
                <p>Clerk login, Stripe checkout, Cloudflare edge.</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
              <div className="h-56 w-full rounded-2xl border border-dashed border-slate-700 bg-slate-900">
                <div className="flex h-full items-center justify-center text-slate-400">
                  3D hero placeholder (droid head / globe)
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Swap this block with your Blender-optimized canvas asset.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
