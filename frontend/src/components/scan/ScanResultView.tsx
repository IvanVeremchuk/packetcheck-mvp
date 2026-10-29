import type { ScanResult } from "@/lib/scan/analyze";

const FORMAT_LABEL: Record<ScanResult["format"], string> = {
  packetcheck: "PacketCheck report",
  "windows-netstat": "Windows netstat",
  "macos-netstat": "macOS netstat",
  "linux-netstat": "Linux netstat",
  ss: "ss output",
  lsof: "lsof output",
  unknown: "unrecognised text",
};

const VERDICT: Record<ScanResult["verdict"], { title: string; text: string }> = {
  alert: {
    title: "Signs of remote access",
    text: "At least one finding points to someone who can reach this computer. Read the red items first.",
  },
  review: {
    title: "Worth a closer look",
    text: "Nothing clearly malicious, but some remote-access doors are open. Close the ones you don't use.",
  },
  clear: {
    title: "No remote access spotted",
    text: "No open remote-login doors, remote-control tools or backdoor connections in this snapshot.",
  },
  empty: {
    title: "Nothing to check yet",
    text: "Paste the scanner report, or the output of netstat -ano, ss -tunap or lsof -i.",
  },
};

const SEV_LABEL = { high: "High", medium: "Check", low: "Low", info: "Info" } as const;

export default function ScanResultView({ result }: { result: ScanResult }) {
  const v = VERDICT[result.verdict];
  return (
    <div className="pc-result" aria-live="polite">
      <div className={`pc-result__verdict pc-result__verdict--${result.verdict}`}>
        <strong>{v.title}</strong>
        <p>{v.text}</p>
        {result.verdict !== "empty" ? (
          <p className="ui-muted">
            Read as {FORMAT_LABEL[result.format]}
            {result.os ? ` from ${result.os}` : ""} · {result.listening} open ports ·{" "}
            {result.connections} live connections · {result.publicRemotes.length} internet addresses
          </p>
        ) : null}
      </div>

      {result.findings.length > 0 ? (
        <ul className="pc-result__list">
          {result.findings.map((f, i) => (
            <li key={f.id}>
              <details className="pc-finding" open={i === 0 && f.severity === "high"}>
                <summary>
                  <span className={`ui-pill ui-pill--${f.severity}`}>
                    <span className="ui-dot" />
                    {SEV_LABEL[f.severity]}
                  </span>
                  <span className="pc-finding__title">{f.title}</span>
                </summary>
                <div className="pc-finding__body">
                  <p>{f.detail}</p>
                  <p>
                    <b>What to do:</b> {f.action}
                  </p>
                  {f.evidence.map((e) => (
                    <code key={e}>{e}</code>
                  ))}
                </div>
              </details>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
