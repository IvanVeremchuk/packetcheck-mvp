"use client";

import { useState, useSyncExternalStore } from "react";

type OS = "windows" | "mac" | "linux";

export const SCANNERS: Record<OS, { label: string; file: string; run: string; oneLiner: string; where: string }> = {
  windows: {
    label: "Windows",
    file: "packetcheck-scan.ps1",
    run: "powershell -ExecutionPolicy Bypass -File $HOME\\Downloads\\packetcheck-scan.ps1",
    oneLiner: "irm https://packetcheck.net/scan/packetcheck-scan.ps1 | iex",
    where: "Open PowerShell (Start → type PowerShell) and paste:",
  },
  mac: {
    label: "macOS",
    file: "packetcheck-scan.sh",
    run: "sh ~/Downloads/packetcheck-scan.sh",
    oneLiner: "curl -fsSL https://packetcheck.net/scan/packetcheck-scan.sh | sh",
    where: "Open Terminal (Spotlight → Terminal) and paste:",
  },
  linux: {
    label: "Linux",
    file: "packetcheck-scan.sh",
    run: "sh ~/Downloads/packetcheck-scan.sh",
    oneLiner: "curl -fsSL https://packetcheck.net/scan/packetcheck-scan.sh | sh",
    where: "Open a terminal and paste:",
  },
};

export function detectOS(): OS {
  if (typeof navigator === "undefined") return "windows";
  const ua = `${navigator.userAgent} ${(navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? ""}`;
  if (/Mac|iPhone|iPad/i.test(ua)) return "mac";
  if (/Linux|X11|CrOS/i.test(ua) && !/Android/i.test(ua)) return "linux";
  return "windows";
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          setCopied(false);
        }
      }}
      aria-label={copied ? "Copied" : "Copy command"}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

const noSubscribe = () => () => {};

// Reads the visitor's own connection to this page (client only; null while rendering on the server).
function readSelf(): string {
  const secure = window.location.protocol === "https:";
  return `${window.location.hostname}|${window.location.port || (secure ? "443" : "80")}|${secure ? 1 : 0}`;
}

export default function ScanLauncher() {
  const detectedOS = useSyncExternalStore(noSubscribe, detectOS, () => null);
  const selfRaw = useSyncExternalStore(noSubscribe, readSelf, () => null);
  const [picked, setPicked] = useState<OS | null>(null);
  const os: OS = picked ?? detectedOS ?? "windows";
  const detected = detectedOS !== null;
  const self = selfRaw
    ? { host: selfRaw.split("|")[0], port: selfRaw.split("|")[1], secure: selfRaw.split("|")[2] === "1" }
    : null;

  const s = SCANNERS[os];

  return (
    <div data-ui className="pc-launcher" id="scan">
      <div className="pc-launcher__head">
        <strong>Quick scan</strong>
        <span className="ui-muted">{detected ? `${s.label} detected` : "Read-only · about 30 s"}</span>
      </div>

      <div className="ui-tabs" role="tablist" aria-label="Your system">
        {(Object.keys(SCANNERS) as OS[]).map((key) => (
          <button
            key={key}
            role="tab"
            type="button"
            className="ui-tab"
            aria-selected={os === key}
            onClick={() => setPicked(key)}
          >
            {SCANNERS[key].label}
          </button>
        ))}
      </div>

      <ol className="pc-launcher__steps">
        <li>
          <span className="ui-muted">1. Download the scanner. It is plain text you can read first.</span>
          <a className="pc-launcher__dl" href={`/scan/${s.file}`} download>
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 2v9m0 0 3.5-3.5M8 11 4.5 7.5M3 14h10" /></svg>
            {s.file}
          </a>
        </li>
        <li>
          <span className="ui-muted">2. {s.where}</span>
          <div className="ui-cmd">
            <code>{s.run}</code>
            <CopyButton text={s.run} />
          </div>
        </li>
        <li>
          <span className="ui-muted">3. Paste the report it copies for you into the checker below.</span>
        </li>
      </ol>

      <div className="pc-launcher__self" aria-live="polite">
        <span className="ui-muted">One connection we can already see: yours, to this page</span>
        <div className="pc-launcher__conn">
          <code>
            your browser → {self ? `${self.host}:${self.port}` : "this site"}
          </code>
          <span className={`ui-pill ${self?.secure === false ? "ui-pill--medium" : "ui-pill--ok"}`}>
            <span className="ui-dot" />
            {self?.secure === false ? "Not encrypted" : "Expected"}
          </span>
          <span className="ui-muted">
            {self?.secure === false
              ? "Plain HTTP on this address: fine for local testing only."
              : "Encrypted HTTPS, started by you. The scan sorts every other connection the same way."}
          </span>
        </div>
      </div>
    </div>
  );
}
