"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import posthog from "posthog-js";

type AnalysisResult = {
  ip: string;
  risk_score: number;
  country: string;
  ai_explanation?: string | null;
  error?: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function AppPage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const checkoutStatus = searchParams?.get("checkout");
  const currentPlan =
    typeof user?.publicMetadata?.plan === "string"
      ? user.publicMetadata.plan
      : "free";
  const [logText, setLogText] = useState("");
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setLogText(text);
  };

  const handleAnalyze = async () => {
    if (!logText.trim()) {
      setErrorMessage("Paste log text or upload a .txt file first.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setResults([]);

    try {
      posthog.capture("analysis_started");
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ log_text: logText }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || "Failed to analyze logs.");
      }

      const data = (await response.json()) as AnalysisResult[];
      setResults(data);
      posthog.capture("analysis_completed", {
        result_count: data.length,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unexpected error"
      );
      posthog.capture("analysis_failed", {
        message: error instanceof Error ? error.message : "Unexpected error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <header className="mb-10 space-y-2">
          <h1 className="text-3xl font-semibold">PacketCheck Dashboard</h1>
          <p className="text-slate-300">
            Drop a log file or paste text to get a clear security summary.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center rounded-full border border-indigo-400/40 bg-indigo-500/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-indigo-200">
              Current plan: {currentPlan}
            </span>
          </div>
        </header>

        <section className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
          {checkoutStatus === "success" ? (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              Checkout successful. Your subscription is active.
            </div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Paste log text
              </label>
              <textarea
                className="h-40 w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-100"
                placeholder="Paste Wireshark or server logs here..."
                value={logText}
                onChange={(event) => setLogText(event.target.value)}
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm text-slate-300">
                Or upload .txt
              </label>
              <input
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-500 file:px-4 file:py-2 file:text-white hover:file:bg-indigo-400"
              />
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full rounded-full bg-indigo-500 px-6 py-3 text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-300"
              >
                {loading ? "Analyzing..." : "Analyze logs"}
              </button>
            </div>
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              {errorMessage}
            </div>
          ) : null}

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <h2 className="mb-4 text-lg font-semibold">Results</h2>
            {results.length === 0 ? (
              <p className="text-sm text-slate-400">
                Results will appear here after analysis.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-slate-400">
                    <tr>
                      <th className="py-2">IP Address</th>
                      <th className="py-2">Country</th>
                      <th className="py-2">Risk Score</th>
                      <th className="py-2">AI Explanation</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-200">
                    {results.map((item) => (
                      <tr key={item.ip} className="border-t border-slate-800">
                        <td className="py-3">{item.ip}</td>
                        <td className="py-3">{item.country}</td>
                        <td className="py-3">{item.risk_score}</td>
                        <td className="py-3 text-slate-300">
                          {item.ai_explanation || "No AI explanation."}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
