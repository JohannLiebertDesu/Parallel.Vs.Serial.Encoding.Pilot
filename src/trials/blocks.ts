// blocks.ts
import type { BlockConfig } from "../task-fun/configurations";
import { SETTINGS, DERIVED } from "../settings";

function baseBlock(): Omit<BlockConfig,
  "blockID" | "trialsPerBlock" | "deg_per_frame" |
  "stimuliFrameCount" | "nColoredSquares" | "calibrationTrial"
> {
  return {
    startX: SETTINGS.startX,
    startY: SETTINGS.startY,
    width:  SETTINGS.width,
    height: SETTINGS.height,
    tile:   SETTINGS.tile,

    assumedHz: SETTINGS.assumedHz,
    maskFrameCount: DERIVED.maskFrames,
    fixationFrameCount: DERIVED.fixationFrames,

    wheelOuterRadius: SETTINGS.wheelOuterRadius,
    wheelInnerRadius: SETTINGS.wheelInnerRadius,

    ITIduration: SETTINGS.ITIdurationMs,

    triangleRadius: SETTINGS.triangleRadius,
    chroma: SETTINGS.chroma,
    lightness: SETTINGS.lightness,

    practice: false,
  };
}

export const block1 = {
  ...baseBlock(),
  blockID: 1,
  trialsPerBlock: 10,
  calibrationTrial: true,
  stimuliFrameCount: 3,                 // starting frames for calibration
  deg_per_frame: SETTINGS.degSteps[0],  // 0°/frame during calibration
  nColoredSquares: 1,
} satisfies BlockConfig;

export const block2 = {
  ...baseBlock(),
  blockID: 2,
  trialsPerBlock: 10,
  calibrationTrial: false,
  stimuliFrameCount: 3,                 // placeholder; overwritten post-calib
  deg_per_frame: 50,                    // your test drift
  nColoredSquares: 1,
} satisfies BlockConfig;
