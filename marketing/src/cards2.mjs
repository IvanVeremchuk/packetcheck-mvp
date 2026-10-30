// Second batch: profile and banner assets, a carousel, stories, an infographic and guide share images.
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { MARK, mark, FINDINGS, finding, verdictHead } from "./cards.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const siteOg = (slug) => join(here, "..", "..", "frontend", "public", "images", "og", `${slug}.png`);

const bigMark = (px, deep = false) => `<span style="display:block;width:${px}px;height:${px}px">${MARK(deep).replace("<svg", '<svg style="width:100%;height:100%;display:block"')}</span>`;

// ---------- Brand: avatar, headers, icons ----------
const BRAND = [
  {
    name: "avatar-400",
    dir: "brand",
    w: 400,
    h: 400,
    scale: 2,
    html: () => `<div class="card" style="align-items:center;justify-content:center">${bigMark(230)}</div>`,
  },
  {
    name: "avatar-400-dark",
    dir: "brand",
    w: 400,
    h: 400,
    scale: 2,
    html: () => `<div class="card card--deep" style="align-items:center;justify-content:center">${bigMark(230, true)}</div>`,
  },
  {
    name: "header-x-1500x500",
    dir: "brand",
    w: 1500,
    h: 500,
    html: () => `
<div class="card card--deep" style="align-items:center;justify-content:flex-end;padding:0 80px">
  <div class="photo" style="position:absolute;inset:0 62% 0 0;opacity:0.55;background-image:url(../../../frontend/public/images/switchboard-1902.jpg)"></div>
  <div style="position:absolute;inset:0 62% 0 0;background:linear-gradient(90deg,transparent 40%,var(--deep))"></div>
  <div style="position:relative;max-width:820px">
    <h1 style="font-size:78px">Is anyone else on your computer?</h1>
    <p class="lead" style="font-size:26px;margin-top:22px;color:var(--on-deep-muted)">A free, read-only check for remote access · packetcheck.net</p>
  </div>
</div>`,
  },
  {
    name: "banner-linkedin-1584x396",
    dir: "brand",
    w: 1584,
    h: 396,
    html: () => `
<div class="card" style="align-items:center;justify-content:flex-end;padding:0 88px">
  <div style="max-width:900px">
    <h1 style="font-size:66px">Is anyone else on your computer?</h1>
    <p class="lead" style="font-size:24px;margin-top:18px">A 30-second, read-only check for remote access after a scam call. Free, and nothing is uploaded.</p>
  </div>
</div>`,
  },
  {
    name: "youtube-2560x1440",
    dir: "brand",
    w: 2560,
    h: 1440,
    html: () => `
<div class="card card--deep" style="align-items:center;justify-content:center">
  <div class="photo" style="position:absolute;inset:0;opacity:0.28;background-image:url(../../../frontend/public/images/switchboard-1902.jpg)"></div>
  <div style="position:relative;width:1546px;height:423px;display:flex;align-items:center;gap:56px">
    ${bigMark(200, true)}
    <div>
      <h1 style="font-size:104px">Is anyone else on your computer?</h1>
      <p class="lead" style="font-size:36px;margin-top:20px;color:var(--on-deep-muted)">Plain-English checks for remote access · packetcheck.net</p>
    </div>
  </div>
</div>`,
  },
  {
    name: "icon-512",
    dir: "brand",
    w: 512,
    h: 512,
    transparent: true,
    html: () => `<div class="card" style="background:transparent">${bigMark(512)}</div>`,
  },
  {
    name: "apple-icon",
    dir: "brand",
    w: 180,
    h: 180,
    out: join(here, "..", "..", "frontend", "src", "app", "apple-icon.png"),
    html: () => `<div class="card card--deep" style="align-items:center;justify-content:center">${bigMark(120, true)}</div>`,
  },
  {
    name: "favicon-48",
    dir: "brand",
    w: 48,
    h: 48,
    transparent: true,
    html: () => `<div class="card" style="background:transparent">${bigMark(48)}</div>`,
  },
];

// ---------- Carousel (4:5): the apps a fake support caller asks you to install ----------
const SLIDES = 7;
const counter = (i, deep) => `<span style="font-size:24px;${deep ? "color:var(--on-deep-muted)" : "color:var(--muted)"}">${i} / ${SLIDES}</span>`;
const slideFoot = (i, deep = false, next = true) => `
<div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;font-size:24px">
  ${mark(24, deep)}
  <span style="display:flex;gap:22px;align-items:center">${counter(i, deep)}${next ? `<span style="font-weight:500">Swipe →</span>` : ""}</span>
</div>`;

const APPS = ["AnyDesk", "TeamViewer", "UltraViewer", "ScreenConnect", "RustDesk", "Supremo", "AeroAdmin", "LogMeIn Rescue"];

const CAROUSEL = [
  {
    name: "carousel-1",
    html: () => `
<div class="card card--deep" style="flex-direction:column;padding:84px">
  <span style="font-size:26px;color:#a9c48a;font-weight:500">After a "support" call</span>
  <h1 style="font-size:104px;margin-top:auto">The apps a fake support caller asks you to install.</h1>
  <p class="lead" style="font-size:34px;margin-top:36px;color:var(--on-deep-muted)">And why deleting them isn't the end of it.</p>
  <div style="margin-top:84px">${slideFoot(1, true)}</div>
</div>`,
  },
  {
    name: "carousel-2",
    html: () => `
<div class="card" style="flex-direction:column;padding:84px">
  <h1 style="font-size:88px">Real apps, used for the wrong reason.</h1>
  <p class="lead" style="font-size:30px;margin-top:26px">IT teams use these every day. A caller asks you to install one so they can see and control your screen.</p>
  <ul style="list-style:none;margin-top:auto;display:grid;grid-template-columns:1fr 1fr;gap:18px">
    ${APPS.map((a) => `<li class="ui" style="padding:38px 32px;font-size:44px;font-weight:500;letter-spacing:-0.02em">${a}</li>`).join("")}
  </ul>
  <div style="margin-top:64px">${slideFoot(2)}</div>
</div>`,
  },
  {
    name: "carousel-3",
    html: () => `
<div class="card card--field" style="flex-direction:column;padding:84px">
  <span style="font-size:26px;font-weight:500;opacity:0.8">Already on your PC</span>
  <h1 style="font-size:112px;margin-top:auto">Quick Assist is built into Windows.</h1>
  <p class="lead" style="font-size:38px;margin-top:40px;max-width:880px">Callers ask you to open it and read out a code. Microsoft has warned about exactly this. If someone you did not call asks for the code, hang up.</p>
  <div style="margin-top:96px">${slideFoot(3, true)}</div>
</div>`,
  },
  {
    name: "carousel-4",
    html: () => `
<div class="card" style="flex-direction:column;padding:84px">
  <h1 style="font-size:88px">Why antivirus stays quiet.</h1>
  <p class="lead" style="font-size:34px;margin-top:36px;max-width:860px">These apps aren't viruses. They're signed, legitimate software, so most antivirus lets them run. The danger is who is on the other end.</p>
  <div class="ui" style="margin-top:auto;font-size:30px">
    <div class="finding" style="padding:34px">
      <span class="pill pill--medium">Check</span>
      <div class="finding__t" style="font-size:40px">UltraViewer is on this computer</div>
      <div class="finding__d">Remote-control software lets someone see and drive this computer. Scammers often install it during a fake support call and it stays after you delete their app.</div>
      <div class="finding__e">service UltraViewer_Service: Running, starts Auto</div>
    </div>
  </div>
  <p style="font-size:24px;margin-top:18px;color:var(--muted)">What PacketCheck shows when it finds one.</p>
  <div style="margin-top:64px">${slideFoot(4)}</div>
</div>`,
  },
  {
    name: "carousel-5",
    html: () => `
<div class="card card--deep" style="flex-direction:column;padding:84px">
  <h1 style="font-size:88px">Deleting the icon isn't enough.</h1>
  <p class="lead" style="font-size:34px;margin-top:36px;color:var(--on-deep-muted);max-width:860px">Most of these install a background service and a startup entry. The icon goes; the door stays open.</p>
  <div class="term" style="margin-top:auto;font-size:28px;padding:40px 34px;background:#191916;border:1px solid #3a3a34"><span class="t-dim">Icon on desktop .... </span><span class="t-ok">deleted</span>
<span class="t-dim">Service ............ </span><span class="t-warn">Running, starts Auto</span>
<span class="t-dim">Startup entry ...... </span><span class="t-warn">still there</span></div>
  <div style="margin-top:96px">${slideFoot(5, true)}</div>
</div>`,
  },
  {
    name: "carousel-6",
    html: () => {
      const steps = [
        ["Settings → Apps → Installed apps", "Uninstall any of these you did not choose."],
        ["Windows + R, type services.msc", "Make sure none of the names is still listed."],
        ["Task Manager → Startup apps", "Disable anything you don't recognise."],
        ["Settings → Accounts → Other users", "Look for an account you didn't create."],
      ];
      return `
<div class="card" style="flex-direction:column;padding:84px">
  <h1 style="font-size:88px">Check by hand in 5 minutes.</h1>
  <ol style="list-style:none;margin-top:auto;display:grid;gap:34px">
    ${steps
      .map(
        ([t, d], i) => `<li style="display:grid;grid-template-columns:76px 1fr;border-top:1px solid var(--ui-line);padding-top:28px">
      <span style="font-size:48px;font-weight:500;color:var(--accent)">${i + 1}</span>
      <span><b style="display:block;font-size:42px;font-weight:500;letter-spacing:-0.02em">${t}</b><span style="display:block;font-size:31px;margin-top:8px;color:var(--muted)">${d}</span></span>
    </li>`,
      )
      .join("")}
  </ol>
  <div style="margin-top:80px">${slideFoot(6)}</div>
</div>`;
    },
  },
  {
    name: "carousel-7",
    html: () => `
<div class="card card--field" style="flex-direction:column;padding:84px">
  <h1 style="font-size:116px;margin-top:auto">Or check it all in 30 seconds.</h1>
  <p class="lead" style="font-size:34px;margin-top:38px;max-width:880px">PacketCheck is a free, read-only scan for remote-control apps, Remote Desktop, startup items and admin accounts. Nothing is uploaded.</p>
  <span class="url" style="font-size:52px;margin-top:56px">packetcheck.net</span>
  <p style="font-size:28px;margin-top:20px;opacity:0.85">Nobody from PacketCheck will ever call you.</p>
  <div style="margin-top:96px">${slideFoot(7, true, false)}</div>
</div>`,
  },
].map((c) => ({ ...c, dir: "carousel", w: 1080, h: 1350 }));

// ---------- Stories (9:16). Top 250 px and bottom 340 px kept clear for the app's own UI. ----------
const STORIES = [
  {
    name: "story-1-question",
    html: () => `
<div class="card card--deep" style="flex-direction:column;padding:260px 80px 360px">
  <div class="photo" style="position:absolute;inset:0 0 58% 0;opacity:0.6;background-image:url(../../../frontend/public/images/switchboard-1902.jpg)"></div>
  <div style="position:absolute;inset:0 0 58% 0;background:linear-gradient(180deg,transparent 30%,var(--deep))"></div>
  <h1 style="font-size:118px;margin-top:auto;position:relative">Had a "Microsoft support" call?</h1>
  <p class="lead" style="font-size:42px;margin-top:40px;color:var(--on-deep-muted);position:relative">Check if anyone is still on your computer. Free, read-only, 30 seconds.</p>
  <span class="url" style="font-size:46px;color:#a9c48a;margin-top:56px;position:relative">packetcheck.net</span>
</div>`,
  },
  {
    name: "story-2-steps",
    html: () => {
      const steps = [
        ["Unplug the internet.", "Wi-Fi off until you're done."],
        ["Call your bank.", "The number on your card."],
        ["Change your email password.", "From your phone."],
        ["Remove the remote app.", "And what it left behind."],
        ["Report it.", "reportfraud.ftc.gov"],
      ];
      return `
<div class="card card--field" style="flex-direction:column;padding:250px 80px 340px">
  <h1 style="font-size:104px">Let a stranger in? The first hour.</h1>
  <ol style="list-style:none;margin-top:64px;display:grid;gap:38px">
    ${steps
      .map(
        ([t, d], i) => `<li style="display:grid;grid-template-columns:84px 1fr;align-items:baseline">
      <span style="font-size:64px;font-weight:500;opacity:0.55">${i + 1}</span>
      <span><b style="display:block;font-size:50px;font-weight:500;letter-spacing:-0.02em">${t}</b><span style="display:block;font-size:34px;opacity:0.85;margin-top:6px">${d}</span></span>
    </li>`,
      )
      .join("")}
  </ol>
  <span class="url" style="font-size:40px;margin-top:auto">packetcheck.net/guides</span>
</div>`;
    },
  },
  {
    name: "story-3-promise",
    html: () => `
<div class="card" style="flex-direction:column;padding:260px 80px 360px">
  ${mark(40)}
  <h1 style="font-size:130px;margin-top:auto">We will never call you.</h1>
  <p class="lead" style="font-size:44px;margin-top:44px">Or pop up a warning, or ask to connect to your computer. If someone says they are PacketCheck and asks for access, hang up.</p>
</div>`,
  },
  {
    name: "story-4-result",
    html: () => `
<div class="card" style="flex-direction:column;padding:250px 64px 340px">
  <h1 style="font-size:96px">What the check shows you.</h1>
  <div class="ui" style="margin-top:72px;font-size:36px;overflow:hidden">
    ${verdictHead(34)}
    ${FINDINGS.slice(0, 2).map((f) => finding(f, { evidence: false, action: true })).join("")}
  </div>
  <span class="url" style="font-size:44px;margin-top:auto">packetcheck.net</span>
</div>`,
  },
].map((c) => ({ ...c, dir: "stories", w: 1080, h: 1920 }));

// ---------- Infographic: the six places a remote connection shows itself ----------
const SIX = [
  ["Network connections", "Every open port and live connection, and the program behind it."],
  ["Remote Desktop", "Whether it's on, whether sign-in protection is off, and who is connected now."],
  ["Remote-control apps", "Services and programs of 30+ remote tools and known remote-access trojans."],
  ["Startup items", "Run keys, startup folders, scheduled tasks, launch agents, cron and systemd."],
  ["Admin accounts", "Everyone with full control of the computer. Look for names you don't recognise."],
  ["Antivirus status", "Whether Defender is on, and folders it has been told to ignore."],
];

const sixGrid = (cols, fs) => `
<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:18px;margin-top:auto">
  ${SIX.map(
    ([t, d], i) => `<div class="ui" style="padding:${fs * 1.1}px;display:grid;gap:${fs * 0.5}px;align-content:start">
    <span style="font-size:${fs * 0.9}px;color:var(--accent);font-weight:500">${i + 1} / 6</span>
    <b style="font-size:${fs * 1.45}px;font-weight:500;letter-spacing:-0.015em">${t}</b>
    <span style="font-size:${fs}px;line-height:1.4;color:var(--ui-muted)">${d}</span>
  </div>`,
  ).join("")}
</div>`;

const INFO = [
  {
    name: "six-places-1600x900",
    w: 1600,
    h: 900,
    html: () => `
<div class="card" style="flex-direction:column;padding:72px">
  <div style="display:flex;justify-content:space-between;align-items:end;gap:40px">
    <h1 style="font-size:84px;max-width:980px">Six places a remote connection shows itself.</h1>
    ${mark(28)}
  </div>
  ${sixGrid(3, 22)}
  <p style="font-size:22px;margin-top:28px;color:var(--muted)">The free PacketCheck scan reads all six in about 30 seconds. It changes nothing and uploads nothing. <b style="font-weight:500;color:var(--ink)">packetcheck.net</b></p>
</div>`,
  },
  {
    name: "six-places-1080x1350",
    w: 1080,
    h: 1350,
    html: () => `
<div class="card" style="flex-direction:column;padding:72px">
  <h1 style="font-size:84px">Six places a remote connection shows itself.</h1>
  ${sixGrid(2, 23)}
  <div style="margin-top:36px;display:flex;justify-content:space-between;align-items:center">${mark(26)}<span class="url" style="font-size:26px">packetcheck.net</span></div>
</div>`,
  },
].map((c) => ({ ...c, dir: "infographic" }));

// ---------- Share images for each guide page (installed on the site) ----------
const GUIDE_OG = [
  ["someone-accessed-my-computer", "The first hour after a remote-access scam", "Someone accessed my computer. What now?", "field"],
  ["check-remote-access", "Check by hand on Windows and Mac", "Is someone remotely accessing your computer?", "deep"],
  ["read-netstat", "netstat, ss and lsof explained", "How to read netstat: what's normal, what's not", ""],
].map(([slug, kicker, title, tone]) => ({
  name: `guide-${slug}`,
  dir: "guides",
  w: 1200,
  h: 630,
  out: siteOg(slug),
  html: () => `
<div class="card ${tone ? `card--${tone}` : ""}" style="flex-direction:column;padding:64px">
  <span style="font-size:24px;font-weight:500;${tone ? "opacity:0.8" : "color:var(--accent)"}">Guide · ${kicker}</span>
  <h1 style="font-size:80px;margin-top:auto;max-width:1000px">${title}</h1>
  <div style="margin-top:48px;display:flex;justify-content:space-between;align-items:center">${mark(24, !!tone)}<span class="url" style="font-size:24px">packetcheck.net/guides</span></div>
</div>`,
}));

export const MORE = [...BRAND, ...CAROUSEL, ...STORIES, ...INFO, ...GUIDE_OG];
