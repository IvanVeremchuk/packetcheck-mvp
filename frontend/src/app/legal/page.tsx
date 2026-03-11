export default function LegalPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto w-full max-w-4xl px-6 py-16 space-y-6">
        <h1 className="text-4xl font-semibold">Legal</h1>
        <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
          <h2 className="text-2xl font-semibold">Privacy</h2>
          <p className="text-sm text-slate-300">
            PacketCheck processes uploaded logs to provide security insights.
            Logs are used only for analysis and are not shared with third
            parties beyond required security providers.
          </p>
        </section>
        <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
          <h2 className="text-2xl font-semibold">Terms</h2>
          <p className="text-sm text-slate-300">
            The service is provided as-is for informational security guidance.
            You are responsible for final decisions and remediation steps.
          </p>
        </section>
      </div>
    </div>
  );
}
