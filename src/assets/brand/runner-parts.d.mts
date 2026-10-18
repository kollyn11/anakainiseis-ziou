export interface Point {
  x: number;
  y: number;
}

export declare const ACCENT: string;
export declare const LIMB: number;
export declare const RUNNER_BOX: { x: number; y: number; w: number; h: number };
export declare const JOINTS: {
  head: Point & { r: number };
  shoulder: Point;
  hip: Point;
  backElbow: Point;
  backHand: Point;
  frontElbow: Point;
  frontHand: Point;
  frontKnee: Point;
  frontFoot: Point;
  rearKnee: Point;
  rearFoot: Point;
};
export declare const brush: string;
export declare const brushCuts: string;
export declare const drill: string;
export declare const drillCuts: string;
export declare const drillDot: string;
export declare const cap: string;
export declare const capCuts: string;
export declare const capSeams: string;
export declare const limbs: Record<'torso' | 'backArm' | 'frontArm' | 'frontLeg' | 'rearLeg', string>;
export declare function runnerSvg(id: string): string;
