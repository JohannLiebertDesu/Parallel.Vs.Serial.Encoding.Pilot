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

/** Interleaving permutation: [0,1,n-1,2,n-2,3,n-3,...] */
function interleavingPermutation(n: number): number[] {
  const out: number[] = [];
  let left = 0, right = n - 1;

  // first two are 0,1 to match the Williams recipe
  out.push(left++); 
  if (n > 1) out.push(left++);

  while (out.length < n) {
    out.push(right--);
    if (out.length < n) out.push(left++);
    if (out.length < n) out.push(right--);
    if (out.length < n) out.push(left++);
  }
  return out;
}

/** Build Williams sequences for labels 0..n-1.
 *  Even n  -> n sequences; Odd n -> 2n sequences (includes reversals).
 */
function williamsSequences(n: number): number[][] {
  const base = Array.from({ length: n }, (_, i) => i);
  const perm = interleavingPermutation(n);

  const rotate = (seq: number[], k: number) => seq.slice(k).concat(seq.slice(0, k));
  const rotations = Array.from({ length: n }, (_, k) => rotate(base, k));
  let seqs = rotations.map(rot => perm.map(p => rot[p]));

  if (n % 2 === 1) {
    // For odd n, append the complete set of reversed sequences
    seqs = seqs.concat(seqs.map(s => [...s].reverse()));
  }
  return seqs;
}

/** Pick the Williams order (as indices) for a given participant ID (1-based). */
export function williamsOrderForParticipant(n: number, participantID: number): number[] {
  const seqs = williamsSequences(n);
  return seqs[(participantID - 1) % seqs.length];
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
