/**
 * Generates favicon.ico, apple-touch-icon.png, PWA icons and og-image.png
 * from the vector logo in src/assets/brand/ (logo-runner.svg, logo-full.svg). Run with: npm run icons
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

const INK = '#1C1C1C';
const GREY = '#8D8D8D';

const runnerSvg = await readFile(brand('logo-runner.svg'), 'utf8');
const fullSvg = await readFile(brand('logo-full.svg'), 'utf8');
const inner = (svg, color) =>
  svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replaceAll('currentColor', color);
const viewBoxOf = (svg) => svg.match(/viewBox="([^"]+)"/)[1];

const png = (svg, size) => sharp(Buffer.from(svg), { density: 300 }).resize(size, size).png().toBuffer();

/**
 * Square icon: white runner (grey cap) on charcoal.
 * `radius` rounds the tile (0 for full-bleed icons), `scale` = runner height as a share of the tile.
 */
const tile = (radius, scale) => {
  const S = 1000;
  const [vx, vy, vw, vh] = viewBoxOf(runnerSvg).split(' ').map(Number);
  const h = S * scale;
  const w = (h * vw) / vh;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}"><rect width="${S}" height="${S}" rx="${radius}" fill="${INK}"/><svg x="${(S - w) / 2}" y="${(S - h) / 2}" width="${w}" height="${h}" viewBox="${vx} ${vy} ${vw} ${vh}">${inner(runnerSvg, '#FFFFFF')}</svg></svg>`;
};

// ---------- Icons ----------
const icon = tile(220, 0.84);
await writeFile(pub('favicon.svg'), icon);
await writeFile(pub('icon-192.png'), await png(icon, 192));
await writeFile(pub('icon-512.png'), await png(icon, 512));
await writeFile(pub('icon-maskable-512.png'), await png(tile(0, 0.62), 512));
await writeFile(pub('apple-touch-icon.png'), await png(tile(0, 0.8), 180));
const icoSizes = await Promise.all([16, 32, 48].map((s) => png(tile(220, 0.9), s)));
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

// Full logo (runner + lettering) on the left, in white with the grey cap
const [fx, fy, fw, fh] = viewBoxOf(fullSvg).split(' ').map(Number);
const logoH = 500;
const logoW = (logoH * fw) / fh;
const logoX = 110;
const logoY = (H - 14 - logoH) / 2;

// Claim on the right
const claimSize = 78;
const claimX = logoX + logoW + 90;
const claim = textPath('Χτίζουμε σωστά.', 800, claimSize, claimX, 290, -0.02);
const sub1 = textPath('Ανακαινίσεις κατοικιών και', 500, 34, claimX, 370);
const sub2 = textPath('επαγγελματικών χώρων στην Αττική', 500, 34, claimX, 418);

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${INK}"/>
  <g opacity="0.05" stroke="#FFFFFF" stroke-width="1">
    ${Array.from({ length: Math.ceil(W / 48) }, (_, i) => `<path d="M${i * 48 + 0.5} 0V${H}"/>`).join('')}
    ${Array.from({ length: Math.ceil(H / 48) }, (_, i) => `<path d="M0 ${i * 48 + 0.5}H${W}"/>`).join('')}
  </g>
  <svg x="${logoX}" y="${logoY}" width="${logoW}" height="${logoH}" viewBox="${fx} ${fy} ${fw} ${fh}">${inner(fullSvg, '#FFFFFF')}</svg>
  <path d="${claim.d}" fill="#FFFFFF"/>
  <rect x="${claimX + claim.width * 0.5}" y="312" width="${claim.width * 0.42}" height="8" fill="${GREY}"/>
  <path d="${sub1.d}" fill="#C8C8C8"/>
  <path d="${sub2.d}" fill="#C8C8C8"/>
  <rect x="0" y="${H - 14}" width="${W}" height="14" fill="${GREY}"/>
</svg>`;

await writeFile(pub('og-image.png'), await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toBuffer());

console.log('Generated: favicon.svg, favicon.ico, apple-touch-icon.png, icon-192/512, icon-maskable-512, og-image.png');
