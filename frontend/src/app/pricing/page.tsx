"use client";

import SubscribeButton from "@/components/SubscribeButton";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto w-full max-w-5xl px-6 py-16">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-semibold">Simple pricing</h1>
          <p className="mt-3 text-slate-300">
            Affordable for individuals, scalable for teams.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8">
            <h2 className="text-2xl font-semibold">Starter</h2>
            <p className="mt-2 text-slate-300">For solo analysts and students.</p>
            <p className="mt-6 text-4xl font-semibold">$19</p>
            <p className="text-sm text-slate-400">per month</p>
            <ul className="mt-6 space-y-2 text-sm text-slate-300">
              <li>Up to 50 analyses / month</li>
              <li>AI explanations</li>
              <li>Email support</li>
            </ul>
            <div className="mt-8">
              <SubscribeButton />
            </div>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8">
            <h2 className="text-2xl font-semibold">Team</h2>
            <p className="mt-2 text-slate-300">
              For security teams and IT firms.
            </p>
            <p className="mt-6 text-4xl font-semibold">$99</p>
            <p className="text-sm text-slate-400">per month</p>
            <ul className="mt-6 space-y-2 text-sm text-slate-300">
              <li>Unlimited analyses</li>
              <li>API access & team seats</li>
              <li>Priority support</li>
            </ul>
            <a
              href="mailto:sales@packetcheck.ai"
              className="mt-8 flex w-full items-center justify-center rounded-full border border-slate-700 px-6 py-3 text-white hover:border-slate-400"
            >
              Talk to sales
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
