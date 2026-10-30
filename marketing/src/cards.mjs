// Templates for every marketing image. Each entry returns the inner HTML of one card.
// Text comes from the live product: the rule engine's real findings for the site's example
// report, the real scanner output and the real pricing.

const MARK = (deep = false) => `
<svg viewBox="0 0 28 28" aria-hidden="true">
  <rect width="28" height="28" rx="6" fill="${deep ? "#ddd6c6" : "#2a2a26"}"/>
  <path d="M8 9h12v7a6 6 0 0 1-12 0z" fill="${deep ? "#2a2a26" : "#ddd6c6"}"/>
  <rect x="11" y="5" width="2.4" height="5" rx="1" fill="${deep ? "#2a2a26" : "#ddd6c6"}"/>
  <rect x="14.6" y="5" width="2.4" height="5" rx="1" fill="${deep ? "#2a2a26" : "#ddd6c6"}"/>
  <circle cx="14" cy="15.5" r="2.2" fill="#4f6238"/>
</svg>`;

const mark = (size, deep) => `<span class="mark" style="font-size:${size}px">${MARK(deep)}PacketCheck</span>`;

const SCAN_OUTPUT = `<span class="t-ok">  PacketCheck quick scan</span>
<span class="t-dim">  Read-only. Nothing is changed or uploaded.</span>

<span class="t-dim">  [1/6] Network connections
  [2/6] Remote Desktop and active sessions
  [3/6] Remote-control services and programs
  [4/6] Programs that start automatically
  [5/6] Administrator accounts
  [6/6] Antivirus status</span>

<span class="t-ok">  Done in 4.2 s. 14 open ports, 23 live connections.</span>
<span class="t-warn">  ! Remote Desktop is switched ON.</span>
<span class="t-warn">  ! Remote-control software found: AnyDesk</span>

<span class="t-dim">  Report saved to: Desktop\\packetcheck-report.txt</span>`;

const NETSTAT = `  Proto  Local Address        Foreign Address      State        PID
  TCP    0.0.0.0:135          0.0.0.0:0            LISTENING    1048
  TCP    0.0.0.0:445          0.0.0.0:0            LISTENING    4
  TCP    0.0.0.0:3389         0.0.0.0:0            LISTENING    1260
  TCP    0.0.0.0:5040         0.0.0.0:0            LISTENING    6412
  TCP    0.0.0.0:7070         0.0.0.0:0            LISTENING    5532
  TCP    127.0.0.1:49671      127.0.0.1:49672      ESTABLISHED  7720
  TCP    192.168.1.24:49702   52.112.94.40:443     ESTABLISHED  9104
  TCP    192.168.1.24:49731   140.82.113.26:443    ESTABLISHED  9104
  TCP    192.168.1.24:49788   185.229.191.39:443   ESTABLISHED  5532
  TCP    192.168.1.24:49812   45.137.21.9:4444     ESTABLISHED  3316
  UDP    0.0.0.0:5353         *:*                               2216`;

// Real output of analyze(SAMPLE_WINDOWS_NETSTAT), frontend/src/lib/scan/analyze.ts.
const FINDINGS = [
  {
    s: "high",
    label: "High",
    t: "Connection to port 4444, used by Metasploit / generic backdoor",
    d: "Normal apps almost never use this port. A program on this computer may be taking orders from someone else.",
    e: "pid 3316 192.168.1.24:49812 → 45.137.21.9:4444",
    a: "Disconnect from the internet, note the program name, then remove it and run a full antivirus scan.",
  },
  {
    s: "medium",
    label: "Check",
    t: "Remote Desktop (RDP) is open (port 3389)",
    d: "Windows Remote Desktop is accepting connections.",
    e: "pid 1260 listening on 0.0.0.0:3389",
    a: "If you do not use it, turn it off. If you do, make sure it has a strong password.",
  },
  {
    s: "medium",
    label: "Check",
    t: "AnyDesk is open (port 7070)",
    d: "AnyDesk is accepting direct connections.",
    e: "pid 5532 listening on 0.0.0.0:7070",
  },
];

const finding = (f, { detail = true, evidence = true, action = false } = {}) => `
<div class="finding">
  <span class="pill pill--${f.s}">${f.label}</span>
  <div class="finding__t">${f.t}</div>
  ${detail ? `<div class="finding__d">${f.d}</div>` : ""}
  ${evidence ? `<div class="finding__e">${f.e}</div>` : ""}
  ${action ? `<div class="finding__a"><b style="font-weight:500">What to do:</b> ${f.a}</div>` : ""}
</div>`;

const verdictHead = (size) => `
<div style="padding:${size * 0.95}px ${size * 1.15}px;border-bottom:1px solid var(--ui-line);background:var(--high-bg)">
  <strong style="font-weight:500;font-size:${size * 1.15}px;letter-spacing:-0.01em;color:var(--high)">Signs of remote access</strong>
  <div style="color:var(--ui-muted);font-size:${size * 0.82}px;margin-top:${size * 0.3}px">Read as Windows netstat · 6 open ports · 5 live connections · 4 internet addresses</div>
</div>`;

const SCRIPT_HEAD = `&lt;#
  PacketCheck quick scan for Windows.

  Read-only: it looks, it changes nothing, and it sends nothing anywhere.
  It lists who your computer is listening for, who it is talking to right now,
  whether Remote Desktop is on, which remote-control tools are installed, what
  starts with Windows, and who has admin rights. The report is saved to your
  Desktop and copied to the clipboard so you can paste it at packetcheck.net.

  Run it:
    powershell -ExecutionPolicy Bypass -File .\\packetcheck-scan.ps1

  Works on Windows PowerShell 5.1 and PowerShell 7. Running as administrator
  shows a little more (Defender exclusions), but it is not required.
#&gt;

$ErrorActionPreference = 'SilentlyContinue'
$started = Get-Date`;

const PLANS = [
  ["Free", "$0", "Unlimited scans and browser checks. 3 AI second opinions a month."],
  ["Check pack", "$3 once", "10 more AI checks. They never expire. No subscription."],
  ["Pro", "$5 a month", "150 AI checks a month, for whoever looks after the family's computers."],
];

const foot = (size, deep = false, extra = "") => `
<div style="position:absolute;left:var(--pad);right:var(--pad);bottom:var(--pad);display:flex;justify-content:space-between;align-items:center">
  ${mark(size, deep)}
  <span class="url" style="font-size:${size}px">packetcheck.net${extra}</span>
</div>`;

export const CARDS = [
  // ---------- Share image for the site (Open Graph / X card) ----------
  {
    name: "og",
    w: 1200,
    h: 630,
    html: () => `
<div class="card" style="--pad:56px">
  <div style="flex:1.12;padding:var(--pad);display:flex;flex-direction:column">
    ${mark(24)}
    <h1 style="font-size:76px;margin-top:auto">Is anyone else on your computer?</h1>
    <p class="lead" style="font-size:25px;margin:26px 0 auto;max-width:560px">A 30-second, read-only check for remote access. Free, and nothing is uploaded.</p>
    <span class="url" style="font-size:22px;color:var(--accent)">packetcheck.net</span>
  </div>
  <div style="flex:0.88;padding:44px 44px 44px 0;display:flex;align-items:center">
    <div class="term" style="font-size:15.5px;padding:24px 22px;width:100%">${SCAN_OUTPUT}</div>
  </div>
</div>`,
  },

  // ---------- X / Bluesky / LinkedIn, 16:9 ----------
  {
    name: "x-1-question",
    w: 1600,
    h: 900,
    html: () => `
<div class="card card--deep" style="--pad:72px">
  <div class="photo" style="flex:0 0 46%;background-image:url(../../../frontend/public/images/switchboard-1902.jpg)"></div>
  <div style="flex:1;padding:var(--pad);display:flex;flex-direction:column">
    ${mark(28, true)}
    <h1 style="font-size:112px;margin-top:auto">Is anyone else on your computer?</h1>
    <p class="lead" style="font-size:32px;margin-top:34px;max-width:720px;color:var(--on-deep)">A 30-second, read-only check for Remote Desktop, remote-control apps and what they leave behind.</p>
    <div style="display:flex;justify-content:space-between;align-items:end;margin-top:56px">
      <span class="url" style="font-size:30px;color:#a9c48a">packetcheck.net</span>
      <span class="credit">Telephone switchboard, 1902. Public domain.</span>
    </div>
  </div>
</div>`,
  },
  {
    name: "x-2-leftover",
    w: 1600,
    h: 900,
    html: () => `
<div class="card" style="--pad:72px">
  <div style="flex:1;padding:var(--pad);display:flex;flex-direction:column">
    <h1 style="font-size:96px">Deleting the icon doesn't remove AnyDesk.</h1>
    <p class="lead" style="font-size:30px;margin-top:36px;max-width:640px">Remote-control apps install a service that starts with your computer. That is the part a scammer comes back through.</p>
  </div>
  <div style="flex:0 0 46%;padding:var(--pad) var(--pad) 150px 0;display:flex;align-items:center">
    <div class="ui" style="width:100%;font-size:24px">
      <div class="finding">
        <span class="pill pill--medium">Check</span>
        <div class="finding__t" style="font-size:32px">AnyDesk is on this computer</div>
        <div class="finding__d">Remote-control software lets someone see and drive this computer. Scammers often install it during a fake support call and it stays after you delete their app.</div>
        <div class="finding__e">service AnyDesk: Running, starts Auto</div>
        <div class="finding__a"><b style="font-weight:500">What to do:</b> if you did not install it yourself, uninstall it, then check the list below for anything that starts it again.</div>
      </div>
    </div>
  </div>
  ${foot(28)}
</div>`,
  },
  {
    name: "x-3-readable",
    w: 1600,
    h: 900,
    html: () => `
<div class="card" style="--pad:72px">
  <div style="flex:0 0 40%;padding:var(--pad);display:flex;flex-direction:column">
    <h1 style="font-size:104px">Read it before you run it.</h1>
    <p class="lead" style="font-size:30px;margin-top:36px">The scanner is a plain text file. Open it in Notepad first. Every line is public on GitHub.</p>
  </div>
  <div style="flex:1;padding:var(--pad) var(--pad) 150px 0;display:flex;align-items:center">
    <div class="ui" style="width:100%;overflow:hidden">
      <div style="padding:14px 20px;border-bottom:1px solid var(--ui-line);font-size:19px;color:var(--ui-muted);display:flex;justify-content:space-between"><span>packetcheck-scan.ps1</span><span>203 lines · plain text</span></div>
      <pre style="font-family:var(--mono);font-size:17.5px;line-height:1.5;padding:20px 22px;white-space:pre;color:var(--ui-text)">${SCRIPT_HEAD}</pre>
    </div>
  </div>
  ${foot(28, false, "  ·  github.com/IvanVeremchuk/packetcheck-mvp")}
</div>`,
  },
  {
    name: "x-4-paste",
    w: 1600,
    h: 900,
    html: () => `
<div class="card" style="--pad:64px;flex-direction:column">
  <div style="padding:var(--pad) var(--pad) 0;display:flex;justify-content:space-between;align-items:end">
    <h1 style="font-size:88px">Have netstat? Paste it.</h1>
    <p class="lead" style="font-size:26px;max-width:470px;text-align:right">Also reads ss, lsof and macOS netstat. Checked in your browser.</p>
  </div>
  <div style="flex:1;display:flex;gap:28px;padding:40px var(--pad) 128px;align-items:flex-start">
    <div class="term" style="flex:1.08;font-size:15.5px;padding:24px 22px;overflow:hidden">${NETSTAT}</div>
    <div class="ui" style="flex:0.92;font-size:17px;overflow:hidden">
      ${verdictHead(17)}
      ${FINDINGS.map((f) => finding(f, { detail: false })).join("")}
      <div class="finding" style="color:var(--ui-muted)">Checked in your browser. Nothing has been sent anywhere.</div>
    </div>
  </div>
  ${foot(26)}
</div>`,
  },

  // ---------- Square posts (Instagram, LinkedIn, Mastodon) ----------
  {
    name: "sq-1-steps",
    w: 1080,
    h: 1080,
    html: () => {
      const steps = [
        ["Unplug the internet.", "Wi-Fi off, or pull the cable, until you have finished."],
        ["Call your bank.", "Use the number on your card. Ask them to watch for transfers."],
        ["Change your email password.", "From your phone, not this computer. Then banking."],
        ["Check what they left.", "Remote-control apps, Remote Desktop, startup items."],
      ];
      return `
<div class="card card--field" style="--pad:76px;flex-direction:column;padding:var(--pad)">
  <h1 style="font-size:84px">Let a stranger in?<br/>The first hour.</h1>
  <ol style="list-style:none;margin-top:56px;display:grid;gap:30px">
    ${steps
      .map(
        ([t, d], i) => `<li style="display:grid;grid-template-columns:76px 1fr;align-items:baseline">
      <span style="font-size:58px;font-weight:500;letter-spacing:-0.04em;opacity:0.55">${i + 1}</span>
      <span><span style="display:block;font-size:40px;font-weight:500;letter-spacing:-0.02em">${t}</span><span style="display:block;font-size:26px;opacity:0.82;margin-top:6px;line-height:1.3">${d}</span></span>
    </li>`,
      )
      .join("")}
  </ol>
  <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center">
    ${mark(26, true)}
    <span class="url" style="font-size:26px">It happens to careful people.</span>
  </div>
</div>`;
    },
  },
  {
    name: "sq-2-verdict",
    w: 1080,
    h: 1080,
    html: () => `
<div class="card" style="--pad:72px;flex-direction:column;padding:var(--pad)">
  <h1 style="font-size:84px">Plain words.<br/>What to click.</h1>
  <div class="ui" style="margin-top:48px;font-size:22px;overflow:hidden">
    ${verdictHead(22)}
    ${FINDINGS.slice(0, 2).map((f) => finding(f, { evidence: false, action: true })).join("")}
  </div>
  <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center">
    ${mark(26)}
    <span class="url" style="font-size:26px">packetcheck.net</span>
  </div>
</div>`,
  },
  {
    name: "sq-3-promise",
    w: 1080,
    h: 1080,
    html: () => `
<div class="card card--deep" style="--pad:80px;flex-direction:column;padding:var(--pad)">
  ${mark(28, true)}
  <h1 style="font-size:104px;margin-top:auto">Nobody from PacketCheck will ever call you.</h1>
  <p class="lead" style="font-size:34px;margin-top:40px;color:var(--on-deep-muted);max-width:820px">Or pop up a warning, or ask to connect to your computer. If someone says they are from us, hang up.</p>
  <span class="url" style="font-size:28px;color:#a9c48a;margin-top:64px">packetcheck.net</span>
</div>`,
  },

  // ---------- Product Hunt gallery, 1270 × 760 ----------
  {
    name: "ph-1-hero",
    w: 1270,
    h: 760,
    html: () => `
<div class="card" style="--pad:60px">
  <div style="flex:1.05;padding:var(--pad);display:flex;flex-direction:column">
    ${mark(24)}
    <h1 style="font-size:84px;margin-top:auto">Is anyone else on your computer?</h1>
    <p class="lead" style="font-size:26px;margin-top:28px;max-width:560px">A 30-second check for remote access after a scam call. Read-only. Nothing is uploaded.</p>
    <ul style="list-style:none;display:flex;gap:26px;margin-top:40px;font-size:20px;color:var(--muted)"><li>Windows, macOS, Linux</li><li>Changes nothing</li><li>Free to run</li></ul>
  </div>
  <div class="photo" style="flex:0.95;background-image:url(../../../frontend/public/images/switchboard-1902.jpg)"></div>
</div>`,
  },
  {
    name: "ph-2-report",
    w: 1270,
    h: 760,
    html: () => `
<div class="card card--deep" style="--pad:60px">
  <div style="flex:0 0 38%;padding:var(--pad);display:flex;flex-direction:column">
    <span style="font-size:24px;color:#a9c48a;font-weight:500">1. Run</span>
    <h1 style="font-size:66px;margin-top:18px">One read&#8209;only scan.</h1>
    <p class="lead" style="font-size:24px;margin-top:26px;color:var(--on-deep-muted)">Connections, Remote Desktop, remote-control apps, startup items, admin accounts and antivirus status. About 30 seconds.</p>
    <div style="margin-top:auto">${mark(22, true)}</div>
  </div>
  <div style="flex:1;padding:var(--pad) var(--pad) var(--pad) 0;display:flex;align-items:center">
    <div class="term" style="font-size:18px;padding:30px 26px;width:100%;background:#191916;border:1px solid #3a3a34">${SCAN_OUTPUT}</div>
  </div>
</div>`,
  },
  {
    name: "ph-3-paste",
    w: 1270,
    h: 760,
    html: () => `
<div class="card" style="--pad:60px">
  <div style="flex:0 0 36%;padding:var(--pad);display:flex;flex-direction:column">
    <span style="font-size:24px;color:var(--accent);font-weight:500">2. Read</span>
    <h1 style="font-size:66px;margin-top:18px">Your browser sorts it out.</h1>
    <p class="lead" style="font-size:24px;margin-top:26px">Every finding says what it is, why it matters and what to click. Nothing leaves your computer.</p>
    <div style="margin-top:auto">${mark(22)}</div>
  </div>
  <div style="flex:1;padding:var(--pad) var(--pad) var(--pad) 0;display:flex;align-items:center">
    <div class="ui" style="width:100%;font-size:19px;overflow:hidden">
      ${verdictHead(19)}
      ${FINDINGS.map((f, i) => finding(f, { detail: i === 0 })).join("")}
    </div>
  </div>
</div>`,
  },
  {
    name: "ph-4-pricing",
    w: 1270,
    h: 760,
    html: () => `
<div class="card" style="--pad:60px;flex-direction:column;padding:var(--pad)">
  <span style="font-size:24px;color:var(--accent);font-weight:500">3. Only if you want it explained</span>
  <h1 style="font-size:66px;margin-top:18px;max-width:1000px">Free to check. $3 for ten plain‑English second opinions.</h1>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:auto">
    ${PLANS.map(
      ([n, p, d], i) => `<div class="ui" style="padding:26px 26px 30px;${i === 1 ? "background:var(--field);color:#fff;border-color:var(--field)" : ""}">
      <div style="font-size:22px;font-weight:500">${n}</div>
      <div style="font-size:52px;font-weight:500;letter-spacing:-0.03em;margin-top:10px">${p}</div>
      <div style="font-size:19px;line-height:1.4;margin-top:14px;${i === 1 ? "" : "color:var(--ui-muted)"}">${d}</div>
    </div>`,
    ).join("")}
  </div>
  <div style="display:flex;justify-content:space-between;margin-top:30px;font-size:19px;color:var(--muted)"><span>Failed checks are never charged.</span><span class="url" style="color:var(--ink)">packetcheck.net/pricing</span></div>
</div>`,
  },
];

// Printable one-page handout, US Letter. Rendered to PNG at 300 dpi and to PDF.
export const HANDOUT = {
  name: "handout-letter",
  w: 816,
  h: 1056,
  html: () => {
    const steps = [
      ["Disconnect from the internet.", "Turn off Wi-Fi or unplug the cable. Leave it off until you have finished these steps."],
      ["Call your bank.", "Use the number on the back of your card, not one the caller gave you. Tell them what happened and ask them to watch for transfers. Do the same if you paid with gift cards or a money transfer app."],
      ["Change your passwords from another device.", "Use your phone or a trusted computer. Start with your email, then banking, then anything that shares a password. Turn on two-step sign-in."],
      ["Remove the remote-control app.", "Windows: Settings → Apps. Mac: Applications folder. Look for AnyDesk, TeamViewer, ScreenConnect, UltraViewer, RustDesk, LogMeIn or Supremo, and uninstall anything you did not choose yourself."],
      ["Check what was left behind.", "Remote-control apps leave services and startup items after you delete them. Look for new user accounts too. Or run the free PacketCheck scan, which checks all of this in about 30 seconds."],
      ["Run a full antivirus scan.", "Windows Security → Virus & threat protection → Scan options → Microsoft Defender Offline scan."],
      ["Report it.", "US: reportfraud.ftc.gov and ic3.gov. UK: actionfraud.police.uk. Reporting helps stop the same callers."],
    ];
    return `
<div class="card" style="flex-direction:column;padding:56px 64px 44px;background:#fbfaf7">
  <div style="display:flex;justify-content:space-between;align-items:center">${mark(17)}<span style="font-size:13px;color:var(--muted)">Free to print and copy</span></div>
  <h1 style="font-size:46px;margin-top:34px;letter-spacing:-0.03em;line-height:1.02">Let a stranger into your computer?<br/>What to do in the first hour.</h1>
  <p class="lead" style="font-size:16px;margin-top:16px;max-width:600px">These calls are convincing, and they happen to careful people. Do these steps in order. You do not need to buy anything.</p>
  <ol style="list-style:none;margin-top:26px;display:grid;gap:15px">
    ${steps
      .map(
        ([t, d], i) => `<li style="display:grid;grid-template-columns:44px 1fr;border-top:1px solid #d9d3c4;padding-top:13px">
      <span style="font-size:24px;font-weight:500;color:var(--accent);letter-spacing:-0.03em">${i + 1}</span>
      <span><b style="display:block;font-size:18px;font-weight:500;letter-spacing:-0.01em">${t}</b><span style="display:block;font-size:14.5px;line-height:1.42;margin-top:3px;color:#3b3a34">${d}</span></span>
    </li>`,
      )
      .join("")}
  </ol>
  <div style="margin-top:auto;display:grid;grid-template-columns:1fr auto;gap:24px;align-items:end;border-top:2px solid var(--ink);padding-top:16px">
    <div style="font-size:14px;line-height:1.45"><b style="font-weight:500">Free check:</b> packetcheck.net. It reads, changes nothing and uploads nothing.<br/><b style="font-weight:500">Nobody from PacketCheck will ever call you</b> or ask to connect to your computer.</div>
    <span class="url" style="font-size:20px">packetcheck.net</span>
  </div>
</div>`;
  },
};

export { MARK, mark, FINDINGS, finding, SCAN_OUTPUT, verdictHead };
