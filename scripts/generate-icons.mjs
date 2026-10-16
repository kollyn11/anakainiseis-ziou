/**
 * Generates favicon.ico, apple-touch-icon.png, PWA icons and og-image.png
 * from the brand SVGs in src/assets/brand/. Run with: npm run icons
 * Output goes to public/. Text is converted to outlines (Commissioner),
 * so the result does not depend on fonts installed on the machine.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import opentype from 'opentype.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = (f) => path.join(root, 'public', f);
const brand = (f) => path.join(root, 'src/assets/brand', f);
const fontFile = (subset, weight) =>
  path.join(root, `node_modules/@fontsource/commissioner/files/commissioner-${subset}-${weight}-normal.woff`);

const NAVY = '#14325C';
const ORANGE = '#E8662B';

const iconSvg = await readFile(brand('logo-icon.svg'), 'utf8');
const inverseSvg = await readFile(brand('logo-icon-inverse.svg'), 'utf8');
const wordmarkSvg = await readFile(brand('logo-wordmark.svg'), 'utf8');

// The icon's inner mark (roof + walls), reused for full-bleed icons.
const markPaths = `
  <path d="M18 58 L52 28 L86 58" fill="none" stroke="${ORANGE}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M32 54 L32 80 L72 80 L72 54" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;

const png = (svg, size) => sharp(Buffer.from(svg), { density: 600 }).resize(size, size).png().toBuffer();

/** Full-bleed square icon: navy background, mark scaled to `scale` of the canvas. */
const fullBleed = (scale) => {
  const s = 104 * scale;
  const offset = (104 - s) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 104 104"><rect width="104" height="104" fill="${NAVY}"/><g transform="translate(${offset} ${offset + 2}) scale(${scale})">${markPaths}</g></svg>`;
};

// ---------- Icons ----------
await writeFile(pub('favicon.svg'), iconSvg);
await writeFile(pub('icon-192.png'), await png(iconSvg, 192));
await writeFile(pub('icon-512.png'), await png(iconSvg, 512));
await writeFile(pub('icon-maskable-512.png'), await png(fullBleed(0.78), 512));
await writeFile(pub('apple-touch-icon.png'), await png(fullBleed(1.0), 180));
const icoSizes = await Promise.all([16, 32, 48].map((s) => png(iconSvg, s)));
await writeFile(pub('favicon.ico'), await pngToIco(icoSizes));

// ---------- Text to outlines ----------
const loadFont = async (subset, weight) => {
  const buf = await readFile(fontFile(subset, weight));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
};
const fonts = {
  800: [await loadFont('greek', 800), await loadFont('latin', 800)],
  500: [await loadFont('greek', 500), await loadFont('latin', 500)],
};

// opentype.js's own toPathData() can emit "NaN" for some coordinates, so format commands ourselves.
const num = (n) => String(Math.round(n * 100) / 100);
const toD = (cmds) =>
  cmds
    .map((c) =>
      c.type === 'Z'
        ? 'Z'
        : c.type === 'Q'
          ? `Q${num(c.x1)} ${num(c.y1)} ${num(c.x)} ${num(c.y)}`
          : c.type === 'C'
            ? `C${num(c.x1)} ${num(c.y1)} ${num(c.x2)} ${num(c.y2)} ${num(c.x)} ${num(c.y)}`
            : `${c.type}${num(c.x)} ${num(c.y)}`,
    )
    .join('');

/** Returns { d, width } for text at fontSize, with extra letter spacing in em. */
function textPath(text, weight, fontSize, x, y, tracking = 0) {
  let cursor = x;
  let d = '';
  for (const ch of text) {
    const font = fonts[weight].find((f) => f.charToGlyphIndex(ch) > 0) ?? fonts[weight][1];
    const glyph = font.charToGlyph(ch);
    d += toD(glyph.getPath(cursor, y, fontSize).commands);
    cursor += (glyph.advanceWidth / font.unitsPerEm) * fontSize + tracking * fontSize;
  }
  const width = cursor - x - tracking * fontSize;
  return { d, width };
}

// ---------- OG image 1200×630 ----------
const W = 1200;
const H = 630;

// Lockup geometry
const iconSize = 168;
const wordH = 130; // wordmark viewBox is 2074×960
const wordW = (wordH * 2074) / 960;
const tagSize = 27;
const tagTracking = 0.32;
const tagMeasure = textPath('ΑΝΑΚΑΙΝΙΣΕΙΣ', 500, tagSize, 0, 0, tagTracking).width;
const textBlockW = Math.max(wordW, tagMeasure);
const gap = 34;
const lockupW = iconSize + gap + textBlockW;
const lockupX = (W - lockupW) / 2;
const lockupY = 150;

const textX = lockupX + iconSize + gap;
const wordY = lockupY + 4;
const tagY = wordY + wordH + tagSize + 8;
const tag = textPath('ΑΝΑΚΑΙΝΙΣΕΙΣ', 500, tagSize, textX + 4, tagY, tagTracking);

const claimSize = 76;
const claimMeasure = textPath('Χτίζουμε σωστά.', 800, claimSize, 0, 0, -0.02).width;
const claimX = (W - claimMeasure) / 2;
const claimY = 500;
const claim = textPath('Χτίζουμε σωστά.', 800, claimSize, claimX, claimY, -0.02);

const wordInner = wordmarkSvg
  .replace(/^<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '')
  .replaceAll('currentColor', '#FFFFFF');
const inverseInner = inverseSvg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${NAVY}"/>
  <g opacity="0.06" stroke="#FFFFFF" stroke-width="1">
    ${Array.from({ length: Math.ceil(W / 48) }, (_, i) => `<path d="M${i * 48 + 0.5} 0V${H}"/>`).join('')}
    ${Array.from({ length: Math.ceil(H / 48) }, (_, i) => `<path d="M0 ${i * 48 + 0.5}H${W}"/>`).join('')}
  </g>
  <svg x="${lockupX}" y="${lockupY}" width="${iconSize}" height="${iconSize}" viewBox="0 0 104 104">${inverseInner}</svg>
  <svg x="${textX}" y="${wordY}" width="${wordW}" height="${wordH}" viewBox="0 -200 2074 960">${wordInner}</svg>
  <path d="${tag.d}" fill="${ORANGE}"/>
  <path d="${claim.d}" fill="#FFFFFF"/>
  <rect x="${claimX + 4}" y="${claimY + 22}" width="${claim.width * 0.36}" height="8" fill="${ORANGE}" transform="translate(${claim.width * 0.6} 0)"/>
  <rect x="0" y="${H - 14}" width="${W}" height="14" fill="${ORANGE}"/>
</svg>`;

await writeFile(pub('og-image.png'), await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toBuffer());

console.log('Generated: favicon.svg, favicon.ico, apple-touch-icon.png, icon-192/512, icon-maskable-512, og-image.png');
