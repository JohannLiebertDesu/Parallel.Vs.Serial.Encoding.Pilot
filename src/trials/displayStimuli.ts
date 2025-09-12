/* displayStimuli.ts – run-time stimulus generation (lean) */
import psychophysics from "@kurokida/jspsych-psychophysics";
import { createRectObject, createCrossDuringSample, createStaticTileMaskManual, createFixationWindow } from "../task-fun/stimuli";
import type { BlockConfig } from "../task-fun/configurations";
import type { TrialSpec }  from "../task-fun/configurations";

type Args = {
  trialID: number;
  cfg: BlockConfig;
  spec: TrialSpec;
  stimuliFrameCount: number;   // per-trial exposure (calib or fixed)
};

/** Single, lean entry: build sample trial from cfg + spec + frames */
export function displayStimuli({ trialID, cfg, spec, stimuliFrameCount }: Args): any[] {
  const totalFrameCount = stimuliFrameCount + cfg.maskFrameCount + cfg.fixationFrameCount;
  const trialDuration   = Math.ceil((totalFrameCount / cfg.assumedHz) * 1000);

  // build 3 squares (colored or outline), each with its own starting hue
  const squares = spec.verts.map((p, i) => {
    const colored = spec.coloredIdx.has(i);
    const initHue = spec.hueStarts[i];
    return createRectObject(
      p.x, p.y, initHue, cfg.width, cfg.height,
      spec.rotation, cfg.deg_per_frame, cfg.lightness, cfg.chroma, stimuliFrameCount,
      colored ? "colored" : "outline"
    );
  });

  // localized masks for each square
  const masks = spec.verts.map(p =>
    createStaticTileMaskManual(
      p.x, p.y, cfg.width, cfg.height, cfg.tile, cfg.lightness, cfg.chroma,
      stimuliFrameCount, cfg.maskFrameCount
    )
  );

  const sampleTrial = {
    type: psychophysics,
    stimuli: [
      ...squares,
      ...masks,
      createCrossDuringSample(cfg.startX, cfg.startY, stimuliFrameCount, cfg.maskFrameCount),
      createFixationWindow(cfg.startX, cfg.startY, stimuliFrameCount, cfg.maskFrameCount, totalFrameCount),
    ],
    choices: "NO_KEYS",
    trial_duration: trialDuration,
    data: {
      trialSegment: "stimuliPresentation",
      // minimal & useful audit trail; drop heavy arrays like verts/hueStarts to keep data slim
      trialID,
      blockID:          cfg.blockID,
      practice:         cfg.practice,
      calibrationTrial: cfg.calibrationTrial,
      rotation:         spec.rotation,
      deg_per_frame:    cfg.deg_per_frame,
      stimuliFrameCount,
      maskFrameCount:   cfg.maskFrameCount,
      fixationFrameCount: cfg.fixationFrameCount,
      trialDuration,
      nColoredSquares:  spec.coloredIdx.size,
      coloredIdx:       Array.from(spec.coloredIdx),
      targetIdx:        spec.targetIdx,

      verts: spec.verts,
      hueStarts: spec.hueStarts,
    }
  };

  return [sampleTrial];
}
