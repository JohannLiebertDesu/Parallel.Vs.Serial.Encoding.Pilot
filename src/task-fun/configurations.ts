// task-fun/configurations.ts
import type { Vertex } from "./triangleHelpers";
import { equilateralVertices, pickK } from "./triangleHelpers";

export interface BlockConfig {
  startX: number; startY: number;
  width: number;  height: number;
  deg_per_frame: number;
  tile: number;
  stimuliFrameCount: number;
  maskFrameCount: number;
  fixationFrameCount: number;
  assumedHz: number;
  wheelOuterRadius: number;
  wheelInnerRadius: number;
  ITIduration: number;

  blockID: number;
  practice: boolean;
  trialsPerBlock: number;

  triangleRadius: number;
  nColoredSquares: number;

  chroma: number;
  lightness: number;

  calibrationTrial: boolean;
}

export type TrialSpec = {
  rotation: "cw" | "ccw";
  verts: ReadonlyArray<Vertex>;
  coloredIdx: ReadonlySet<number>;
  hueStarts: ReadonlyArray<number>;
  targetIdx: number;
};

export function makeTrialSpec(cfg: BlockConfig): TrialSpec {
  const rotation: "cw" | "ccw" = Math.random() < 0.5 ? "cw" : "ccw";
  const angleDeg = Math.random() * 360;
  const verts = equilateralVertices(cfg.startX, cfg.startY, cfg.triangleRadius, angleDeg);

  const coloredIdx = new Set(pickK(3, cfg.nColoredSquares));
  const hueStarts = verts.map(() => Math.random() * 360);
  const choices = coloredIdx.size ? Array.from(coloredIdx) : [0, 1, 2];
  const targetIdx = choices[Math.floor(Math.random() * choices.length)];
  return { rotation, verts, coloredIdx, hueStarts, targetIdx };
}


