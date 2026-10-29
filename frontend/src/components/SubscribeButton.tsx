"use client";

import { useState } from "react";
import posthog from "posthog-js";

type Props = {
  label?: string;
  className?: string;
  // "pro" = monthly subscription, "pack" = one-time pack of AI checks.
  kind?: "pro" | "pack";
};

export default function SubscribeButton({ label = "Subscribe", className, kind = "pro" }: Props) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      posthog.capture("checkout_started", { source: "pricing", kind });
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      if (response.status === 401 || response.redirected) {
        window.location.href = `/sign-in?redirect_url=${encodeURIComponent("/pricing")}`;
        return;
      }
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to start checkout.");
      }
      const data = (await response.json()) as { url?: string };
      if (!data.url) throw new Error("Checkout URL missing.");
      window.location.href = data.url;
    } catch (error) {
      posthog.capture("checkout_failed", {
        kind,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      alert(error instanceof Error ? error.message : "Checkout failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={loading}
      className={
        className ??
        "w-full rounded-full bg-indigo-500 px-6 py-3 text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-300"
      }
    >
      {loading ? "Opening checkout…" : label}
    </button>
  );
}
