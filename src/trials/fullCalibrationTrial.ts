// fullTrial.ts (additions)
import { jsPsych } from "../jsp";
import { Staircase } from "../task-fun/staircase";
import { displayStimuli } from "./displayStimuli";
import { featureRecall } from "./reproductionTrial";
import { createITI } from "../task-fun/stimuli";
import { BlockConfig } from "./fullTrial";
import psychophysics from "@kurokida/jspsych-psychophysics";

type CalibOpts = {
  maxTrials?: number;            // default 50
  startMs?: number;              // default 80 ms
  errTolDeg?: number;            // default ±30°
  upStep?: number;               // default 1 frame up on error
  downStep?: number;             // default 3 frames down on correct
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

  // 1) Sample/mask/fixation with THIS frames level
  const sample = displayStimuli(
    trialID, cfg.blockID, cfg.practice,
    cfg.startX, cfg.startY, cfg.width, cfg.height,
    initHue, rotation, cfg.deg_per_frame, // (0 for calibration)
    frames, cfg.maskFrameCount, totalFrameCount, trialDurationMs, cfg.tile
  )[0];

  // 2) Recall
  const recall = featureRecall(
    trialID, cfg.blockID, cfg.practice,
    cfg.startX, cfg.startY, cfg.width, cfg.height,
    cfg.wheelOuterRadius, cfg.wheelInnerRadius,
    initHue, rotation, cfg.deg_per_frame,
    frames, trialDurationMs
  )[0];

  // Wrap recall.on_finish to evaluate correctness + update staircase
  const prevFinish = recall.on_finish;
  recall.on_finish = (data: any) => {
    if (prevFinish) prevFinish(data);

    const errAbs = Math.abs(data.signed_error_deg);
    const correct = errAbs <= opts.errTolDeg;

    // Annotate
    data.calibration = true;
    data.isCorrect   = correct;
    data.stimFrames  = frames;
    data.stimMs      = Math.round((frames / cfg.assumedHz) * 1000);
    data.targetAcc   = 0.75;

    // Update staircase *now* and append next triplet if we still have trials left
    stair.update(correct);

    if (trialID < opts.maxTrials) {
      const nextFrames = stair.current();
      const nextTriplet = makeCalibrationTriplet(trialID + 1, cfg, nextFrames, opts, stair);
      jsPsych.addNodeToEndOfTimeline({ timeline: nextTriplet });
    }
  };

  // 3) ITI (left unchanged)
  const iti = {
    type: psychophysics,
    stimuli: [createITI(cfg.startX, cfg.startY)],
    response_ends_trial: false,
    trial_duration: cfg.ITIduration,
    data: { trialSegment: "ITI", blockID: cfg.blockID, trialID, practice: cfg.practice }
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
    upStep:    _opts?.upStep    ?? 1,
    downStep:  _opts?.downStep  ?? 3,
    minMs:     _opts?.minMs     ?? 10,
    maxMs:     _opts?.maxMs     ?? 500,
    stabilityWindow: _opts?.stabilityWindow ?? 20,
    stabilityTol:    _opts?.stabilityTol    ?? 0.05,
  };

  const startFrames = Math.max(1, Math.round(cfg.assumedHz * (opts.startMs / 1000)));
  const minFrames   = Math.max(1, Math.round(cfg.assumedHz * (opts.minMs   / 1000)));
  const maxFrames   = Math.max(minFrames, Math.round(cfg.assumedHz * (opts.maxMs   / 1000)));

  const stair = new Staircase({
    startFrames, up: opts.upStep, down: opts.downStep,
    minFrames, maxFrames, pTarget: 0.75
  });

  const firstTriplet = makeCalibrationTriplet(1, cfg, stair.current(), opts, stair);
  timeline.push(...firstTriplet);
}
