/* displayStimuli.ts  – run-time stimulus generation (option B) */
import psychophysics from "@kurokida/jspsych-psychophysics";
import { generateStimuli, StimulusSpec, StimulusKind } from "../task-fun/placeStimuli";
import {
  createGrid,
  numColumns,
  numRows,
  cellSize
} from "../task-fun/createGrid";
import { filterAndMapStimuli } from "../task-fun/filterStimuli";
import { Stimulus } from "../task-fun/createStimuli";
import { assignTestStatus } from "../task-fun/assignTestStatus";

/* ─────────────────────────── helpers ──────────────────────────── */

function randomStimulusPair(): [StimulusKind, StimulusKind] {
  return Math.random() < 0.5
    ? ["colored_circle", "oriented_circle"]
    : ["oriented_circle", "colored_circle"];
}

function stimulusKind(stim: Stimulus): StimulusKind {
  if (stim.obj_type === "line") return "oriented_circle";
  const circle = stim as any;
  return circle.fill_color === "transparent"
    ? "oriented_circle"
    : "colored_circle";
}

/* ─────────────────────────── factory ──────────────────────────── */

/** Builds one *or two* psychophysics trials (sample displays) and lets
 *  the low-level objects be instantiated in `on_start`, i.e. after the
 *  preceding trial has finished and the grid is pristine again.        */
export function displayStimuli(
  trialID: number,
  blockID: number,
  practice: boolean,
  numCircles: 3 | 6,
  grouping: "combined" | "split",
  composition: "homogeneous_color" | "homogeneous_orientation" | "mixed",
  layout: "clustered" | "interleaved",
  stimulusTypeShownFirst: StimulusKind,
  forcedFirstKind?: StimulusKind
): any[] {
  /* 1 ─ build *specs* only (nothing stateful) ---------------------- */
  let specsBlock1: StimulusSpec[] = [];
  let specsBlock2: StimulusSpec[] = [];

  if (numCircles === 3) {
    specsBlock1 = [
      {
        count: 3,
        side: "left",
        stimulusType:
          composition === "homogeneous_orientation"
            ? "oriented_circle"
            : "colored_circle",
      },
    ];
  } else if (grouping === "combined") {
    if (composition !== "mixed") {
      const stim =
        composition === "homogeneous_orientation"
          ? "oriented_circle"
          : "colored_circle";
      specsBlock1 = [
        { count: 3, side: "left", stimulusType: stim },
        { count: 3, side: "right", stimulusType: stim },
      ];
    } else if (layout === "clustered") {
      specsBlock1 = [
        { count: 3, side: "left", stimulusType: stimulusTypeShownFirst },
        {
          count: 3,
          side: "right",
          stimulusType:
            stimulusTypeShownFirst === "colored_circle"
              ? "oriented_circle"
              : "colored_circle",
        },
      ];
    } else {
      // mixed + interleaved
      const [typeA, typeB] = randomStimulusPair();
      specsBlock1 = [
        { count: 2, side: "left", stimulusType: typeA },
        { count: 1, side: "left", stimulusType: typeB },
        { count: 1, side: "right", stimulusType: typeA },
        { count: 2, side: "right", stimulusType: typeB },
      ];
    }
  } else {
    // 6 items, grouping === "split"
    specsBlock1 = [
      { count: 3, side: "left", stimulusType: stimulusTypeShownFirst },
    ];
    specsBlock2 = [
      {
        count: 3,
        side: "right",
        stimulusType:
          stimulusTypeShownFirst === "colored_circle"
            ? "oriented_circle"
            : "colored_circle",
      },
    ];
  }

  const blocksSpecs: StimulusSpec[][] = [];
  if (specsBlock1.length) blocksSpecs.push(specsBlock1);
  if (specsBlock2.length) blocksSpecs.push(specsBlock2);

  /* 2 ─ closure variables shared by the two displays --------------- */
  let placedBlocks: Stimulus[][] = []; // filled once, inside first on_start

  /* 3 ─ build the real jsPsych trials ------------------------------ */
  return blocksSpecs.map((specsThisScreen, screenIdx) => ({
    type: psychophysics,
    stimuli: [],                   // will be filled in on_start
    choices: "NO_KEYS",
    background_color: "#FFFFFF",

    /* -------- run-time generation (fires just before display) ---- */
    on_start(trial: any) {
      /* first screen of the logical trial → build full stimulus set */
      if (placedBlocks.length === 0) {
        const grid = createGrid(numColumns, numRows);     // fresh grid
        placedBlocks = blocksSpecs.map(specs =>
          generateStimuli(grid, specs, cellSize.cellWidth, cellSize.cellHeight)
        );

        assignTestStatus(
          placedBlocks.flat(),
          numCircles,
          composition,
          forcedFirstKind
        );
      }

      const placed = placedBlocks[screenIdx];
      trial.stimuli        = filterAndMapStimuli(placed);
      trial.trial_duration = numCircles * 100;            // 100 ms/item

      console.log("placed stimuli", placed);
      /* -------- ISI (post-stimulus blank) ------------------------ */
      const currentType = specsThisScreen[0].stimulusType;
      let isi = 0;
      if (numCircles === 3 && currentType === stimulusTypeShownFirst) {
        isi = 2300;
      } else if (numCircles === 3) {
        isi = 1000;
      } else if (numCircles === 6 && grouping === "split") {
        isi = 1000;
      } else if (
        grouping === "combined" &&
        layout   === "clustered" &&
        currentType === stimulusTypeShownFirst
      ) {
        isi = 2000;
      } else if (grouping === "combined" && layout === "clustered") {
        isi = 1000;
      } else if (grouping === "combined" && layout === "interleaved") {
        const firstTestStim = placed.find(s => s.test_status === "tested_first");
        const firstTestKind = firstTestStim ? stimulusKind(firstTestStim) : null;
        isi = firstTestKind === stimulusTypeShownFirst ? 2000 : 1000;
      }
      trial.post_trial_gap = isi;
    },

    /* ---------------------- bookkeeping -------------------------- */
    on_finish(data: any) {
      data.stimuliData = placedBlocks[screenIdx];
    },

    data: {
      trialID,
      blockID,
      practice,
      part: screenIdx + 1,          // 1 or 2
      numCircles,
      grouping,
      composition,
      layout,
      trialSegment: "displayStimuli",
      stimulusTypeShownFirst,
      forcedFirstKind,
    },
  }));
}
