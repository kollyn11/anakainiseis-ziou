/**
 * Builds the static vector logo (a clean redraw of the client's runner logo) into src/assets/brand/:
 *   logo-runner.svg   runner only (hero, page headers, footer, icons)
 *   logo-full.svg     runner + "ΑΝΑΚΑΙΝΙΣΕΙΣ ΖΙΟΥ" + "est 2025"
 * Runner geometry lives in src/assets/brand/runner-parts.mjs (shared with the animated header logo).
 * Figure and lettering use currentColor (navy on light, white on dark); cap, brush paint and "est 2025" are orange.
 * Lettering is Commissioner, slanted like the original, converted to outlines.
 *
 * Run: npm run logo
 */
import { readFile, writeFile } from 'node:fs/promises';
import opentype from 'opentype.js';
import { ACCENT as GREY, RUNNER_BOX, runnerSvg } from '../src/assets/brand/runner-parts.mjs';


// ---------------------------------------------------------------- lettering
const font = async (subset, weight) => {
  const b = await readFile(`node_modules/@fontsource/commissioner/files/commissioner-${subset}-${weight}-normal.woff`);
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};
const fonts = { 500: [await font('greek', 500), await font('latin', 500)], 400: [await font('greek', 400), await font('latin', 400)] };
const num = (n) => String(Math.round(n * 10) / 10);
const toD = (cmds) =>
  cmds
    .map((c) =>
      c.type === 'Z' ? 'Z'
      : c.type === 'Q' ? `Q${num(c.x1)} ${num(c.y1)} ${num(c.x)} ${num(c.y)}`
      : c.type === 'C' ? `C${num(c.x1)} ${num(c.y1)} ${num(c.x2)} ${num(c.y2)} ${num(c.x)} ${num(c.y)}`
      : `${c.type}${num(c.x)} ${num(c.y)}`,
    )
    .join('');
function text(str, weight, size, tracking) {
  let x = 0, d = '';
  for (const ch of str) {
    const f = fonts[weight].find((ff) => ff.charToGlyphIndex(ch) > 0) ?? fonts[weight][1];
    const g = f.charToGlyph(ch);
    d += toD(g.getPath(x, 0, size).commands);
    x += (g.advanceWidth / f.unitsPerEm) * size + tracking * size;
  }
  return { d, width: x - tracking * size };
}

// "ΑΝΑΚΑΙΝΙΣΕΙΣ ΖΙΟΥ" spans the figure's width under the feet; slanted 12° like the original.
const name = text('ΑΝΑΚΑΙΝΙΣΕΙΣ ΖΙΟΥ', 500, 100, 0.02);
const nameScale = 1180 / name.width;
const est = text('est 2025', 400, 100, 0.02);
const estScale = 0.62;
const fullLettering = `
<g transform="translate(70 1760) scale(${num(nameScale)}) skewX(-12)" fill="currentColor"><path d="${name.d}"/></g>
<g transform="translate(${num(660 - (est.width * estScale) / 2)} 1880) scale(${estScale})" fill="${GREY}"><path d="${est.d}"/></g>`;
const FULL_BOX = { x: 40, y: 20, w: 1240, h: 1900 };

const wrap = (box, label, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.x} ${box.y} ${box.w} ${box.h}" role="img" aria-label="${label}">\n${inner}\n</svg>\n`;

await writeFile('src/assets/brand/logo-runner.svg', wrap(RUNNER_BOX, 'ΖΙΟΥ Ανακαινίσεις', runnerSvg('ziou-cut')));
await writeFile('src/assets/brand/logo-full.svg', wrap(FULL_BOX, 'Ανακαινίσεις ΖΙΟΥ — est 2025', runnerSvg('ziou-cut') + fullLettering));
console.log('written logo-runner.svg, logo-full.svg');
