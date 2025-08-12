/**********************************************************************
 *  experiment.ts                                                     *
 *  Block-wise control code for the new color–orientation VWM task.  *
 *                                                                    *
 *  ─ Each block = 20 logical trials.                                 *
 *  ─ Each trial = displayStimuli  ➜  featureRecall.                  *
 *  ─ Blocks are generated from the design matrix at the bottom.      *
 *********************************************************************/

import { StimulusKind }    from "../task-fun/placeStimuli";
import { displayStimuli }  from "./displayStimuli";
import { featureRecall }   from "./reproductionTrial";
import { makeBalancedFirstKinds } from "../task-fun/assignTestStatus";

/* ------------------------------------------------------------------ */
/*  TYPES                                                             */
/* ------------------------------------------------------------------ */

export interface BlockConfig {
  /* design factors (one cell = one block) */
  numCircles:              3 | 6;
  grouping:                "combined" | "split";
  composition:             "homogeneous_color" | "homogeneous_orientation" | "mixed";
  layout:                  "clustered" | "interleaved";
  stimulusTypeShownFirst:  StimulusKind;          // varies between participants

  /* meta info */
  blockID:                 number;                // 1-based
  practice:                boolean;
  trialsPerBlock:          number;                // always 20 here
}

/* ------------------------------------------------------------------ */
/*  BLOCK-LEVEL HELPERS                                               */
/* ------------------------------------------------------------------ */

export function rotateArray<T>(arr: T[], shift: number): T[] {
    const s = ((shift % arr.length) + arr.length) % arr.length;      // handle big / negative
    return [...arr.slice(s), ...arr.slice(0, s)];
  }
  
  export function firstStimulusFor(id: number): StimulusKind {
    // odd → colored first, even → oriented first
    return id % 2 === 1 ? "colored_circle" : "oriented_circle";
  }

/* ------------------------------------------------------------------ */
/*  TRIAL-LEVEL HELPER                                                */
/* ------------------------------------------------------------------ */

/** Pushes one logical trial (= sample + test in your code) to `timeline`. */
function pushTrial(
  timeline: any[],
  cfg: BlockConfig,
  trialID: number,
  forcedFirst?: StimulusKind            // <-- new, optional
) {
  /* 1 ── SAMPLE / MEMORY DISPLAY ───────────────────────────────── */
  timeline.push(
    ...displayStimuli(
      trialID,
      cfg.blockID,
      cfg.practice,
      cfg.numCircles,
      cfg.grouping,
      cfg.composition,
      cfg.layout,
      cfg.stimulusTypeShownFirst,
      forcedFirst                     // pass it on
    )
  );

//   /* 2 ── FEATURE RECALL ─────────────────────────────────────────── */
  timeline.push(
    ...featureRecall(
      trialID,
      cfg.blockID,
      cfg.practice,
      cfg.numCircles,
      cfg.grouping,
      cfg.composition,
      cfg.layout,
      cfg.stimulusTypeShownFirst,
      forcedFirst
    )
  );
}

/* ------------------------------------------------------------------ */
/*  BLOCK-LEVEL HELPER                                                */
/* ------------------------------------------------------------------ */

export function runBlock(timeline: any[], cfg: BlockConfig) {
    // only needed for 6-item mixed blocks
    const firstKindSeq =
      cfg.numCircles === 6 && cfg.composition === "mixed"
        ? makeBalancedFirstKinds(cfg.trialsPerBlock)
        : [];
  
    for (let t = 1; t <= cfg.trialsPerBlock; t++) {
      const forcedFirst = firstKindSeq[t - 1];   // undefined for other blocks
      pushTrial(timeline, cfg, t, forcedFirst);
    }
  }

/* ------------------------------------------------------------------ */
/*  DESIGN  – 7 blocks, one row per Latin-square “cell”               */
/* ------------------------------------------------------------------ */

export const DESIGN: Omit<
BlockConfig,
"blockID" | "stimulusTypeShownFirst" | "practice"
>[] = [
/* ----------------------------- 3 CIRCLES ----------------------------- */
{
  numCircles: 3,
  grouping: "combined",
  composition: "homogeneous_color",
  layout: "clustered",
  trialsPerBlock: 20,
},
{
  numCircles: 3,
  grouping: "combined",
  composition: "homogeneous_orientation",
  layout: "clustered",
  trialsPerBlock: 20,
},

/* ----------------------------- 6 CIRCLES, COMBINED ------------------- */
{
  numCircles: 6,
  grouping: "combined",
  composition: "homogeneous_color",
  layout: "clustered",
  trialsPerBlock: 20,
},
{
  numCircles: 6,
  grouping: "combined",
  composition: "homogeneous_orientation",
  layout: "clustered",
  trialsPerBlock: 20,
},
{
  numCircles: 6,
  grouping: "combined",
  composition: "mixed",
  layout: "clustered",
  trialsPerBlock: 20,
},
{
  numCircles: 6,
  grouping: "combined",
  composition: "mixed",
  layout: "interleaved",
  trialsPerBlock: 20,
},

/* ----------------------------- 6 CIRCLES, SPLIT ---------------------- */
{
  numCircles: 6,
  grouping: "split",
  composition: "mixed",
  layout: "clustered",
  trialsPerBlock: 20,
},
];
