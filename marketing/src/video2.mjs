// Animated promo videos made from timed HTML scenes, captured frame by frame in headless Chrome.
//   vertical  1080x1920, ~21 s: Reels, Shorts, TikTok, Stories
//   square    1080x1080, ~21 s: LinkedIn, Instagram and X feeds
//   landscape 1920x1080, ~30 s: the opening scenes, the real checker demo, then the end card
// Usage: node marketing/src/video2.mjs [vertical|square|landscape]
import { writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { launch } from "./render.mjs";
import { MARK } from "./cards.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "video");
const FPS = 30;

// Scene timings in seconds.
const T = { s1: 0, s2: 3.2, s3: 6.6, s4: 10.6, s5: 14.6, s6: 17.8, end: 21.5 };

const words = (text, start, step = 0.12, cls = "w") =>
  text
    .split(" ")
    .map((w, i) => `<span class="${cls}" style="animation-delay:${(start + i * step).toFixed(2)}s">${w}</span>`)
    .join(" ");

const scene = (from, to, inner, extra = "") =>
  `<section class="scene ${extra}" style="animation-delay:${from}s, ${(to - 0.35).toFixed(2)}s">${inner}</section>`;

const DIMS = { vertical: [1080, 1920], landscape: [1920, 1080], square: [1080, 1080] };

function page(orientation) {
  const vertical = orientation !== "landscape"; // square shares the narrow layout
  const square = orientation === "square";
  const [W, H] = DIMS[orientation];
  const pad = square ? "84px 84px" : vertical ? "250px 84px 360px" : "110px 160px";
  const apps = ["AnyDesk", "TeamViewer", "UltraViewer", "ScreenConnect", "RustDesk", "Supremo"];

  const scenes = [
    scene(T.s1, T.s2, `
      <p class="kicker" style="animation-delay:0.1s">After a "support" call</p>
      <h1 class="big">${words(`Had a "Microsoft support" call?`, 0.3)}</h1>`, "deep"),

    scene(T.s2, T.s3, `
      <h1 class="mid">${words("They installed a remote-control app.", T.s2 + 0.1)}</h1>
      <div class="tiles">${apps.map((a, i) => `<span class="tile pop" style="animation-delay:${(T.s2 + 0.9 + i * 0.16).toFixed(2)}s">${a}</span>`).join("")}</div>`),

    scene(T.s3, T.s4, `
      <h1 class="mid">${words("You deleted the icon.", T.s3 + 0.1)}</h1>
      <div class="icon-row">
        <span class="tile tile--big gone" style="animation-delay:${T.s3 + 0.5}s, ${T.s3 + 1.3}s">AnyDesk</span>
        <span class="tag up" style="animation-delay:${T.s3 + 1.5}s">deleted</span>
      </div>
      <h1 class="mid warn">${words("The service is still running.", T.s3 + 2.0)}</h1>`, "deep"),

    scene(T.s4, T.s5, `
      <h1 class="mid">${words("PacketCheck finds it in 30 seconds.", T.s4 + 0.1)}</h1>
      <div class="ui fcard up" style="animation-delay:${T.s4 + 1.0}s">
        <div class="verdict">Signs of remote access</div>
        <div class="finding">
          <span class="pill pill--high">High</span>
          <div class="finding__t">UltraViewer is on this computer</div>
          <div class="finding__d">Remote-control software lets someone see and drive this computer. Scammers often install it during a fake support call and it stays after you delete their app.</div>
          <div class="finding__e">service UltraViewer_Service: Running, starts Auto</div>
        </div>
      </div>`),

    scene(T.s5, T.s6, `
      <ul class="facts">
        <li class="up" style="animation-delay:${T.s5 + 0.1}s">Free.</li>
        <li class="up" style="animation-delay:${T.s5 + 0.6}s">Read-only.</li>
        <li class="up" style="animation-delay:${T.s5 + 1.1}s">Nothing uploaded.</li>
      </ul>
      <p class="sub up" style="animation-delay:${T.s5 + 1.7}s">Windows, macOS and Linux. The script is plain text you can read first.</p>`, "field"),

    `<section class="scene deep last" style="animation-delay:${T.s6}s">
      <span class="logo up" style="animation-delay:${T.s6 + 0.1}s">${MARK(true)}</span>
      <h1 class="big up" style="animation-delay:${T.s6 + 0.3}s">packetcheck.net</h1>
      <p class="sub up" style="animation-delay:${T.s6 + 0.8}s">Is anyone else on your computer?</p>
      <p class="promise up" style="animation-delay:${T.s6 + 1.4}s">Nobody from PacketCheck will ever call you.</p>
    </section>`,
  ].join("");

  // Unit u = 1px at 1080 on the short side.
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://api.fontshare.com/v2/css?f[]=switzer@400,500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../cards.css">
<style>
html,body{width:${W}px;height:${H}px;background:var(--bg)}
.scene{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:${pad};gap:${square ? 36 : vertical ? 56 : 44}px;
  background:var(--bg);color:var(--ink);opacity:0;animation:sceneIn .35s ease-out both, sceneOut .35s ease-in forwards}
.scene.last{animation:sceneIn .35s ease-out both}
.scene.deep{background:var(--deep);color:var(--on-deep)}
.scene.field{background:var(--field);color:#fff}
.big{font-size:${vertical ? 118 : 128}px;max-width:${vertical ? 920 : 1500}px}
.mid{font-size:${vertical ? 96 : 92}px;max-width:${vertical ? 920 : 1500}px}
.warn{color:#e2b45a}
.kicker{font-size:${vertical ? 38 : 34}px;color:#a9c48a;font-weight:500;opacity:0;animation:up .6s cubic-bezier(.23,1,.32,1) both}
.w{display:inline-block;opacity:0;animation:up .6s cubic-bezier(.23,1,.32,1) both}
.up{opacity:0;animation:up .7s cubic-bezier(.23,1,.32,1) both}
.pop{opacity:0;animation:pop .45s cubic-bezier(.23,1,.32,1) both}
.tiles{display:grid;grid-template-columns:repeat(${vertical ? 2 : 3},1fr);gap:20px;max-width:${vertical ? 920 : 1400}px}
.tile{display:block;background:var(--ui-bg);color:var(--ui-text);border:1px solid var(--ui-line);border-radius:14px;padding:${vertical ? "34px 32px" : "30px 32px"};font-size:${vertical ? 46 : 44}px;font-weight:500;letter-spacing:-0.02em}
.icon-row{display:flex;align-items:center;gap:32px}
.tile--big{display:inline-block;font-size:56px;padding:40px 48px}
.gone{animation:pop .45s cubic-bezier(.23,1,.32,1) both, gone .7s ease-in forwards}
.tag{font-family:var(--mono);font-size:40px;color:#a9c48a}
.fcard{max-width:${vertical ? 920 : 1300}px;font-size:${vertical ? 34 : 30}px;overflow:hidden}
.fcard .verdict{background:var(--high-bg);color:var(--high);font-weight:500;padding:26px 30px;font-size:1.2em;border-bottom:1px solid var(--ui-line)}
.fcard .finding{padding:30px}
.fcard .finding__t{font-size:1.25em}
.facts{list-style:none;display:grid;gap:12px}
.facts li{font-size:${vertical ? 150 : 140}px;font-weight:500;letter-spacing:-0.04em;line-height:1}
.sub{font-size:${vertical ? 44 : 40}px;line-height:1.3;max-width:${vertical ? 900 : 1300}px;opacity:0.9}
.logo{display:block;width:${vertical ? 150 : 130}px;height:${vertical ? 150 : 130}px}
.logo svg{width:100%;height:100%;display:block}
.promise{font-size:${vertical ? 38 : 34}px;color:#a9c48a}
@keyframes sceneIn{from{opacity:0}to{opacity:1}}
@keyframes sceneOut{from{opacity:1}to{opacity:0}}
@keyframes up{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}
@keyframes pop{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:none}}
@keyframes gone{to{opacity:.18;transform:scale(.82);filter:grayscale(1)}}
${square ? `.big{font-size:100px}.mid{font-size:76px}.facts li{font-size:118px}.tile{padding:24px 28px;font-size:38px}.tiles{gap:14px}.fcard{font-size:27px}.sub{font-size:36px}.logo{width:120px;height:120px}` : ""}
</style></head><body>${scenes}</body></html>`;
}

async function capture(orientation, ranges) {
  const [W, H] = DIMS[orientation];
  const dir = join(here, "build", `frames-${orientation}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const file = join(here, "build", `scenes-${orientation}.html`);
  writeFileSync(file, page(orientation));

  const b = await launch();
  const js = async (expression) =>
    (await b.page("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result.value;
  const parts = [];
  try {
    await b.page("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
    const loaded = b.waitFor("Page.loadEventFired");
    await b.page("Page.navigate", { url: pathToFileURL(file).href });
    await loaded;
    await js("document.fonts.ready.then(() => document.getAnimations().forEach(a => a.pause()) || true)");
    for (const [ri, [from, to]] of ranges.entries()) {
      let n = 0;
      for (let t = from; t < to; t += 1 / FPS) {
        await js(`document.getAnimations().forEach(a => { a.currentTime = ${Math.round(t * 1000)}; }) || true`);
        const { data } = await b.page("Page.captureScreenshot", { format: "jpeg", quality: 92 });
        writeFileSync(join(dir, `r${ri}-${String(++n).padStart(5, "0")}.jpg`), Buffer.from(data, "base64"));
      }
      const part = join(here, "build", `${orientation}-part${ri}.mp4`);
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", join(dir, `r${ri}-%05d.jpg`),
        "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-pix_fmt", "yuv420p", "-r", String(FPS), part]);
      parts.push(part);
      console.log(`${orientation} part ${ri}: ${n} frames`);
    }
  } finally {
    await b.close();
  }
  return parts;
}

const which = process.argv[2];

if (!which || which === "vertical") {
  const [part] = await capture("vertical", [[0, T.end]]);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", part, "-c", "copy", "-movflags", "+faststart", join(outDir, "promo-vertical-1080x1920.mp4")]);
  console.log("wrote promo-vertical-1080x1920.mp4");
}

if (!which || which === "square") {
  const [part] = await capture("square", [[0, T.end]]);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", part, "-c", "copy", "-movflags", "+faststart", join(outDir, "promo-square-1080x1080.mp4")]);
  console.log("wrote promo-square-1080x1080.mp4");
}

if (!which || which === "landscape") {
  const demo = join(outDir, "demo-checker.mp4");
  if (!existsSync(demo)) throw new Error("Run video.mjs first to record the checker demo.");
  const [intro, outro] = await capture("landscape", [[0, T.s4], [T.s5, T.end]]);
  // Middle: the real checker recording, scaled from 1600x900 to 1920x1080.
  const mid = join(here, "build", "landscape-demo.mp4");
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", demo, "-vf", "scale=1920:1080:flags=lanczos,fps=30,format=yuv420p",
    "-c:v", "libx264", "-preset", "slow", "-crf", "19", mid]);
  const out = join(outDir, "promo-landscape-1920x1080.mp4");
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", intro, "-i", mid, "-i", outro, "-filter_complex",
    "[0:v][1:v][2:v]concat=n=3:v=1:a=0[v]", "-map", "[v]", "-c:v", "libx264", "-preset", "slow", "-crf", "19",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", out]);
  console.log("wrote promo-landscape-1920x1080.mp4");
}
