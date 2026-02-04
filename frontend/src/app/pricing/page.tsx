"use client";

import { useState } from "react";

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST" });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to start checkout.");
      }
      const data = (await response.json()) as { url?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Checkout URL missing.");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Checkout failed.");
    } finally {
      setLoading(false);
    }
  };

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
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="mt-8 w-full rounded-full bg-indigo-500 px-6 py-3 text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {loading ? "Loading..." : "Subscribe"}
            </button>
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
