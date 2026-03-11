"use client";

import { useState } from "react";
import posthog from "posthog-js";

type Props = {
  label?: string;
  className?: string;
};

export default function SubscribeButton({
  label = "Subscribe",
  className,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      posthog.capture("checkout_started", { source: "pricing" });
      const response = await fetch("/api/checkout", { method: "POST" });
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
      posthog.capture("checkout_failed", {
        message: error instanceof Error ? error.message : "Unknown error",
      });
      alert(error instanceof Error ? error.message : "Checkout failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={
        className ??
        "w-full rounded-full bg-indigo-500 px-6 py-3 text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-300"
      }
    >
      {loading ? "Loading..." : label}
    </button>
  );
}
