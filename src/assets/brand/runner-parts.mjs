/**
 * Geometry of the ΖΙΟΥ runner logo — the single source for the static SVGs
 * (scripts/build-logo.mjs) and the scroll-animated header logo (RunnerAnimated.astro).
 *
 * Coordinates are in a 2× space of the client's original artwork (origin at its 300,130).
 * Ink parts use currentColor (navy on light, white on dark); the cap, the paint on the brush
 * and "est 2025" use the brand orange.
 */

export const ACCENT = '#E8662B';
export const LIMB = 112; // stroke width of torso, arms and legs
export const RUNNER_BOX = { x: 40, y: 20, w: 1240, h: 1620 };

/** Skeleton of the drawn (resting) pose. */
export const JOINTS = {
  head: { x: 692, y: 292, r: 148 },
  shoulder: { x: 660, y: 526 },
  hip: { x: 654, y: 1090 },
  // back arm holds the drill, front arm holds the brush
  backElbow: { x: 384, y: 640 },
  backHand: { x: 384, y: 900 },
  frontElbow: { x: 840, y: 800 },
  frontHand: { x: 1118, y: 670 },
  // front leg reaches forward (right), rear leg pushes off behind (left)
  frontKnee: { x: 978, y: 1220 },
  frontFoot: { x: 1010, y: 1534 },
  rearKnee: { x: 464, y: 1390 },
  rearFoot: { x: 160, y: 1294 },
};

export const brush = `
  <g transform="translate(1082 442) rotate(-21)">
    <path d="M-72 6 Q-72 0 -66 0 L66 0 Q72 0 72 6 L72 104 L-72 104 Z"/>
    <rect x="-68" y="104" width="136" height="46" rx="4"/>
    <path d="M-34 150 L34 150 L22 342 Q20 362 0 362 Q-20 362 -22 342 Z"/>
    <path d="M-72 6 Q-72 0 -66 0 L66 0 Q72 0 72 6 L72 52 L-72 52 Z" fill="${ACCENT}"/>
  </g>`;
export const brushCuts = `
  <g transform="translate(1082 442) rotate(-21)">
    <path d="M-40 -2 L-34 46 L-28 -2 Z M30 -2 L36 34 L42 -2 Z"/>
    <rect x="-68" y="100" width="136" height="7"/>
    <rect x="-68" y="124" width="136" height="6"/>
    <circle cx="0" cy="336" r="9"/>
  </g>`;

// Drill: axis from the grip's top (522,928) down-left to the chuck tip (328,1218)
export const drill = `
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
export const drillCuts = `
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
/** The hole at the top of the grip is ink again (drawn after the cut). */
export const drillDot = `<circle cx="512" cy="952" r="13"/>`;

export const cap = `
  <path d="M548 292 C508 226 504 140 560 82 C612 30 724 24 792 82 L842 150
           C894 160 952 176 982 200 C998 216 978 246 946 248
           C884 254 842 280 800 302 C738 308 680 286 640 262
           C602 262 572 276 548 292 Z" fill="${ACCENT}"/>`;
export const capCuts = `
  <path d="M600 40 C590 80 610 120 632 156" fill="none" stroke-width="8" stroke-linecap="round"/>
  <path d="M790 172 C810 162 832 156 852 156" fill="none" stroke-width="8" stroke-linecap="round"/>
  <path d="M938 242 C960 236 974 222 978 206" fill="none" stroke-width="8" stroke-linecap="round"/>`;
export const capSeams = `
  <path d="M636 172 L668 238 M668 238 L774 180" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;

const p = (a) => `${a.x} ${a.y}`;
const J = JOINTS;

/** Limb path data for the drawn pose (also the animation's resting pose). */
export const limbs = {
  torso: `M${p(J.shoulder)} L${p(J.hip)}`,
  backArm: `M${p(J.shoulder)} L${p(J.backElbow)} L${p(J.backHand)}`,
  frontArm: `M${p(J.shoulder)} L${p(J.frontElbow)} L${p(J.frontHand)}`,
  frontLeg: `M${p(J.hip)} L${p(J.frontKnee)} L${p(J.frontFoot)}`,
  rearLeg: `M${p(J.hip)} L${p(J.rearKnee)} L${p(J.rearFoot)}`,
};

/** Static runner (all parts in their drawn positions). `id` must be unique per page. */
export function runnerSvg(id) {
  return `<defs>
  <mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="1400" height="1700">
    <rect width="1400" height="1700" fill="#fff"/>
    <g fill="#000" stroke="#000">${brushCuts}${drillCuts}${capCuts}</g>
  </mask>
</defs>
<g mask="url(#${id})">
  <g fill="currentColor">
    <circle cx="${J.head.x}" cy="${J.head.y}" r="${J.head.r}"/>
    <g fill="none" stroke="currentColor" stroke-width="${LIMB}" stroke-linecap="round" stroke-linejoin="round">
      ${Object.values(limbs).map((d) => `<path d="${d}"/>`).join('\n      ')}
    </g>
    ${drill}${brush}
  </g>
  ${cap}
</g>
<g fill="currentColor">${drillDot}</g>
${capSeams}`;
}
