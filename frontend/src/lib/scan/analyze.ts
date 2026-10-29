// PacketCheck rule engine. Runs entirely in the browser: the pasted text never
// leaves the page unless the user asks for the paid AI second opinion.
//
// Reads the PacketCheck scanner report, or raw output from
// `netstat -ano` (Windows), `netstat -an` (macOS), `netstat -tunap` / `ss -tunap`
// (Linux) and `lsof -i -n -P`.

export type Severity = "high" | "medium" | "low" | "info";
export type Verdict = "clear" | "review" | "alert" | "empty";
export type SourceFormat =
  | "packetcheck"
  | "windows-netstat"
  | "macos-netstat"
  | "linux-netstat"
  | "ss"
  | "lsof"
  | "unknown";

export type Socket = {
  kind: "listen" | "conn";
  localAddr: string;
  localPort: number;
  remoteAddr?: string;
  remotePort?: number;
  state?: string;
  pid?: string;
  process?: string;
  path?: string;
};

export type Finding = {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  action: string;
  evidence: string[];
};

export type ScanResult = {
  format: SourceFormat;
  os?: string;
  sockets: Socket[];
  listening: number;
  connections: number;
  publicRemotes: string[];
  findings: Finding[];
  verdict: Verdict;
};

// Ports a remote-control tool or remote-access trojan typically listens on.
const LISTEN_PORTS: Record<number, { name: string; severity: Severity; note: string }> = {
  3389: { name: "Remote Desktop (RDP)", severity: "medium", note: "Windows Remote Desktop is accepting connections." },
  5900: { name: "VNC screen sharing", severity: "high", note: "A VNC server is waiting for someone to view and control the screen." },
  5901: { name: "VNC screen sharing", severity: "high", note: "A VNC server is waiting for someone to view and control the screen." },
  5902: { name: "VNC screen sharing", severity: "high", note: "A VNC server is waiting for someone to view and control the screen." },
  5800: { name: "VNC over the web", severity: "high", note: "A web VNC viewer is open." },
  5938: { name: "TeamViewer", severity: "medium", note: "TeamViewer is accepting direct connections." },
  7070: { name: "AnyDesk", severity: "medium", note: "AnyDesk is accepting direct connections." },
  6568: { name: "AnyDesk", severity: "medium", note: "AnyDesk is accepting direct connections." },
  21118: { name: "RustDesk", severity: "medium", note: "RustDesk is accepting direct connections." },
  8040: { name: "ScreenConnect", severity: "medium", note: "ConnectWise ScreenConnect is listening." },
  8041: { name: "ScreenConnect", severity: "medium", note: "ConnectWise ScreenConnect is listening." },
  5650: { name: "Remote Utilities (RMS)", severity: "high", note: "Remote Utilities is listening. It is often installed by scammers." },
  5405: { name: "NetSupport", severity: "high", note: "NetSupport is listening. Fake-update scams install it as a remote-access trojan." },
  4899: { name: "Radmin", severity: "high", note: "Radmin remote control is listening." },
  5985: { name: "Windows Remote Management", severity: "medium", note: "WinRM lets someone run commands remotely." },
  5986: { name: "Windows Remote Management", severity: "medium", note: "WinRM lets someone run commands remotely." },
  22: { name: "SSH remote login", severity: "medium", note: "Remote login over SSH is on." },
  23: { name: "Telnet", severity: "high", note: "Telnet is an old, unencrypted remote shell. Nothing on a home computer should offer it." },
  4444: { name: "a common backdoor port", severity: "high", note: "Port 4444 is the default for Metasploit and many backdoors." },
  1337: { name: "a common backdoor port", severity: "high", note: "Port 1337 is a favourite of hand-made backdoors." },
  31337: { name: "a common backdoor port", severity: "high", note: "Port 31337 is a classic backdoor port." },
  12345: { name: "a common backdoor port", severity: "high", note: "Port 12345 was used by NetBus and still by copycats." },
  1604: { name: "a known trojan port", severity: "high", note: "Port 1604 is used by the DarkComet trojan." },
  5552: { name: "a known trojan port", severity: "high", note: "Port 5552 is used by the njRAT trojan." },
  4782: { name: "a known trojan port", severity: "high", note: "Port 4782 is used by the Quasar trojan." },
  2404: { name: "a known trojan port", severity: "high", note: "Port 2404 is used by the Remcos trojan." },
};

// Remote ports that mean "talking to a backdoor controller or IRC botnet".
const BAD_REMOTE_PORTS: Record<number, string> = {
  4444: "Metasploit / generic backdoor",
  1337: "hand-made backdoor",
  31337: "classic backdoor",
  6666: "IRC botnet",
  6667: "IRC botnet",
  6697: "IRC botnet",
  1604: "DarkComet trojan",
  5552: "njRAT trojan",
  4782: "Quasar trojan",
  2404: "Remcos trojan",
  6606: "AsyncRAT trojan",
  7707: "AsyncRAT trojan",
  8808: "AsyncRAT trojan",
  3460: "Orcus trojan",
};

// Remote ports of the relay servers that remote-control apps keep open while running.
const RELAY_PORTS: Record<number, string> = {
  5938: "TeamViewer",
  7070: "AnyDesk",
  6568: "AnyDesk",
  21115: "RustDesk",
  21116: "RustDesk",
  21117: "RustDesk",
  8041: "ScreenConnect",
  5405: "NetSupport",
  5650: "Remote Utilities",
};

type ToolInfo = { name: string; severity: Severity; kind: "remote" | "rat" | "tunnel" | "shell" };
const TOOLS: Array<[RegExp, ToolInfo]> = [
  [/teamviewer/i, { name: "TeamViewer", severity: "medium", kind: "remote" }],
  [/anydesk/i, { name: "AnyDesk", severity: "medium", kind: "remote" }],
  [/rustdesk/i, { name: "RustDesk", severity: "medium", kind: "remote" }],
  [/screenconnect|connectwise/i, { name: "ConnectWise ScreenConnect", severity: "medium", kind: "remote" }],
  [/splashtop/i, { name: "Splashtop", severity: "medium", kind: "remote" }],
  [/logmein|gotoassist|goto ?resolve/i, { name: "LogMeIn / GoTo", severity: "medium", kind: "remote" }],
  [/ammyy/i, { name: "Ammyy Admin", severity: "high", kind: "remote" }],
  [/winvnc|tvnserver|vncserver|x11vnc|ultravnc|tightvnc|realvnc|\bvnc/i, { name: "VNC", severity: "high", kind: "remote" }],
  [/netsupport|client32\.exe/i, { name: "NetSupport", severity: "high", kind: "remote" }],
  [/rutserv|rfusclient|remote utilities/i, { name: "Remote Utilities", severity: "high", kind: "remote" }],
  [/atera/i, { name: "Atera", severity: "medium", kind: "remote" }],
  [/meshagent|mesh agent/i, { name: "MeshCentral agent", severity: "high", kind: "remote" }],
  [/simplehelp/i, { name: "SimpleHelp", severity: "medium", kind: "remote" }],
  [/supremo/i, { name: "Supremo", severity: "medium", kind: "remote" }],
  [/remotepc/i, { name: "RemotePC", severity: "medium", kind: "remote" }],
  [/zoho ?assist/i, { name: "Zoho Assist", severity: "medium", kind: "remote" }],
  [/dwagent|dwservice/i, { name: "DWService", severity: "medium", kind: "remote" }],
  [/radmin/i, { name: "Radmin", severity: "high", kind: "remote" }],
  [/action1/i, { name: "Action1", severity: "medium", kind: "remote" }],
  [/kaseya|tacticalrmm|ninjarmm|pulseway|syncro|itarian/i, { name: "IT management agent", severity: "low", kind: "remote" }],
  [/remoting_host|chrome remote desktop|chrome-remote-desktop/i, { name: "Chrome Remote Desktop", severity: "medium", kind: "remote" }],
  [/beyondtrust|bomgar/i, { name: "BeyondTrust", severity: "low", kind: "remote" }],
  [/nomachine|nxserver/i, { name: "NoMachine", severity: "medium", kind: "remote" }],
  [/quasar|asyncrat|njrat|remcos|darkcomet|nanocore|dcrat|xworm|warzone|netwire|meterpreter|sliver|havoc/i, { name: "a known remote-access trojan", severity: "high", kind: "rat" }],
  [/ngrok|cloudflared|chisel|frpc|frps/i, { name: "a network tunnel", severity: "high", kind: "tunnel" }],
  [/\b(nc|ncat|netcat|socat|plink)(\.exe)?$/i, { name: "a raw network shell tool", severity: "high", kind: "shell" }],
];

// Windows programs that should rarely hold a live connection to the internet.
const LOLBINS = /^(powershell|pwsh|cmd|rundll32|regsvr32|mshta|wscript|cscript|certutil|bitsadmin|msbuild|installutil|wmic)(\.exe)?$/i;
const ODD_PLACE = /\\appdata\\local\\temp\\|\\windows\\temp\\|\\users\\public\\|\\downloads\\|\\perflogs\\|\$recycle\.bin|^\/tmp\/|^\/var\/tmp\/|^\/dev\/shm\/|^\/private\/tmp\//i;
const ROAMING_EXE = /\\appdata\\roaming\\[^\\]+\.exe|\\programdata\\[^\\]+\.exe/i;
const ENCODED = /-e(nc(odedcommand)?)?\s+[A-Za-z0-9+/=]{20,}|frombase64string|downloadstring|iex\s*\(|invoke-expression|hidden/i;

export function isPrivate(addr?: string): boolean {
  if (!addr) return true;
  const a = addr.replace(/^::ffff:/i, "").replace(/%.*$/, "");
  if (a === "*" || a === "0.0.0.0" || a === "::" || a === "::1" || a === "[::]" || a === "") return true;
  if (/^127\./.test(a) || /^10\./.test(a) || /^192\.168\./.test(a) || /^169\.254\./.test(a)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(a)) return true;
  if (/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(a)) return true; // carrier-grade NAT
  if (/^f[cd][0-9a-f]{2}:/i.test(a) || /^fe80:/i.test(a)) return true;
  return false;
}

function isLoopback(addr?: string): boolean {
  if (!addr) return false;
  const a = addr.replace(/^::ffff:/i, "");
  return /^127\./.test(a) || a === "::1" || a === "localhost";
}

function splitHostPort(s: string): [string, number] {
  let t = s.trim().replace(/^\[/, "");
  const m = t.match(/^(.*?)\]?[:.](\d+|\*)$/);
  if (!m) return [t, 0];
  t = m[1].replace(/\]$/, "");
  return [t, m[2] === "*" ? 0 : Number(m[2])];
}

// ---------------------------------------------------------------- parsing

type Extra = {
  rdpEnabled?: boolean;
  rdpNla?: boolean;
  assist?: boolean;
  sessions: string[];
  services: Array<{ name: string; state: string; start: string; path: string }>;
  procs: Array<{ name: string; pid: string; path: string }>;
  autoruns: Array<{ where: string; name: string; command: string }>;
  tasks: Array<{ name: string; command: string }>;
  admins: string[];
  avRealtime?: boolean;
  avExclusions: string[];
  sharing: string[];
};

function emptyExtra(): Extra {
  return { sessions: [], services: [], procs: [], autoruns: [], tasks: [], admins: [], avExclusions: [], sharing: [] };
}

function parsePacketCheck(text: string, sockets: Socket[], extra: Extra): string | undefined {
  let os: string | undefined;
  for (const raw of text.split(/\r?\n/)) {
    const f = raw.split("\t");
    switch (f[0]) {
      case "INFO":
        if (f[1] === "os") os = f[2];
        break;
      case "LISTEN":
        sockets.push({ kind: "listen", localAddr: f[2], localPort: Number(f[3]), pid: f[4], process: f[5], path: f[6] });
        break;
      case "CONN":
        sockets.push({
          kind: "conn", localAddr: f[2], localPort: Number(f[3]), remoteAddr: f[4], remotePort: Number(f[5]),
          state: f[6], pid: f[7], process: f[8], path: f[9],
        });
        break;
      case "RDP":
        if (f[1] === "enabled") extra.rdpEnabled = f[2] === "1";
        if (f[1] === "nla") extra.rdpNla = f[2] === "1";
        break;
      case "ASSIST":
        extra.assist = f[2] === "1";
        break;
      case "SESSION":
        extra.sessions.push(f.slice(1).join(" "));
        break;
      case "SHARING":
        extra.sharing.push(f.slice(1).join(" "));
        break;
      case "SERVICE":
        extra.services.push({ name: f[1], state: f[2], start: f[3], path: f[4] ?? "" });
        break;
      case "PROC":
        extra.procs.push({ name: f[1], pid: f[2], path: f[3] ?? "" });
        break;
      case "AUTORUN":
        extra.autoruns.push({ where: f[1], name: f[2], command: f[3] ?? "" });
        break;
      case "TASK":
        extra.tasks.push({ name: f[1], command: f[2] ?? "" });
        break;
      case "ADMIN":
        extra.admins.push(f[1]);
        break;
      case "AV":
        if (f[1] === "defender_realtime") extra.avRealtime = f[2] === "1";
        if (f[1] === "exclusion") extra.avExclusions.push(f[2]);
        break;
    }
  }
  return os;
}

function parseRaw(text: string, sockets: Socket[]): SourceFormat {
  const lines = text.split(/\r?\n/);
  let format: SourceFormat = "unknown";
  let lastWin: Socket | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // netstat -b prints the owner on the following line: [chrome.exe]
    const owner = line.match(/^\[(.+)\]$/);
    if (owner && lastWin) {
      lastWin.process = owner[1];
      continue;
    }

    const f = line.split(/\s+/);

    // Windows: TCP 0.0.0.0:3389 0.0.0.0:0 LISTENING 1234
    if (/^TCP$/i.test(f[0]) && f.length >= 4 && /[:\]]\d+$/.test(f[1]) && !/^\d+$/.test(f[1])) {
      format = "windows-netstat";
      const [la, lp] = splitHostPort(f[1]);
      const [ra, rp] = splitHostPort(f[2]);
      const state = (f[3] || "").toUpperCase();
      const s: Socket =
        state === "LISTENING"
          ? { kind: "listen", localAddr: la, localPort: lp, pid: f[4] }
          : { kind: "conn", localAddr: la, localPort: lp, remoteAddr: ra, remotePort: rp, state, pid: f[4] };
      if (state === "LISTENING" || state === "ESTABLISHED" || state === "SYN_SENT") sockets.push(s);
      lastWin = s;
      continue;
    }
    if (/^UDP$/i.test(f[0])) { lastWin = null; continue; }

    // lsof: COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME (STATE)
    if (/^IPv[46]$/.test(f[4] ?? "") && /TCP/.test(line)) {
      format = "lsof";
      const name = f[8] ?? "";
      const stateM = line.match(/\((\w+)\)\s*$/);
      const state = stateM ? stateM[1] : "";
      if (state === "LISTEN") {
        const [la, lp] = splitHostPort(name);
        sockets.push({ kind: "listen", localAddr: la, localPort: lp, pid: f[1], process: f[0] });
      } else if (name.includes("->") && (state === "ESTABLISHED" || state === "SYN_SENT")) {
        const [l, r] = name.split("->");
        const [la, lp] = splitHostPort(l);
        const [ra, rp] = splitHostPort(r);
        sockets.push({ kind: "conn", localAddr: la, localPort: lp, remoteAddr: ra, remotePort: rp, state, pid: f[1], process: f[0] });
      }
      continue;
    }

    // ss: [Netid] State Recv-Q Send-Q Local Peer [users:(("sshd",pid=1,fd=3))]
    if (/^(tcp|udp)?$/i.test(f[0]) || /^(LISTEN|ESTAB|SYN-SENT)$/.test(f[0])) {
      const off = /^(LISTEN|ESTAB|SYN-SENT|UNCONN|TIME-WAIT|CLOSE-WAIT)$/.test(f[0]) ? 0 : 1;
      const state = f[off];
      if (/^(LISTEN|ESTAB|SYN-SENT)$/.test(state) && f.length >= off + 5) {
        if (off === 1 && !/^tcp$/i.test(f[0])) continue;
        format = "ss";
        const [la, lp] = splitHostPort(f[off + 3]);
        const [ra, rp] = splitHostPort(f[off + 4]);
        const u = line.match(/users:\(\("([^"]+)",pid=(\d+)/);
        if (state === "LISTEN") sockets.push({ kind: "listen", localAddr: la, localPort: lp, process: u?.[1], pid: u?.[2] });
        else sockets.push({ kind: "conn", localAddr: la, localPort: lp, remoteAddr: ra, remotePort: rp, state, process: u?.[1], pid: u?.[2] });
        continue;
      }
    }

    // Linux netstat -tunap: tcp 0 0 0.0.0.0:22 0.0.0.0:* LISTEN 900/sshd
    // macOS netstat -an:    tcp4 0 0 *.5900 *.* LISTEN
    if (/^tcp[46]{0,2}$/i.test(f[0]) && f.length >= 6) {
      const state = f[5].toUpperCase();
      if (state !== "LISTEN" && state !== "ESTABLISHED" && state !== "SYN_SENT") continue;
      const mac = /\.\d+$|\.\*$/.test(f[3]) && !/:\d+$/.test(f[3]);
      format = mac ? "macos-netstat" : "linux-netstat";
      const [la, lp] = splitHostPort(f[3]);
      const [ra, rp] = splitHostPort(f[4]);
      const pp = (f[6] ?? "").match(/^(\d+)\/(.+)$/);
      if (state === "LISTEN") sockets.push({ kind: "listen", localAddr: la, localPort: lp, pid: pp?.[1], process: pp?.[2] });
      else sockets.push({ kind: "conn", localAddr: la, localPort: lp, remoteAddr: ra, remotePort: rp, state, pid: pp?.[1], process: pp?.[2] });
    }
  }
  return format;
}

// ---------------------------------------------------------------- rules

function toolFor(...names: Array<string | undefined>): ToolInfo | null {
  const hay = names.filter(Boolean).join(" ");
  if (!hay) return null;
  for (const [re, info] of TOOLS) if (re.test(hay)) return info;
  return null;
}

function fmtSocket(s: Socket): string {
  const who = s.process ? `${s.process}${s.pid ? ` (pid ${s.pid})` : ""}` : s.pid ? `pid ${s.pid}` : "unknown program";
  if (s.kind === "listen") return `${who} listening on ${s.localAddr}:${s.localPort}`;
  return `${who} ${s.localAddr}:${s.localPort} → ${s.remoteAddr}:${s.remotePort}`;
}

const RANK: Record<Severity, number> = { high: 0, medium: 1, low: 2, info: 3 };

export function analyze(input: string): ScanResult {
  // Windows PowerShell 5.1 saves UTF-8 with a byte-order mark.
  const text = input.replace(/^\uFEFF/, "");
  const sockets: Socket[] = [];
  const extra = emptyExtra();
  let format: SourceFormat;
  let os: string | undefined;

  if (/^#PACKETCHECK v\d/m.test(text)) {
    format = "packetcheck";
    os = parsePacketCheck(text, sockets, extra);
  } else {
    format = parseRaw(text, sockets);
  }

  const findings = new Map<string, Finding>();
  const add = (f: Omit<Finding, "evidence">, evidence: string) => {
    const existing = findings.get(f.id);
    if (existing) {
      if (!existing.evidence.includes(evidence) && existing.evidence.length < 6) existing.evidence.push(evidence);
      if (RANK[f.severity] < RANK[existing.severity]) existing.severity = f.severity;
      return;
    }
    findings.set(f.id, { ...f, evidence: [evidence] });
  };

  const listening = sockets.filter((s) => s.kind === "listen");
  const conns = sockets.filter((s) => s.kind === "conn");
  const listenPorts = new Set(listening.filter((s) => !isLoopback(s.localAddr)).map((s) => s.localPort));

  // 1. Someone connected in right now over a remote-login port.
  for (const c of conns) {
    if (!c.remoteAddr || isLoopback(c.remoteAddr)) continue;
    const inboundPort = LISTEN_PORTS[c.localPort];
    if (inboundPort && listenPorts.has(c.localPort) && ["Remote Desktop (RDP)", "VNC screen sharing", "SSH remote login", "Telnet"].includes(inboundPort.name)) {
      const outside = !isPrivate(c.remoteAddr);
      add(
        {
          id: `inbound-${c.localPort}`,
          severity: outside ? "high" : "medium",
          title: `Someone is connected to this computer over ${inboundPort.name}`,
          detail: outside
            ? `An address on the internet (${c.remoteAddr}) is logged in to this computer right now.`
            : `Another device on your local network (${c.remoteAddr}) is logged in to this computer right now.`,
          action: outside
            ? "Unplug from the internet or turn off Wi-Fi now, then change your passwords from a different device."
            : "Make sure you know which device that is. If not, disconnect and turn the service off.",
        },
        fmtSocket(c),
      );
    }
  }

  // 2. Open listening ports that belong to remote-access tools or backdoors.
  for (const s of listening) {
    if (isLoopback(s.localAddr)) continue;
    const known = LISTEN_PORTS[s.localPort];
    if (!known) continue;
    add(
      {
        id: `listen-${known.name}`,
        severity: known.severity,
        title: `${known.name[0].toUpperCase()}${known.name.slice(1)} is open (port ${s.localPort})`,
        detail: known.note,
        action:
          known.severity === "high"
            ? "If you did not set this up, find the program that owns it, uninstall it and run a full antivirus scan."
            : "If you do not use it, turn it off. If you do, make sure it has a strong password.",
      },
      fmtSocket(s),
    );
  }

  // 3. Outbound connections to backdoor ports, remote-control relays and odd programs.
  const publicRemotes = new Set<string>();
  for (const c of conns) {
    if (!c.remoteAddr || isPrivate(c.remoteAddr)) continue;
    publicRemotes.add(c.remoteAddr);
    const bad = c.remotePort ? BAD_REMOTE_PORTS[c.remotePort] : undefined;
    if (bad) {
      add(
        {
          id: `badport-${c.remotePort}`,
          severity: "high",
          title: `Connection to port ${c.remotePort}, used by ${bad}`,
          detail: "Normal apps almost never use this port. A program on this computer may be taking orders from someone else.",
          action: "Disconnect from the internet, note the program name, then remove it and run a full antivirus scan.",
        },
        fmtSocket(c),
      );
    }
    const relay = c.remotePort ? RELAY_PORTS[c.remotePort] : undefined;
    if (relay) {
      add(
        {
          id: `relay-${relay}`,
          severity: "medium",
          title: `${relay} is online and reachable right now`,
          detail: `${relay} keeps a line open to its servers so someone with your ID can connect. That is fine if you use it, risky if a "support agent" installed it.`,
          action: `If you did not install ${relay} yourself, quit it and uninstall it. Check its connection history.`,
        },
        fmtSocket(c),
      );
    }
    const name = c.process ?? "";
    if (LOLBINS.test(name.split(/[\\/]/).pop() ?? "")) {
      add(
        {
          id: `lolbin-${name.toLowerCase()}`,
          severity: /powershell|pwsh|cmd/i.test(name) ? "medium" : "high",
          title: `${name} is talking to the internet`,
          detail: "This built-in Windows program rarely needs a live connection. Malware uses it to download and run code without leaving a file.",
          action: "If no script of yours is running, restart the computer and scan again. If it comes back, get help.",
        },
        fmtSocket(c),
      );
    }
    if (c.path && ODD_PLACE.test(c.path)) {
      add(
        {
          id: `oddplace-${c.path.toLowerCase()}`,
          severity: "high",
          title: `A program running from a temporary folder is online`,
          detail: "Installed software lives in Program Files or Applications. A program running from Temp, Downloads or Public that talks to the internet is a classic sign of a dropper.",
          action: "Note the path, end the process, delete the file and run a full antivirus scan.",
        },
        fmtSocket(c),
      );
    }
  }

  // 4. Remote-control software running or installed (by process or service name).
  const toolHits: Array<[ToolInfo, string]> = [];
  for (const s of sockets) {
    const t = toolFor(s.process, s.path);
    if (t) toolHits.push([t, fmtSocket(s)]);
  }
  for (const p of extra.procs) {
    const t = toolFor(p.name, p.path);
    if (t) toolHits.push([t, `${p.name} (pid ${p.pid}) ${p.path}`.trim()]);
    else if (ODD_PLACE.test(p.path) || ROAMING_EXE.test(p.path)) {
      add(
        {
          id: `procodd-${p.path.toLowerCase()}`,
          severity: "medium",
          title: `${p.name} runs from an unusual folder and uses the network`,
          detail: "Programs that install properly do not usually run straight from AppData, Temp or Public.",
          action: "Search the file name online. If you do not recognise it, end it and scan with your antivirus.",
        },
        `${p.name} (pid ${p.pid}) ${p.path}`,
      );
    }
  }
  for (const svc of extra.services) {
    const t = toolFor(svc.name, svc.path);
    if (t) toolHits.push([t, `service ${svc.name}: ${svc.state}, starts ${svc.start}`]);
    if (/^sshd$/i.test(svc.name) && /running/i.test(svc.state)) {
      add(
        {
          id: "svc-sshd",
          severity: "medium",
          title: "The OpenSSH server is running",
          detail: "Windows does not run an SSH server unless someone turned it on.",
          action: "If you did not enable it, stop the 'OpenSSH SSH Server' service and set it to Disabled.",
        },
        `service ${svc.name}: ${svc.state}`,
      );
    }
    if (/^winrm$/i.test(svc.name) && /running/i.test(svc.state) && listenPorts.has(5985)) {
      // Already covered by the port rule; nothing extra.
    }
  }
  for (const [t, ev] of toolHits) {
    const rat = t.kind === "rat";
    add(
      {
        id: `tool-${t.name}`,
        severity: t.severity,
        title: rat ? `Signs of ${t.name}` : `${t.name} is on this computer`,
        detail: rat
          ? "This name matches remote-access malware that gives someone full control."
          : t.kind === "tunnel"
            ? "Tunnels expose this computer to the internet past your router. Attackers use them to keep a way back in."
            : t.kind === "shell"
              ? "This tool can open a remote command line. Ordinary users never need it."
              : "Remote-control software lets someone see and drive this computer. Scammers often install it during a fake support call and it stays after you delete their app.",
        action: rat
          ? "Disconnect from the internet now. Run a full scan with Microsoft Defender Offline or Malwarebytes. Change passwords from another device."
          : "If you did not install it yourself, uninstall it, then check the list below for anything that starts it again.",
      },
      ev,
    );
  }

  // 5. Remote Desktop settings, sessions and sharing.
  if (extra.rdpEnabled) {
    add(
      {
        id: "rdp-on",
        severity: extra.rdpNla === false ? "high" : "medium",
        title: extra.rdpNla === false ? "Remote Desktop is on, without sign-in protection" : "Remote Desktop is switched on",
        detail:
          extra.rdpNla === false
            ? "Remote Desktop accepts connections and Network Level Authentication is off, which makes password guessing easier."
            : "Windows is set to accept Remote Desktop connections. Home computers normally have this off.",
        action: "Settings → System → Remote Desktop → Off, unless you rely on it.",
      },
      `RDP enabled${extra.rdpNla === false ? ", NLA off" : ""}`,
    );
  }
  if (extra.assist) {
    add(
      {
        id: "assist-on",
        severity: "low",
        title: "Remote Assistance invitations are allowed",
        detail: "Someone you invite can view and control this computer. Scammers ask victims to send invitations.",
        action: "Control Panel → System → Remote settings → untick 'Allow Remote Assistance connections'.",
      },
      "Remote Assistance enabled",
    );
  }
  for (const s of extra.sessions) {
    if (/rdp-tcp#\d+/i.test(s) && /active/i.test(s)) {
      add(
        {
          id: "rdp-session",
          severity: "high",
          title: "Someone is signed in over Remote Desktop right now",
          detail: "An active Remote Desktop session exists on this computer.",
          action: "If it is not you or someone you trust, disconnect from the internet and change your Windows password.",
        },
        s,
      );
    }
    const from = s.match(/\(([0-9a-fA-F.:]+)\)\s*$/);
    if (from && !isLoopback(from[1])) {
      add(
        {
          id: "unix-session",
          severity: isPrivate(from[1]) ? "medium" : "high",
          title: "Someone is logged in from another address",
          detail: `A login session comes from ${from[1]}.`,
          action: "If you do not recognise it, turn off Remote Login and change your password.",
        },
        s,
      );
    }
  }

  // 6. Startup entries and scheduled tasks that look like droppers.
  for (const a of extra.autoruns) {
    const cmd = a.command ?? "";
    if (ENCODED.test(cmd) || ODD_PLACE.test(cmd) || /mshta|wscript|cscript|rundll32.*,\s*#?\w+|regsvr32.*\/i:http/i.test(cmd)) {
      add(
        {
          id: `autorun-${a.name}`,
          severity: "high",
          title: `Suspicious program set to start with the computer: ${a.name}`,
          detail: "It starts from a temporary folder or runs hidden script code, which is how many backdoors survive a reboot.",
          action: "Remove this startup entry (Task Manager → Startup apps, or System Settings → Login Items) and delete the file it points to.",
        },
        `${a.where}: ${a.name} → ${cmd}`,
      );
    } else if (toolFor(a.name, cmd)) {
      add(
        {
          id: `autorun-tool-${a.name}`,
          severity: "medium",
          title: `A remote-control tool starts automatically: ${a.name}`,
          detail: "Even if you deleted the app you installed, this entry brings remote access back after every restart.",
          action: "Remove the startup entry and uninstall the tool if you do not use it.",
        },
        `${a.where}: ${a.name} → ${cmd}`,
      );
    }
  }
  for (const t of extra.tasks) {
    if (ENCODED.test(t.command) || ODD_PLACE.test(t.command) || ROAMING_EXE.test(t.command) || /mshta|wscript|cscript/i.test(t.command)) {
      add(
        {
          id: `task-${t.name}`,
          severity: "high",
          title: `Suspicious scheduled task: ${t.name.split(/[\\/]/).pop()}`,
          detail: "A scheduled task runs hidden script code or a program from a user folder. Malware uses tasks to come back after it is deleted.",
          action: "Open Task Scheduler, find this task, disable it and delete the program it runs.",
        },
        `${t.name} → ${t.command}`,
      );
    }
  }

  // 7. Antivirus tampering.
  if (extra.avRealtime === false) {
    add(
      {
        id: "av-off",
        severity: "medium",
        title: "Microsoft Defender real-time protection is off",
        detail: "Malware often switches it off. It is also off when another antivirus is installed.",
        action: "If you have no other antivirus, turn it back on in Windows Security.",
      },
      "Defender real-time protection: off",
    );
  }
  for (const x of extra.avExclusions) {
    add(
      {
        id: "av-exclusion",
        severity: ODD_PLACE.test(`${x}\\`) || /^[a-z]:\\?$/i.test(x) ? "high" : "medium",
        title: "Antivirus has folders it is told to ignore",
        detail: "Malware adds exclusions so the antivirus never looks at it.",
        action: "Windows Security → Virus & threat protection → Exclusions. Remove anything you did not add.",
      },
      x,
    );
  }

  // 8. Admin accounts: never a finding on their own, listed for the user to check.
  const people = extra.admins.filter((a) => !/^(root|_.*|NT AUTHORITY\\.*)$/i.test(a));
  if (people.length > 0) {
    add(
      {
        id: "admins",
        severity: "info",
        title: `${people.length} account${people.length === 1 ? "" : "s"} with admin rights`,
        detail: "Backdoors often add a hidden admin account. Make sure you recognise every name.",
        action: "Remove any admin account you did not create.",
      },
      people.slice(0, 6).join(", "),
    );
  }

  const list = [...findings.values()].sort((a, b) => RANK[a.severity] - RANK[b.severity]);
  let verdict: Verdict = "clear";
  if (sockets.length === 0 && format !== "packetcheck") verdict = "empty";
  else if (list.some((f) => f.severity === "high")) verdict = "alert";
  else if (list.some((f) => f.severity === "medium")) verdict = "review";

  return {
    format,
    os,
    sockets,
    listening: listening.length,
    connections: conns.length,
    publicRemotes: [...publicRemotes],
    findings: list,
    verdict,
  };
}

// The lines worth sending for the AI second opinion: drops loopback chatter so
// the request stays small (and cheap).
export function condenseForAI(text: string, maxChars = 24000): string {
  const keep: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trimEnd();
    if (!line) continue;
    if (/^(CONN|LISTEN)\t/.test(line)) {
      const f = line.split("\t");
      if (f[0] === "CONN" && isLoopback(f[4])) continue;
      if (f[0] === "LISTEN" && isLoopback(f[2])) continue;
    } else if (/(127\.0\.0\.1|\[::1\]|::1)[:.]\d+\s+(127\.0\.0\.1|\[::1\]|::1)/.test(line)) {
      continue;
    }
    keep.push(line);
    if (keep.join("\n").length > maxChars) break;
  }
  return keep.join("\n").slice(0, maxChars);
}

export const SAMPLE_WINDOWS_NETSTAT = `Active Connections

  Proto  Local Address          Foreign Address        State           PID
  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       1048
  TCP    0.0.0.0:445            0.0.0.0:0              LISTENING       4
  TCP    0.0.0.0:3389           0.0.0.0:0              LISTENING       1260
  TCP    0.0.0.0:5040           0.0.0.0:0              LISTENING       6412
  TCP    0.0.0.0:7070           0.0.0.0:0              LISTENING       5532
  TCP    127.0.0.1:49671        127.0.0.1:49672        ESTABLISHED     7720
  TCP    192.168.1.24:49702     52.112.94.40:443       ESTABLISHED     9104
  TCP    192.168.1.24:49731     140.82.113.26:443      ESTABLISHED     9104
  TCP    192.168.1.24:49788     185.229.191.39:443     ESTABLISHED     5532
  TCP    192.168.1.24:49812     45.137.21.9:4444       ESTABLISHED     3316
  TCP    [::]:135               [::]:0                 LISTENING       1048
  UDP    0.0.0.0:5353           *:*                                    2216`;
