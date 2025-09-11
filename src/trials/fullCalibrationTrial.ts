// fullCalibrationTrial.ts (additions)
import { jsPsych } from "../jsp";
import { Staircase } from "../task-fun/staircase";
import { displayStimuli } from "./displayStimuli";
import { featureRecall } from "./reproductionTrial";
import { createITI } from "../task-fun/stimuli";
import { BlockConfig } from "./fullTrial";
import { equilateralVertices, pickK } from "../task-fun/triangleHelpers";
import psychophysics from "@kurokida/jspsych-psychophysics";

type CalibOpts = {
  maxTrials?: number;            // default 50
  startMs?: number;              // default 80 ms
  errTolDeg?: number;            // default ±30°
  upStep?: number;               // default 4 frame up on error
  downStep?: number;             // default 1 frames down on correct
  minMs?: number;                // clamp lower bound
  maxMs?: number;                // clamp upper bound
  stabilityWindow?: number;      // for monitoring
  stabilityTol?: number;         // for monitoring
};

// Make one logical (sample→recall→ITI) "triplet" for a given frames level
function makeCalibrationTriplet(
  trialID: number,
  cfg: BlockConfig,
  frames: number,
  opts: Required<CalibOpts>,
  stair: Staircase
): any[] {
  const totalFrameCount = frames + cfg.maskFrameCount + cfg.fixationFrameCount;
  const trialDurationMs = Math.ceil((totalFrameCount / cfg.assumedHz) * 1000);

  const initHue = Math.random() * 360;
  const rotation: "cw" | "ccw" = Math.random() < 0.5 ? "cw" : "ccw";

  // random global rotation of the (hidden) triangle each trial
  const angleDeg = Math.random() * 360;
  // 3 vertex centers
  const verts = equilateralVertices(cfg.startX, cfg.startY, cfg.triangleRadius, angleDeg);
  // Which indices are colored this trial?
  const coloredIdx = new Set(pickK(3, cfg.nColoredSquares));
  
  // (1) one starting hue per square, shared by display & recall
  const hueStarts = verts.map(() => Math.random() * 360);

  // (2) choose target among colored squares; fallback to any if none colored
  const choices = coloredIdx.size ? Array.from(coloredIdx) : [0, 1, 2];
  const targetIdx = choices[Math.floor(Math.random() * choices.length)];

  // 1) Sample/mask/fixation with THIS frames level
  const sample = displayStimuli(
    trialID, cfg.blockID, cfg.practice, cfg.calibrationTrial,
    cfg.startX, cfg.startY, cfg.width, cfg.height,
    rotation, cfg.deg_per_frame, // (0 for calibration)
    frames, cfg.maskFrameCount, totalFrameCount, trialDurationMs, 
    cfg.tile, cfg.nColoredSquares, cfg.chroma, cfg.lightness, verts, 
    coloredIdx, hueStarts, targetIdx)[0];

  // 2) Recall
  const recall = featureRecall(
    trialID, cfg.blockID, cfg.practice, cfg.calibrationTrial,
    cfg.width, cfg.height,
    cfg.wheelOuterRadius, cfg.wheelInnerRadius,
    rotation, cfg.deg_per_frame, frames, trialDurationMs, 
    cfg.assumedHz, cfg.lightness, cfg.chroma, verts, coloredIdx, 
    cfg.nColoredSquares, hueStarts, targetIdx)[0];

  // Wrap recall.on_finish to evaluate correctness + update staircase
  const prevFinish = recall.on_finish;
  recall.on_finish = (data: any) => {
    if (prevFinish) prevFinish(data);

    const errAbs = data.abs_error_deg
    const correct = errAbs <= opts.errTolDeg

    // Annotate
    data.isCorrect   = correct;
    data.targetAcc   = opts.upStep / (opts.upStep + opts.downStep);

    // Update staircase *now* and append next triplet if we still have trials left
    stair.update(correct);

  // use your staircase defaults: n=60, tol=0.07, reversals>=8
    const stable = stair.isStable();                    // <-- no args
    data.rollingAcc60 = stair.accLast(60);
    data.reversals    = stair.reversals;
    data.stableFlag   = stable;

  // stop when stable OR when maxTrials reached
  const shouldStop = stable || (trialID >= opts.maxTrials);

  if (!shouldStop) {
    const nextTriplet = makeCalibrationTriplet(
      trialID + 1,
      cfg,
      stair.current(),     // next frames level
      opts,
      stair
    );
    jsPsych.addNodeToEndOfTimeline({ timeline: nextTriplet });
  } else {
    // Freeze a robust threshold (uses estimateThresholdFrames under the hood)
    const thrFrames = stair.finalizeThreshold(6, 20);           // tweak if you like
    const thrMs     = Math.round(1000 * thrFrames / cfg.assumedHz);

    jsPsych.data.addProperties({ calib_threshold_frames: thrFrames, calib_threshold_ms: thrMs });
  };
};

  // 3) ITI (left unchanged)
  const iti = {
    type: psychophysics,
    stimuli: [createITI(cfg.startX, cfg.startY)],
    response_ends_trial: false,
    trial_duration: cfg.ITIduration,
    data: { trialSegment: "ITI", blockID: cfg.blockID, trialID, practice: cfg.practice, calibrationTrial: cfg.calibrationTrial }
  };
  return [sample, recall, iti];
}

// Public entry: seed the first calibration triplet; the rest chain themselves
export function seedCalibrationBlock(
  timeline: any[],
  cfg: BlockConfig,
  _opts?: CalibOpts
) {
  const opts: Required<CalibOpts> = {
    maxTrials: _opts?.maxTrials ?? 50,
    startMs:   _opts?.startMs   ?? 80,
    errTolDeg: _opts?.errTolDeg ?? 30,
    upStep:    _opts?.upStep    ?? 4,
    downStep:  _opts?.downStep  ?? 1,
    minMs:     _opts?.minMs     ?? 5,
    maxMs:     _opts?.maxMs     ?? 500,
    stabilityWindow: _opts?.stabilityWindow ?? 20,
    stabilityTol:    _opts?.stabilityTol    ?? 0.05,
  };

  const startFrames = Math.max(1, Math.round(cfg.assumedHz * (opts.startMs / 1000)));
  const minFrames   = Math.max(1, Math.round(cfg.assumedHz * (opts.minMs   / 1000)));
  const maxFrames   = Math.max(minFrames, Math.round(cfg.assumedHz * (opts.maxMs   / 1000)));

  const stair = new Staircase({
    startFrames, up: opts.upStep, down: opts.downStep,
    minFrames, maxFrames, pTarget: opts.upStep / (opts.upStep + opts.downStep)
  });

  const firstTriplet = makeCalibrationTriplet(1, cfg, stair.current(), opts, stair);
  timeline.push(...firstTriplet);
}
