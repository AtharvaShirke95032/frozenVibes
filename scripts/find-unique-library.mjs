#!/usr/bin/env node
// Finds media-library uploads that are not visually duplicated anywhere on the site (perceptual dHash).
// Writes source/content/moments.json, which optimize-images.mjs uses for the "Moments" archive.
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "source/images");
const NOT_A_PHOTO = /frozen-vibes|^nik|^rah|2-for-website|default/i;

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (/\.(jpe?g|png)$/i.test(e.name)) out.push(p);
  }
  return out;
}

async function dhash(file) {
  const px = await sharp(file, { failOn: "none" }).rotate().grayscale().resize(17, 16, { fit: "fill" }).raw().toBuffer();
  let bits = 0n;
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) bits = (bits << 1n) | (px[y * 17 + x] > px[y * 17 + x + 1] ? 1n : 0n);
  return bits;
}
const distance = (a, b) => {
  let x = a ^ b, n = 0;
  while (x) { n += Number(x & 1n); x >>= 1n; }
  return n;
};

const files = (await walk(SRC)).map((f) => path.relative(SRC, f).split(path.sep).join("/"));
const hashes = new Map();
for (const f of files) hashes.set(f, await dhash(path.join(SRC, f)));

const shown = files.filter((f) => !f.startsWith("library-unused/"));
const unique = [];
for (const f of files.filter((f) => f.startsWith("library-unused/")).sort()) {
  if (NOT_A_PHOTO.test(path.basename(f))) continue;
  const h = hashes.get(f);
  const dup = [...shown, ...unique].some((o) => distance(h, hashes.get(o)) <= 12);
  if (!dup) unique.push(f);
}
await writeFile(path.join(ROOT, "source/content/moments.json"), JSON.stringify(unique, null, 2));
console.log(`${unique.length} unique of ${files.filter((f) => f.startsWith("library-unused/")).length} library-only uploads`);
