// Records a short demo of the real in-browser checker (local dev server) and encodes it with ffmpeg.
// Needs `npm run dev` in frontend/ on port 3000. Usage: node marketing/src/video.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { launch } from "./render.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "video");
const frames = join(here, "build", "frames");
rmSync(frames, { recursive: true, force: true });
mkdirSync(frames, { recursive: true });

const W = 1600, H = 900, FPS = 30;
const report = readFileSync(join(outDir, "demo-report.txt"), "utf8");
const list = [];
let n = 0;

const b = await launch();
const js = async (expression) =>
  (await b.page("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result.value;

async function shot(seconds) {
  const { data } = await b.page("Page.captureScreenshot", { format: "png" });
  const file = `f${String(++n).padStart(4, "0")}.png`;
  writeFileSync(join(frames, file), Buffer.from(data, "base64"));
  list.push(`file '${file}'\nduration ${seconds.toFixed(4)}`);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  // Keep test traffic out of the real analytics.
  await b.page("Network.enable");
  await b.page("Network.setBlockedURLs", { urls: ["*posthog*", "*i.posthog.com*"] });
  await b.page("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  const loaded = b.waitFor("Page.loadEventFired");
  await b.page("Page.navigate", { url: "http://localhost:3000/" });
  await loaded;
  await js("document.fonts.ready.then(() => true)");
  await sleep(2500);

  // Hide the dev-mode badge and the cursor caret so frames stay clean.
  await js(`(() => { const s = document.createElement('style'); s.textContent = 'nextjs-portal{display:none!important} textarea{caret-color:transparent}'; document.head.appendChild(s); return true; })()`);

  // Start on the checker, cleared.
  await js(`(() => { const el = document.getElementById('check'); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 24); return true; })()`);
  await js(`(() => { [...document.querySelectorAll('#check button')].find(b => b.textContent.trim() === 'Clear').click(); return true; })()`);
  await sleep(500);
  await shot(1.4);

  // Paste the report the way a person would: focus, then insert the whole clipboard.
  await js(`(() => { document.getElementById('pc-input').focus(); return true; })()`);
  await b.page("Input.insertText", { text: report });
  await sleep(700);
  await js(`(() => { document.getElementById('pc-input').scrollTop = 0; return true; })()`);
  await sleep(200);
  await shot(2.2);

  // Open the startup-item finding too, then scroll the findings panel (it scrolls on its own).
  const opened = await js(`(() => { const d = document.querySelectorAll('#check details'); if (d[3]) d[3].open = true; return d.length; })()`);
  await sleep(300);
  await js(`(() => {
    let el = document.querySelector('#check details');
    while (el && !(el.scrollHeight > el.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(el).overflowY))) el = el.parentElement;
    window.__panel = el || document.scrollingElement;
    return !!el;
  })()`);
  await shot(1.6);
  const max = await js("window.__panel.scrollHeight - window.__panel.clientHeight");
  const dist = Math.min(max, 520);
  const steps = Math.round(FPS * 2.4);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    await js(`(() => { window.__panel.scrollTop = ${dist} * ${e}; return true; })()`);
    await shot(1 / FPS);
  }
  await shot(2.6);

  list.push(`file 'f${String(n).padStart(4, "0")}.png'`); // concat demuxer needs the last file repeated
  writeFileSync(join(frames, "list.txt"), list.join("\n") + "\n");
  console.log(`frames: ${n}, findings shown: ${opened}`);
} finally {
  await b.close();
}

const mp4 = join(outDir, "demo-checker.mp4");
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", join(frames, "list.txt"),
  "-vf", `fps=${FPS},format=yuv420p`, "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-movflags", "+faststart", mp4]);
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", mp4, "-vf",
  "fps=12,scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer:bayer_scale=4",
  join(outDir, "demo-checker.gif")]);
console.log("wrote", mp4);
