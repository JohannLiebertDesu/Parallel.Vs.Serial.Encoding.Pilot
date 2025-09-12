// fullCalibrationTrial.ts (spec-based, lean)
import { jsPsych } from "../jsp";
import psychophysics from "@kurokida/jspsych-psychophysics";

import { Staircase } from "../task-fun/staircase";
import { createITI } from "../task-fun/stimuli";

import { displayStimuli } from "./displayStimuli";
import { featureRecall }  from "./reproductionTrial";

import type { BlockConfig } from "../task-fun/configurations";
import { makeTrialSpec }   from "../task-fun/configurations";

type CalibOpts = {
  maxTrials?: number;       // default 50
  startMs?: number;         // default 80 ms
  errTolDeg?: number;       // default ±30°
  upStep?: number;          // default 4 frames up on error
  downStep?: number;        // default 1 frame down on correct
  minMs?: number;           // clamp lower bound
  maxMs?: number;           // clamp upper bound
  stabilityWindow?: number; // for monitoring / UI only
  stabilityTol?: number;    // for monitoring / UI only
};

// optional completion callback so you can append test blocks afterwards
type OnCalibDone = (thrFrames: number, thrMs: number) => void;

// One logical triplet (sample → recall → ITI) at a given frames level
function makeCalibrationTriplet(
  trialID: number,
  cfg: BlockConfig,
  frames: number,
  opts: Required<CalibOpts>,
  stair: Staircase,
  onDone?: OnCalibDone
): any[] {
  // Per-trial spec (rotation, verts, coloredIdx, hueStarts, targetIdx)
  const spec = makeTrialSpec(cfg);

  // 1) sample/mask/fixation with THIS frames level
  const sample = displayStimuli({
    trialID,
    cfg,
    spec,
    stimuliFrameCount: frames,
  })[0];

  // 2) recall
  const recall = featureRecall({
    trialID,
    cfg,
    spec,
    stimuliFrameCount: frames,
  })[0];

  // Wrap recall.on_finish to evaluate correctness + update staircase
  const prevFinish = recall.on_finish;
  recall.on_finish = (data: any) => {
    if (prevFinish) prevFinish(data);

    const correct = (data.abs_error_deg as number) <= opts.errTolDeg;

    // annotate trial
    data.isCorrect = correct;
    data.targetAcc = opts.upStep / (opts.upStep + opts.downStep);

    // update staircase now
    stair.update(correct);

    // monitoring
    const stable = stair.isStable();
    data.rollingAcc60 = stair.accLast(60);
    data.reversals    = stair.reversals;
    data.stableFlag   = stable;

    // stop when stable OR when maxTrials reached
    const shouldStop = stable || (trialID >= opts.maxTrials);

    if (!shouldStop) {
      const nextTriplet = makeCalibrationTriplet(
        trialID + 1,
        cfg,
        stair.current(), // next frames level
        opts,
        stair,
        onDone
      );
      jsPsych.addNodeToEndOfTimeline({ timeline: nextTriplet });
    } else {
      // Freeze a robust threshold (uses staircase internals)
      const thrFrames = stair.finalizeThreshold(6, 20);
      const thrMs     = Math.round(1000 * thrFrames / cfg.assumedHz);

      jsPsych.data.addProperties({
        calib_threshold_frames: thrFrames,
        calib_threshold_ms:     thrMs,
      });

      // tell caller we’re done (so they can append block2+ with fixed frames)
      onDone?.(thrFrames, thrMs);
    }
  };

  // 3) ITI
  const iti = {
    type: psychophysics,
    stimuli: [createITI(cfg.startX, cfg.startY)],
    response_ends_trial: false,
    trial_duration: cfg.ITIduration,
    data: {
      trialSegment: "ITI",
      blockID: cfg.blockID,
      trialID,
      practice: cfg.practice,
      calibrationTrial: cfg.calibrationTrial,
    },
  };

  return [sample, recall, iti];
}

// Public entry: seed the first calibration triplet; the rest chain themselves
export function seedCalibrationBlock(
  timeline: any[],
  cfg: BlockConfig,
  _opts?: CalibOpts,
  onDone?: OnCalibDone
) {
  const opts: Required<CalibOpts> = {
    maxTrials:        _opts?.maxTrials ?? 50,
    startMs:          _opts?.startMs   ?? 80,
    errTolDeg:        _opts?.errTolDeg ?? 30,
    upStep:           _opts?.upStep    ?? 4,
    downStep:         _opts?.downStep  ?? 1,
    minMs:            _opts?.minMs     ?? 5,
    maxMs:            _opts?.maxMs     ?? 500,
    stabilityWindow:  _opts?.stabilityWindow ?? 20,
    stabilityTol:     _opts?.stabilityTol    ?? 0.05,
  };

  const startFrames = Math.max(1, Math.round(cfg.assumedHz * (opts.startMs / 1000)));
  const minFrames   = Math.max(1, Math.round(cfg.assumedHz * (opts.minMs   / 1000)));
  const maxFrames   = Math.max(minFrames, Math.round(cfg.assumedHz * (opts.maxMs / 1000)));

  const stair = new Staircase({
    startFrames,
    up: opts.upStep,
    down: opts.downStep,
    minFrames,
    maxFrames,
    pTarget: opts.upStep / (opts.upStep + opts.downStep),
  });

  const firstTriplet = makeCalibrationTriplet(1, cfg, stair.current(), opts, stair, onDone);
  timeline.push(...firstTriplet);
}
