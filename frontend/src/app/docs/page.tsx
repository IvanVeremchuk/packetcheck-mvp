import Link from "next/link";
import "../landing.css";
import { AccountLink, Footer, Mark } from "@/components/landing/Chrome";
import { SCANNERS } from "@/lib/scan/scanners";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How the scan works · PacketCheck",
  description: "How to run the PacketCheck scanner on Windows, macOS and Linux, what it checks, and the API.",
};

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.packetcheck.net";

const CHECKS: Array<[string, string]> = [
  ["Open ports", "Every TCP port the computer listens on, with the program that owns it. Flags RDP 3389, VNC 5900, AnyDesk 7070, TeamViewer 5938, WinRM, SSH, Telnet and known trojan ports such as 4444, 1604 and 5552."],
  ["Live connections", "Every established connection and the program behind it. Flags remote-control relays, IRC and trojan controller ports, built-in Windows tools talking to the internet, and programs running from Temp, Downloads or Public."],
  ["Remote Desktop", "Whether Remote Desktop is on, whether Network Level Authentication is off, whether Remote Assistance is allowed, and any active remote session."],
  ["Remote-control software", "Services and processes of TeamViewer, AnyDesk, RustDesk, ScreenConnect, NetSupport, Remote Utilities, VNC, MeshCentral, tunnels such as ngrok, and names of known remote-access trojans."],
  ["Startup and scheduled tasks", "Run keys, startup folders and non-Microsoft scheduled tasks on Windows; launch agents and daemons on macOS; cron, systemd and autostart on Linux. Flags hidden or encoded PowerShell and programs in temporary folders."],
  ["Admins and antivirus", "Members of the Administrators group, Microsoft Defender real-time status, and folders Defender has been told to ignore (exclusions are only readable as administrator)."],
];

const FORMATS: Array<[string, string]> = [
  ["netstat -ano", "Windows. Add -b in an administrator prompt to include program names."],
  ["netstat -an", "macOS."],
  ["netstat -tunap", "Linux, older systems."],
  ["ss -tunap", "Linux. Run with sudo to see every program."],
  ["lsof -i -n -P", "macOS and Linux. Run with sudo to see every program."],
];

export default function DocsPage() {
  return (
    <div className="pc">
      <header className="pc-bar">
        <Mark />
        <nav aria-label="Main">
          <Link href="/#scan">Scanner</Link>
          <Link href="/pricing">Pricing</Link>
          <AccountLink />
        </nav>
      </header>

      <main className="pc-docs">
        <div className="pc-docs__intro">
          <h1 className="pc-h2">How the scan works</h1>
          <p>
            The scanner is a plain text script. It only reads, it sends nothing, and it finishes in a few
            seconds. Open it in any text editor before you run it.
          </p>
        </div>

        <section aria-labelledby="run-title" className="pc-docs__block">
          <h2 id="run-title">Run it</h2>
          <div className="pc-docs__oses">
            {(["windows", "mac", "linux"] as const).map((os) => {
              const s = SCANNERS[os];
              return (
                <div key={os} data-ui className="pc-docs__os">
                  <strong>{s.label}</strong>
                  <a className="pc-launcher__dl" href={`/scan/${s.file}`} download>{s.file}</a>
                  <span className="ui-muted">Then {s.where.charAt(0).toLowerCase() + s.where.slice(1)}</span>
                  <pre><code>{s.run}</code></pre>
                  <span className="ui-muted">Or in one line, without saving the file:</span>
                  <pre><code>{s.oneLiner}</code></pre>
                </div>
              );
            })}
          </div>
          <p className="pc-docs__note">
            The report is saved as <code>packetcheck-report.txt</code> on your Desktop (Windows) or in your
            home folder (macOS and Linux), and copied to the clipboard. Run as administrator or with sudo to
            name the programs behind every connection; the scan works without it.
          </p>
        </section>

        <section aria-labelledby="checks-title" className="pc-docs__block">
          <h2 id="checks-title">What it checks</h2>
          <dl className="pc-docs__list">
            {CHECKS.map(([name, text]) => (
              <div key={name}>
                <dt>{name}</dt>
                <dd>{text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="formats-title" className="pc-docs__block">
          <h2 id="formats-title">Paste your own output</h2>
          <p className="pc-docs__lead">
            Skip the scanner if you already have a connection list. The checker on the home page reads these:
          </p>
          <dl className="pc-docs__list">
            {FORMATS.map(([cmd, text]) => (
              <div key={cmd}>
                <dt><code>{cmd}</code></dt>
                <dd>{text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="api-title" className="pc-docs__block">
          <h2 id="api-title">API</h2>
          <p className="pc-docs__lead">
            Both endpoints need <code>Authorization: Bearer &lt;Clerk session token&gt;</code> and use one AI
            check each.
          </p>
          <div className="pc-docs__api">
            <div>
              <strong><code>POST {API}/scan</code></strong>
              <p>AI second opinion on a scan report. Send the report and, optionally, the rule findings.</p>
              <pre><code>{`{
  "report_text": "#PACKETCHECK v1 os=windows ...",
  "local_findings": [
    { "severity": "high", "title": "...", "evidence": ["..."] }
  ]
}`}</code></pre>
              <p>Returns <code>verdict</code>, <code>headline</code>, <code>summary</code>, <code>items</code>, <code>next_steps</code>, <code>ip_reputation</code> and the remaining <code>usage</code>. Not charged if it fails.</p>
            </div>
            <div>
              <strong><code>POST {API}/analyze</code></strong>
              <p>IP reputation for a server log (SSH, firewall, web server).</p>
              <pre><code>{`{
  "log_text": "Feb 03 10:12:01 server sshd[1234]: Failed password for root from 192.0.2.1"
}`}</code></pre>
              <p>Returns each public IP with its country, AbuseIPDB score and an AI explanation when the score is over 50.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
