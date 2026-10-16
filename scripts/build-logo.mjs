/**
 * Builds the vector logo (a clean redraw of the client's runner logo) into src/assets/brand/:
 *   logo-runner.svg   runner only (used in the header lockup, hero, icons)
 *   logo-full.svg     runner + "ΑΝΑΚΑΙΝΙΣΕΙΣ ΖΙΟΥ" + "est 2025"
 * The figure and lettering use fill/stroke="currentColor" (black on light, white on dark);
 * the cap and "est 2025" are grey. Tool details are cut out with a mask, so the logo works on any background.
 * Lettering is Commissioner, slanted like the original, converted to outlines.
 *
 * Run: node scripts/build-logo.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import opentype from 'opentype.js';

const GREY = '#8D8D8D';
const LIMB = 112; // stroke width of torso, arms and legs

// ---------------------------------------------------------------- runner
// Coordinates are in a 2× space of the original artwork (origin at its 300,130).
const brush = `
  <g transform="translate(1082 442) rotate(-21)">
    <path d="M-72 6 Q-72 0 -66 0 L66 0 Q72 0 72 6 L72 104 L-72 104 Z"/>
    <rect x="-68" y="104" width="136" height="46" rx="4"/>
    <path d="M-34 150 L34 150 L22 342 Q20 362 0 362 Q-20 362 -22 342 Z"/>
  </g>`;
const brushCuts = `
  <g transform="translate(1082 442) rotate(-21)">
    <path d="M-40 -2 L-34 46 L-28 -2 Z M30 -2 L36 34 L42 -2 Z"/>
    <rect x="-68" y="100" width="136" height="7"/>
    <rect x="-68" y="124" width="136" height="6"/>
    <circle cx="0" cy="336" r="9"/>
  </g>`;

// Drill: axis from the grip's top (522,928) down-left to the chuck tip (328,1218)
const drill = `
  <g transform="translate(522 928) rotate(34)">
    <rect x="-46" y="-20" width="92" height="232" rx="44"/>
    <rect x="-40" y="212" width="80" height="34" rx="4"/>
    <path d="M-34 246 L34 246 L22 318 L-22 318 Z"/>
    <path d="M-14 318 L14 318 L4 356 L-4 356 Z"/>
  </g>
  <g transform="translate(244 858) rotate(-51)">
    <rect x="-84" y="-40" width="168" height="80" rx="8"/>
  </g>
  <path d="M276 878 L408 964 L384 1004 L252 918 Z"/>`;
const drillCuts = `
  <g transform="translate(522 928) rotate(34)">
    <rect x="-28" y="-2" width="56" height="196" rx="28"/>
    <rect x="-40" y="226" width="80" height="6"/>
    <rect x="-34" y="262" width="68" height="6"/>
    <rect x="-28" y="284" width="56" height="6"/>
  </g>
  <g transform="translate(244 858) rotate(-51)">
    <rect x="-84" y="-14" width="168" height="7"/>
    <rect x="-84" y="8" width="168" height="7"/>
  </g>`;
// The hole at the top of the grip is ink again (drawn after the cut)
const drillDot = `<circle cx="512" cy="952" r="13"/>`;

const cap = `
  <path d="M548 292 C508 226 504 140 560 82 C612 30 724 24 792 82 L842 150
           C894 160 952 176 982 200 C998 216 978 246 946 248
           C884 254 842 280 800 302 C738 308 680 286 640 262
           C602 262 572 276 548 292 Z" fill="${GREY}"/>`;
const capCuts = `
  <path d="M600 40 C590 80 610 120 632 156" fill="none" stroke-width="8" stroke-linecap="round"/>
  <path d="M790 172 C810 162 832 156 852 156" fill="none" stroke-width="8" stroke-linecap="round"/>
  <path d="M938 242 C960 236 974 222 978 206" fill="none" stroke-width="8" stroke-linecap="round"/>`;
const capSeams = `
  <path d="M636 172 L668 238 M668 238 L774 180" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;

const body = `
  <circle cx="692" cy="292" r="148"/>
  <g fill="none" stroke="currentColor" stroke-width="${LIMB}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M660 526 L654 1090"/>
    <path d="M660 526 L384 640 L384 900"/>
    <path d="M660 526 L840 800 L1118 670"/>
    <path d="M654 1090 L978 1220 L1010 1534"/>
    <path d="M650 1092 L464 1390 L160 1294"/>
  </g>`;

function runnerSvg(id) {
  return `<defs>
  <mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="1400" height="1700">
    <rect width="1400" height="1700" fill="#fff"/>
    <g fill="#000" stroke="#000">${brushCuts}${drillCuts}${capCuts}</g>
  </mask>
</defs>
<g mask="url(#${id})">
  <g fill="currentColor">${body}${drill}${brush}</g>
  ${cap}
</g>
<g fill="currentColor">${drillDot}</g>
${capSeams}`;
}
const RUNNER_BOX = { x: 40, y: 20, w: 1240, h: 1620 };

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
