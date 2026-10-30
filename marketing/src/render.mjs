// Renders every card in cards.mjs to PNG (and the handout to PDF) with headless Chrome.
// Usage: node marketing/src/render.mjs [name ...]
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { CARDS, HANDOUT } from "./cards.mjs";
import { MORE } from "./cards2.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "images");
const buildDir = join(here, "build");
mkdirSync(outDir, { recursive: true });
mkdirSync(buildDir, { recursive: true });

const CHROME = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
].find(existsSync);
if (!CHROME) throw new Error("No Chrome, Chromium or Edge found.");

export async function launch() {
  const profile = mkdtempSync(join(tmpdir(), "pc-render-"));
  const proc = spawn(CHROME, [
    "--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`,
    "--hide-scrollbars", "--force-color-profile=srgb", "--allow-file-access-from-files",
    "--no-first-run", "--no-default-browser-check", "about:blank",
  ], { stdio: ["ignore", "ignore", "pipe"] });
  const wsUrl = await new Promise((res, rej) => {
    let buf = "";
    proc.stderr.on("data", (d) => {
      buf += d;
      const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) res(m[1]);
    });
    setTimeout(() => rej(new Error("Chrome did not start")), 15000);
  });
  const ws = new WebSocket(wsUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let id = 0;
  const pending = new Map();
  const listeners = [];
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
    } else if (msg.method) listeners.forEach((l) => l(msg));
  });
  const send = (method, params = {}, sessionId) =>
    new Promise((res, rej) => {
      const n = ++id;
      pending.set(n, { res, rej });
      ws.send(JSON.stringify({ id: n, method, params, sessionId }));
    });
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const page = (method, params) => send(method, params, sessionId);
  await page("Page.enable");
  await page("Runtime.enable");
  const close = async () => {
    try { await send("Browser.close"); } catch {}
    await new Promise((r) => { proc.once("exit", r); proc.kill(); setTimeout(r, 3000); });
    try { rmSync(profile, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  };
  const waitFor = (method) => new Promise((r) => {
    const l = (m) => { if (m.method === method && m.sessionId === sessionId) { listeners.splice(listeners.indexOf(l), 1); r(m); } };
    listeners.push(l);
  });
  return { page, close, waitFor };
}

export function docFor(card) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<link href="https://api.fontshare.com/v2/css?f[]=switzer@400,500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../cards.css">
<style>html,body{width:${card.w}px;height:${card.h}px}${card.transparent ? "html,body{background:transparent!important}" : ""}</style>
</head><body>${card.html()}</body></html>`;
}

export async function open(b, card, scale = 1) {
  const file = join(buildDir, `${card.name}.html`);
  writeFileSync(file, docFor(card));
  await b.page("Emulation.setDeviceMetricsOverride", { width: card.w, height: card.h, deviceScaleFactor: scale, mobile: false });
  const loaded = b.waitFor("Page.loadEventFired");
  await b.page("Page.navigate", { url: pathToFileURL(file).href });
  await loaded;
  await b.page("Runtime.evaluate", { expression: "document.fonts.ready.then(() => document.fonts.check('500 20px Switzer'))", awaitPromise: true });
  // Report anything that spills out of its box, so overflow is caught before a human sees it.
  const { result } = await b.page("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const bad = [];
      const font = document.fonts.check('500 20px Switzer');
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width && (r.right > innerWidth + 0.5 || r.bottom > innerHeight + 0.5)) bad.push(el.tagName + '.' + el.className + ' ' + Math.round(r.right) + 'x' + Math.round(r.bottom));
        if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow === 'hidden') bad.push('clipped ' + el.tagName + '.' + el.className);
      }
      return { font, bad: bad.slice(0, 6) };
    })()`,
  });
  return result.value;
}

async function main() {
  const only = process.argv.slice(2);
  const jobs = [...CARDS, HANDOUT, ...MORE].filter((c) => !only.length || only.includes(c.name) || only.includes(c.dir));
  const b = await launch();
  try {
    for (const card of jobs) {
      const isHandout = card === HANDOUT;
      const scale = isHandout ? 300 / 96 : card.scale ?? 1;
      await b.page("Emulation.setDefaultBackgroundColorOverride", card.transparent ? { color: { r: 0, g: 0, b: 0, a: 0 } } : {});
      const check = await open(b, card, scale);
      const { data } = await b.page("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
      const dest = card.out ?? join(outDir, card.dir ?? "", `${card.name}.png`);
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, Buffer.from(data, "base64"));
      if (isHandout) {
        const pdf = await b.page("Page.printToPDF", { paperWidth: 8.5, paperHeight: 11, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0, printBackground: true, preferCSSPageSize: false });
        writeFileSync(join(outDir, `${card.name}.pdf`), Buffer.from(pdf.data, "base64"));
      }
      console.log(`${card.name}: ${card.w}x${card.h}@${scale.toFixed(2)} font=${check.font}${check.bad.length ? " OVERFLOW " + check.bad.join(" | ") : ""}`);
    }
  } finally {
    await b.close();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
