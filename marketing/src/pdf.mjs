// Bundles the carousel PNGs into one PDF for LinkedIn document posts.
import { writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { launch } from "./render.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const dir = join(here, "..", "images", "carousel");
const slides = readdirSync(dir).filter((f) => /^carousel-\d+\.png$/.test(f)).sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
const html = `<!doctype html><html><head><style>
@page { size: 1080px 1350px; margin: 0 }
html, body { margin: 0 } img { display: block; width: 1080px; height: 1350px; page-break-after: always }
</style></head><body>${slides.map((s) => `<img src="${pathToFileURL(join(dir, s)).href}">`).join("")}</body></html>`;
const file = join(here, "build", "carousel.html");
writeFileSync(file, html);

const b = await launch();
try {
  const loaded = b.waitFor("Page.loadEventFired");
  await b.page("Page.navigate", { url: pathToFileURL(file).href });
  await loaded;
  const pdf = await b.page("Page.printToPDF", { preferCSSPageSize: true, printBackground: true, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 });
  writeFileSync(join(dir, "carousel-linkedin.pdf"), Buffer.from(pdf.data, "base64"));
  console.log(`carousel-linkedin.pdf: ${slides.length} pages`);
} finally {
  await b.close();
}
