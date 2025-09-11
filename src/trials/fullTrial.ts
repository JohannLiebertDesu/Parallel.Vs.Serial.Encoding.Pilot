import { displayStimuli } from "./displayStimuli";
import { featureRecall } from "./reproductionTrial";
import { createITI } from "../task-fun/stimuli"
import psychophysics from "@kurokida/jspsych-psychophysics";
import { equilateralVertices, pickK } from "../task-fun/triangleHelpers";


export interface BlockConfig {
  /* design factors */
  startX: number;
  startY: number;
  width: number;
  height: number;
  deg_per_frame: number;
  tile: number;
  stimuliFrameCount: number;
  maskFrameCount: number;
  fixationFrameCount: number;
  assumedHz: number;

  wheelOuterRadius: number;
  wheelInnerRadius: number;

  ITIduration: number;
  /* meta */
  blockID: number;          // 1-based
  practice: boolean;
  trialsPerBlock: number;   // e.g., 20

  triangleRadius,       // NEW
  nColoredSquares       // NEW

  chroma: number,
  lightness: number,

  calibrationTrial: boolean,
}

/** Pushes one logical trial (= sample then mask; recall later) to `timeline`. */
export function pushTrial(
  timeline: any[],
  cfg: BlockConfig,
  trialID: number
): void {
  const initHue = Math.random() * 360;
  const rotation: "cw" | "ccw" = Math.random() < 0.5 ? "cw" : "ccw";
  const totalFrameCount = cfg.stimuliFrameCount + cfg.maskFrameCount + cfg.fixationFrameCount;
  const trialDuration = Math.ceil((totalFrameCount / cfg.assumedHz) * 1000)

  // random global rotation of the (hidden) triangle each trial
  const angleDeg = Math.random() * 360;
  // 3 vertex centers
  const verts = equilateralVertices(cfg.startX, cfg.startY, cfg.triangleRadius, angleDeg);
  // Which indices are colored this trial?
  const coloredIdx = new Set(pickK(3, cfg.nColoredSquares));

  timeline.push(
    ...displayStimuli(
      trialID,
      cfg.blockID,
      cfg.practice,
      cfg.calibrationTrial,
      cfg.startX,
      cfg.startY,
      cfg.width,
      cfg.height,
      initHue,
      rotation,
      cfg.deg_per_frame,
      cfg.stimuliFrameCount,
      cfg.maskFrameCount,
      totalFrameCount,
      trialDuration,
      cfg.tile,
      cfg.nColoredSquares,       
      cfg.chroma,
      cfg.lightness,
      verts,
      coloredIdx,
    )
  );

  // recall trial (separate psychophysics trial)
  timeline.push(
    ...featureRecall(
      trialID,
      cfg.blockID,
      cfg.practice,
      cfg.calibrationTrial,
      cfg.startX,
      cfg.startY,
      cfg.width,
      cfg.height,
      cfg.wheelOuterRadius,
      cfg.wheelInnerRadius,
      initHue,
      rotation,
      cfg.deg_per_frame,
      cfg.stimuliFrameCount,
      trialDuration,
      cfg.assumedHz,
      cfg.chroma,
      cfg.lightness,
      verts, 
      coloredIdx,
      cfg.nColoredSquares
    )
  );
  timeline.push({
    type: psychophysics,
    stimuli: [createITI(cfg.startX, cfg.startY)],
    response_ends_trial: false,        
    trial_duration: cfg.ITIduration,
    data: {
    trialSegment: "ITI",
    blockID: cfg.blockID,
    trialID: trialID, practice: cfg.practice
    }
  }
);
}

export function buildBlock(timeline: any[], cfg: BlockConfig): void {
  for (let t = 1; t <= cfg.trialsPerBlock; t++) {
    pushTrial(timeline, cfg, t);
  }
}