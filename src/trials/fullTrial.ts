// fullTrial.ts — build a whole block’s timeline using TrialSpec
import psychophysics from "@kurokida/jspsych-psychophysics";
import { createITI } from "../task-fun/stimuli";

import { displayStimuli } from "./displayStimuli";
import { featureRecall }  from "./reproductionTrial";

import type { BlockConfig } from "../task-fun/configurations";
import { makeTrialSpec }   from "../task-fun/configurations"; // ensure this is exported there

export function buildBlockTimeline(cfg: BlockConfig): any[] {
  const out: any[] = [];

  for (let t = 1; t <= cfg.trialsPerBlock; t++) {
    const spec = makeTrialSpec(cfg);                // one source of per-trial randomness
    const frames = cfg.stimuliFrameCount;           // fixed (or set from calibration)

    out.push(
      ...displayStimuli({ trialID: t, cfg, spec, stimuliFrameCount: frames }),
      ...featureRecall ({ trialID: t, cfg, spec, stimuliFrameCount: frames }),
      {
        type: psychophysics,
        stimuli: [createITI(cfg.startX, cfg.startY)],
        response_ends_trial: false,
        trial_duration: cfg.ITIduration,
        data: {
          trialSegment: "ITI",
          blockID: cfg.blockID,
          trialID: t,
          practice: cfg.practice
        }
      }
    );
  }

  return out;
}
