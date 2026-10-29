"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth, useUser, UserButton } from "@clerk/nextjs";
import posthog from "posthog-js";
import "../landing.css";
import { analyze, condenseForAI } from "@/lib/scan/analyze";
import ScanResultView from "@/components/scan/ScanResultView";
import SubscribeButton from "@/components/SubscribeButton";
import { Mark } from "@/components/landing/Chrome";
import { REPORT_KEY } from "@/components/landing/PasteChecker";

type AnalysisResult = {
  ip: string;
  risk_score: number;
  country: string;
  ai_explanation?: string | null;
  error?: string;
};

type Opinion = {
  verdict: "clear" | "review" | "alert";
  headline: string;
  summary: string;
  items: Array<{ title: string; severity: "high" | "medium" | "low" | "ok"; explanation: string; action: string }>;
  next_steps: string[];
  ip_reputation: Array<{ ip: string; risk_score: number; country: string; owner: string }>;
  usage?: { plan: string; monthly_left: number; credits: number };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const FREE_MONTHLY = 3;
const PRO_MONTHLY = 150;

async function readError(response: Response, fallback: string) {
  const body = await response.text();
  try {
    const json = JSON.parse(body);
    if (typeof json.detail === "string") return json.detail;
  } catch {
    // not JSON
  }
  return body || fallback;
}

export default function AppPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const checkoutStatus = searchParams?.get("checkout");
  const [tab, setTab] = useState<"scan" | "logs">(searchParams?.get("tab") === "logs" ? "logs" : "scan");

  const meta = (user?.publicMetadata ?? {}) as Record<string, unknown>;
  const plan = typeof meta.plan === "string" ? meta.plan : "free";
  const thisMonth = new Date().toISOString().slice(0, 7);
  const used = meta.analyses_month === thisMonth ? Number(meta.analyses_count ?? 0) : 0;
  const limit = plan === "pro" ? PRO_MONTHLY : FREE_MONTHLY;
  const [usage, setUsage] = useState<{ monthly_left: number; credits: number } | null>(null);
  const monthlyLeft = usage?.monthly_left ?? Math.max(limit - used, 0);
  const credits = usage?.credits ?? Number(meta.credits ?? 0);

  // ---- remote-access scan
  const [report, setReport] = useState("");
  const local = useMemo(() => analyze(report), [report]);
  const [opinion, setOpinion] = useState<Opinion | null>(null);
  const [asking, setAsking] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const pending = sessionStorage.getItem(REPORT_KEY);
      if (pending) {
        // One-time handoff from the landing page; sessionStorage only exists after hydration.
        setReport(pending);
        sessionStorage.removeItem(REPORT_KEY);
      }
    } catch {
      // storage unavailable
    }
  }, []);

  const askAI = async () => {
    setAsking(true);
    setScanError(null);
    setOpinion(null);
    try {
      posthog.capture("scan_ai_started", { local_verdict: local.verdict, findings: local.findings.length });
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          report_text: condenseForAI(report),
          local_verdict: local.verdict,
          local_findings: local.findings.map((f) => ({
            severity: f.severity,
            title: f.title,
            detail: f.detail,
            evidence: f.evidence,
          })),
        }),
      });
      if (!response.ok) throw new Error(await readError(response, "The AI check failed."));
      const data = (await response.json()) as Opinion;
      setOpinion(data);
      if (data.usage) setUsage(data.usage);
      posthog.capture("scan_ai_completed", { verdict: data.verdict });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      setScanError(message);
      posthog.capture("scan_ai_failed", { message });
    } finally {
      setAsking(false);
    }
  };

  // ---- IP log analysis (existing feature)
  const [logText, setLogText] = useState("");
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const readFile = async (event: React.ChangeEvent<HTMLInputElement>, set: (t: string) => void) => {
    const file = event.target.files?.[0];
    if (file) set(await file.text());
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
      const sessionToken = await getToken();
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        },
        body: JSON.stringify({ log_text: logText }),
      });
      if (!response.ok) throw new Error(await readError(response, "Failed to analyze logs."));
      const data = (await response.json()) as AnalysisResult[];
      setResults(data);
      posthog.capture("analysis_completed", { result_count: data.length });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unexpected error");
      posthog.capture("analysis_failed", { message: error instanceof Error ? error.message : "Unexpected error" });
    } finally {
      setLoading(false);
    }
  };

  const outOfChecks = monthlyLeft <= 0 && credits <= 0;

  return (
    <div className="pc pc-app">
      <header className="pc-bar">
        <Mark />
        <nav aria-label="Main">
          <Link href="/#scan">Download scanner</Link>
          <Link href="/pricing">Pricing</Link>
          <UserButton />
        </nav>
      </header>

      <main className="pc-app__main">
        <div className="pc-app__head">
          <div>
            <h1 className="pc-h2">Your checks</h1>
            <p className="pc-app__usage">
              {plan === "pro" ? "Pro" : "Free"} plan · {monthlyLeft} AI check{monthlyLeft === 1 ? "" : "s"} left this month
              {credits > 0 ? ` · ${credits} pack credit${credits === 1 ? "" : "s"}` : ""}
            </p>
          </div>
          <div className="ui-tabs pc-app__tabs" data-ui role="tablist" aria-label="Check type">
            <button role="tab" type="button" className="ui-tab" aria-selected={tab === "scan"} onClick={() => setTab("scan")}>
              Remote-access scan
            </button>
            <button role="tab" type="button" className="ui-tab" aria-selected={tab === "logs"} onClick={() => setTab("logs")}>
              Server log IPs
            </button>
          </div>
        </div>

        {checkoutStatus === "pack" || checkoutStatus === "pro" || checkoutStatus === "success" ? (
          <p className="pc-app__notice">
            {checkoutStatus === "pack"
              ? "Payment received. Your 10 checks appear within a few seconds; refresh if they don't."
              : "Payment received. Pro is active."}
          </p>
        ) : null}

        {tab === "scan" ? (
          <div className="pc-app__grid">
            <section className="pc-app__in" aria-labelledby="report-label">
              <div className="pc-app__label">
                <label id="report-label" htmlFor="report">Scanner report or netstat / ss / lsof output</label>
                <label className="pc-link pc-app__file">
                  Open file
                  <input type="file" accept=".txt,.log" onChange={(e) => readFile(e, setReport)} />
                </label>
              </div>
              <textarea
                id="report"
                value={report}
                onChange={(e) => {
                  setReport(e.target.value);
                  setOpinion(null);
                }}
                spellCheck={false}
                placeholder={"Paste packetcheck-report.txt here.\nNo report yet? Download the scanner from the home page."}
              />
              <div className="pc-app__actions">
                {outOfChecks ? (
                  <SubscribeButton kind="pack" label="Buy 10 checks for $3" className="pc-btn" />
                ) : (
                  <button type="button" className="pc-btn" onClick={askAI} disabled={asking || local.verdict === "empty"}>
                    {asking ? "Asking the AI…" : "Get the AI second opinion"}
                  </button>
                )}
                <span className="pc-app__hint">Uses 1 check. If it fails, you are not charged.</span>
              </div>
              {scanError ? <p className="pc-app__error" role="alert">{scanError}</p> : null}
            </section>

            <section className="pc-app__out" aria-label="Results">
              {opinion ? (
                <div data-ui className="pc-opinion">
                  <div className={`pc-result__verdict pc-result__verdict--${opinion.verdict}`}>
                    <strong>{opinion.headline || "AI second opinion"}</strong>
                    <p>{opinion.summary}</p>
                  </div>
                  <ul className="pc-result__list" style={{ maxHeight: "none" }}>
                    {opinion.items.map((item) => (
                      <li key={item.title} className="pc-finding" style={{ padding: "12px 14px" }}>
                        <div className="ui-row" style={{ alignItems: "start" }}>
                          <span className={`ui-pill ui-pill--${item.severity === "ok" ? "ok" : item.severity}`}>
                            <span className="ui-dot" />
                            {item.severity === "ok" ? "Normal" : item.severity === "high" ? "High" : item.severity === "medium" ? "Check" : "Low"}
                          </span>
                          <span className="pc-finding__title">{item.title}</span>
                        </div>
                        <p style={{ marginTop: 8 }}>{item.explanation}</p>
                        {item.action ? <p style={{ marginTop: 6 }}><b>What to do:</b> {item.action}</p> : null}
                      </li>
                    ))}
                  </ul>
                  {opinion.next_steps.length > 0 ? (
                    <div className="pc-opinion__steps">
                      <strong>Next steps</strong>
                      <ol>{opinion.next_steps.map((s) => <li key={s}>{s}</li>)}</ol>
                    </div>
                  ) : null}
                  {opinion.ip_reputation.length > 0 ? (
                    <table className="pc-ip">
                      <caption>Internet addresses checked on AbuseIPDB</caption>
                      <thead><tr><th>Address</th><th>Abuse score</th><th>Country</th><th>Owner</th></tr></thead>
                      <tbody>
                        {opinion.ip_reputation.map((r) => (
                          <tr key={r.ip}>
                            <td><code>{r.ip}</code></td>
                            <td className={r.risk_score >= 50 ? "is-bad" : undefined}>{r.risk_score}</td>
                            <td>{r.country || "?"}</td>
                            <td>{r.owner || "unknown"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : null}
                  <details className="pc-opinion__local">
                    <summary>Show the free rule check ({local.findings.length} findings)</summary>
                    <ScanResultView result={local} />
                  </details>
                </div>
              ) : (
                <div data-ui style={{ border: 0, background: "transparent" }}>
                  <ScanResultView result={local} />
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="pc-app__grid">
            <section className="pc-app__in" aria-labelledby="logs-label">
              <div className="pc-app__label">
                <label id="logs-label" htmlFor="logs">SSH, firewall or web server log</label>
                <label className="pc-link pc-app__file">
                  Open file
                  <input type="file" accept=".txt,.log" onChange={(e) => readFile(e, setLogText)} />
                </label>
              </div>
              <textarea
                id="logs"
                value={logText}
                onChange={(e) => setLogText(e.target.value)}
                spellCheck={false}
                placeholder="Feb 03 10:12:01 server sshd[1234]: Failed password for root from 192.0.2.1"
              />
              <div className="pc-app__actions">
                <button type="button" className="pc-btn" onClick={handleAnalyze} disabled={loading}>
                  {loading ? "Checking addresses…" : "Check the IPs in this log"}
                </button>
                <span className="pc-app__hint">Every public IP is looked up on AbuseIPDB. Uses 1 check.</span>
              </div>
              {errorMessage ? <p className="pc-app__error" role="alert">{errorMessage}</p> : null}
            </section>
            <section className="pc-app__out" aria-label="Results">
              {results.length === 0 ? (
                <p className="pc-app__hint">Addresses with an abuse score over 50 get an AI explanation.</p>
              ) : (
                <table className="pc-ip" data-ui>
                  <thead><tr><th>Address</th><th>Country</th><th>Abuse score</th><th>What it means</th></tr></thead>
                  <tbody>
                    {results.map((item) => (
                      <tr key={item.ip}>
                        <td><code>{item.ip}</code></td>
                        <td>{item.country}</td>
                        <td className={item.risk_score >= 50 ? "is-bad" : undefined}>{item.risk_score}</td>
                        <td style={{ whiteSpace: "pre-wrap" }}>{item.error || item.ai_explanation || "Nothing reported."}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
