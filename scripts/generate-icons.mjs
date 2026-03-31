/**
 * Generates PNG icon assets from SVG sources for cross-platform favicon and
 * social-sharing (Open Graph / Twitter Card) support.
 *
 * Usage:  node scripts/generate-icons.mjs
 */

import sharp from "sharp";
import toIco from "to-ico";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, "../public");

async function fromSvg(svgPath, outPath, width, height) {
  const svg = readFileSync(svgPath);
  await sharp(svg)
    .resize(width, height)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outPath);
  console.log(`✓  ${outPath.replace(PUBLIC + "\\", "").replace(PUBLIC + "/", "")}  (${width}×${height})`);
}

async function main() {
  const favicon = resolve(PUBLIC, "favicon.svg");
  const appleIcon = resolve(PUBLIC, "apple-touch-icon.svg");
  const ogImage = resolve(PUBLIC, "og-image.svg");

  // Standard browser favicons
  await fromSvg(favicon, resolve(PUBLIC, "favicon-16x16.png"), 16, 16);
  await fromSvg(favicon, resolve(PUBLIC, "favicon-32x32.png"), 32, 32);
  await fromSvg(favicon, resolve(PUBLIC, "favicon-96x96.png"), 96, 96);

  // PWA / Android icons
  await fromSvg(favicon, resolve(PUBLIC, "icon-192x192.png"), 192, 192);
  await fromSvg(favicon, resolve(PUBLIC, "icon-512x512.png"), 512, 512);

  // iOS home-screen icon (must be PNG, no transparency rounded by OS)
  await fromSvg(appleIcon, resolve(PUBLIC, "apple-touch-icon.png"), 180, 180);

  // Open Graph / Twitter Card / LinkedIn share image
  await fromSvg(ogImage, resolve(PUBLIC, "og-image.png"), 1200, 630);

  // favicon.ico — multi-size ICO (16, 32, 48) for legacy browsers & OS
  const svg = readFileSync(favicon);
  const [ico16, ico32, ico48] = await Promise.all([
    sharp(svg).resize(16, 16).png().toBuffer(),
    sharp(svg).resize(32, 32).png().toBuffer(),
    sharp(svg).resize(48, 48).png().toBuffer(),
  ]);
  const icoBuffer = await toIco([ico16, ico32, ico48]);
  writeFileSync(resolve(PUBLIC, "favicon.ico"), icoBuffer);
  console.log("✓  favicon.ico  (16×16, 32×32, 48×48)");

  console.log("\nAll icons generated successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
