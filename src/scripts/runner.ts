/**
 * Scroll-driven run cycle for the header logo (RunnerAnimated.astro).
 *
 * The cycle swings every limb between the drawn pose (A) and its mirror (B: legs and arms swap);
 * see pose() for the knee asymmetry that makes forward and backward playback look different. Phase p advances with scroll velocity:
 * scrolling down plays it forward, up plays it backwards, faster scrolling runs faster.
 * When scrolling stops, p eases to the nearest whole cycle, i.e. back to the logo's own pose.
 */
import { JOINTS } from '../assets/brand/runner-parts.mjs';

type Pt = { x: number; y: number };
type LimbName = 'frontArm' | 'backArm' | 'frontLeg' | 'rearLeg';

const J = JOINTS;
const TAU = Math.PI * 2;

const angle = (a: Pt, b: Pt) => Math.atan2(b.y - a.y, b.x - a.x);
const dist = (a: Pt, b: Pt) => Math.hypot(b.x - a.x, b.y - a.y);
/** Shortest signed angular difference b - a. */
const angleDiff = (a: number, b: number) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

interface Limb {
  root: 'shoulder' | 'hip';
  len1: number;
  len2: number;
  /** [upper, lower] angles in the drawn pose */
  a: [number, number];
  /** [upper, lower] angles in the mirrored pose */
  b: [number, number];
  /** drawn-pose end point (the hand) and lower-segment angle, for attaching a tool */
  restEnd: Pt;
}

function chain(root: Pt, mid: Pt, end: Pt): Pick<Limb, 'len1' | 'len2' | 'restEnd'> & { angles: [number, number] } {
  return {
    len1: dist(root, mid),
    len2: dist(mid, end),
    restEnd: end,
    angles: [angle(root, mid), angle(mid, end)],
  };
}

const frontArm = chain(J.shoulder, J.frontElbow, J.frontHand);
const backArm = chain(J.shoulder, J.backElbow, J.backHand);
const frontLeg = chain(J.hip, J.frontKnee, J.frontFoot);
const rearLeg = chain(J.hip, J.rearKnee, J.rearFoot);

const LIMBS: Record<LimbName, Limb> = {
  frontArm: { root: 'shoulder', ...frontArm, a: frontArm.angles, b: backArm.angles },
  backArm: { root: 'shoulder', ...backArm, a: backArm.angles, b: frontArm.angles },
  frontLeg: { root: 'hip', ...frontLeg, a: frontLeg.angles, b: rearLeg.angles },
  rearLeg: { root: 'hip', ...rearLeg, a: rearLeg.angles, b: frontLeg.angles },
};

/**
 * Limb angles at phase p. Between the drawn pose (A) and its mirror (B) each leg either swings
 * forward or pushes back. The swinging leg bends at the knee (heel up) and the planted leg
 * flexes a little to cushion the landing, so the cycle is asymmetric in time: played backwards it
 * reads as running backwards. Both bends also keep the body bob small (about 2% of the figure).
 */
const SWING_BEND = 0.7; // rad of extra knee bend at mid-swing
const STANCE_FLEX = 0.6; // extra knee flex of the planted leg at mid-stance, as a share of its bend
function pose(p: number): Record<LimbName, [number, number]> {
  const s = (1 - Math.cos(TAU * p)) / 2; // 0 at the drawn pose, 1 at the mirrored pose
  const firstHalf = ((p % 1) + 1) % 1 < 0.5; // drawn → mirrored
  const bump = Math.abs(Math.sin(TAU * p)); // 0 at both poses, 1 mid-stride
  const out = {} as Record<LimbName, [number, number]>;
  (Object.keys(LIMBS) as LimbName[]).forEach((n) => {
    const l = LIMBS[n];
    const a1 = l.a[0] + angleDiff(l.a[0], l.b[0]) * s;
    let a2 = l.a[1] + angleDiff(l.a[1], l.b[1]) * s;
    if (n === 'frontLeg' || n === 'rearLeg') {
      // first half: the rear leg swings forward, the front leg is planted; second half: the opposite
      const swinging = (n === 'rearLeg') === firstHalf;
      a2 += swinging ? SWING_BEND * bump : -angleDiff(a2, a1) * STANCE_FLEX * bump;
    }
    out[n] = [a1, a2];
  });
  return out;
}

const footY = (n: 'frontLeg' | 'rearLeg', [a1, a2]: [number, number]) =>
  J.hip.y + LIMBS[n].len1 * Math.sin(a1) + LIMBS[n].len2 * Math.sin(a2);
const restPose = pose(0);
// Ground line = the lower foot in the drawn pose; the body rises so no foot ever sinks below it.
const GROUND = Math.max(footY('frontLeg', restPose.frontLeg), footY('rearLeg', restPose.rearLeg));

const f = (n: number) => Math.round(n * 10) / 10;

export interface Runner {
  /** Advance the animation. `velocity` is scroll speed in px/s (positive = down), `dt` in ms. */
  update(velocity: number, dt: number): void;
}

export function createRunner(svg: SVGSVGElement): Runner {
  const body = svg.querySelector<SVGGElement>('[data-runner-body]')!;
  const paths = {} as Record<LimbName, SVGPathElement>;
  const tools = {} as Partial<Record<LimbName, SVGGElement>>;
  (Object.keys(LIMBS) as LimbName[]).forEach((n) => {
    paths[n] = svg.querySelector<SVGPathElement>(`[data-limb="${n}"]`)!;
    const t = svg.querySelector<SVGGElement>(`[data-tool="${n}"]`);
    if (t) tools[n] = t;
  });

  let phase = 0; // cycles; whole numbers = drawn pose
  let speed = 0; // cycles per second, smoothed
  let drawn = 0; // last phase written to the DOM

  function render(p: number) {
    const angles = pose(p);
    const lowest = Math.max(footY('frontLeg', angles.frontLeg), footY('rearLeg', angles.rearLeg));
    const lift = -Math.max(0, lowest - GROUND);
    body.setAttribute('transform', `translate(0 ${f(lift)})`);

    (Object.keys(LIMBS) as LimbName[]).forEach((n) => {
      const l = LIMBS[n];
      const root = J[l.root];
      const [a1, a2] = angles[n];
      const mid = { x: root.x + l.len1 * Math.cos(a1), y: root.y + l.len1 * Math.sin(a1) };
      const end = { x: mid.x + l.len2 * Math.cos(a2), y: mid.y + l.len2 * Math.sin(a2) };
      paths[n].setAttribute('d', `M${root.x} ${root.y} L${f(mid.x)} ${f(mid.y)} L${f(end.x)} ${f(end.y)}`);

      const tool = tools[n];
      if (tool) {
        const turn = ((a2 - l.a[1]) * 180) / Math.PI;
        tool.setAttribute(
          'transform',
          `translate(${f(end.x)} ${f(end.y)}) rotate(${f(turn)}) translate(${-l.restEnd.x} ${-l.restEnd.y})`,
        );
      }
    });
    drawn = p;
  }

  return {
    update(velocity, dt) {
      const step = Math.min(dt, 64) / 1000;
      // ~1 stride per 400 px scrolled, capped so a fling doesn't turn into a blur
      const target = Math.max(-4, Math.min(4, velocity / 400));
      speed += (target - speed) * (1 - Math.exp(-step / 0.08));

      if (Math.abs(velocity) > 20 || Math.abs(speed) > 0.15) {
        phase += speed * step;
      } else {
        // Ease into the resting (drawn) pose at the nearest whole cycle
        speed = 0;
        const rest = Math.round(phase);
        phase += (rest - phase) * (1 - Math.exp(-step / 0.12));
        if (Math.abs(rest - phase) < 0.002) phase = rest;
      }

      if (Math.abs(phase - drawn) > 0.0005) render(phase);
      if (Number.isInteger(phase) && Math.abs(phase) > 1000) phase = 0; // keep numbers small
    },
  };
}
