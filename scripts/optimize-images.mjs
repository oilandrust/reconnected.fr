#!/usr/bin/env node
/**
 * Convert source photos to WebP (≤ 1200 px wide) into Content/Assets/.
 * Requires `cwebp` (brew install webp).
 *
 *   node scripts/optimize-images.mjs <source-dir>
 *
 * File names matter: the engine derives `alt` text from the basename
 * (`olivier-rouiller.webp` → "olivier rouiller"), and the template treats
 * names starting with `deco-` as decorative (empty alt).
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SOURCES = {
  'olivier-portrait.jpg': { out: 'olivier-rouiller.webp', width: 900 },
  'about-portrait.jpg': { out: 'olivier-rouiller-portrait.webp', width: 900 },
  'contact-landscape.webp': { out: 'olivier-rouiller-strasbourg.webp', width: 400 },
  'hakomi-landscape.jpg': { out: 'deco-lever-de-soleil.webp', width: 1200 },
  'hero-after-rain.webp': { out: 'deco-foret-brume.webp', width: 800 },
};

const sourceDir = path.resolve(process.argv[2] ?? '../re-connected/public/images');
const outDir = path.resolve('Content/Assets');
fs.mkdirSync(outDir, { recursive: true });

for (const [file, { out, width }] of Object.entries(SOURCES)) {
  const from = path.join(sourceDir, file);
  if (!fs.existsSync(from)) {
    console.warn(`skip ${file} (not found)`);
    continue;
  }
  const to = path.join(outDir, out);
  execFileSync('cwebp', ['-quiet', '-q', '78', '-resize', String(width), '0', from, '-o', to]);
  const kb = Math.round(fs.statSync(to).size / 1024);
  console.log(`${file} → Assets/${out} (${kb} KB)`);
}
