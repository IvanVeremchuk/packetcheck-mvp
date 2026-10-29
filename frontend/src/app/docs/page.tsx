export default function DocsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto w-full max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-semibold">API & Integration</h1>
        <p className="mt-4 text-slate-300">
          PacketCheck supports browser uploads and API-based ingestion for
          firms. Use the `/analyze` endpoint to send log text and receive risk
          scoring with AI explanations.
        </p>

        <section className="mt-10 space-y-4 rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="text-2xl font-semibold">Endpoint</h2>
          <p className="text-sm text-slate-300">
            POST{" "}
            <code className="rounded bg-slate-800 px-1 py-0.5">
              {process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.packetcheck.net"}
              /analyze
            </code>
          </p>
          <p className="text-sm text-slate-400">
            Requires <code className="rounded bg-slate-800 px-1">Authorization: Bearer &lt;token&gt;</code> (Clerk
            session token).
          </p>
          <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm text-slate-200">
{`{
  "log_text": "Feb 03 10:12:01 server sshd..."
}`}
          </pre>
          <p className="text-sm text-slate-300">
            Response includes IP, country, risk score, and AI explanation for
            high-risk IPs.
          </p>
        </section>
      </div>
    </div>
  );
}
