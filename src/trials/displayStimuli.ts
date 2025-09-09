/* displayStimuli.ts – run-time stimulus generation */
import psychophysics from "@kurokida/jspsych-psychophysics";
import { createRectObject, createStaticTileMaskManual, createFixationWindow } from "../task-fun/stimuli";

export function displayStimuli(
  trialID: number,
  blockID: number,
  practice: boolean,
  startX: number,
  startY: number,
  width: number,
  height: number,
  initHue: number,
  rotation: "cw" | "ccw",
  deg_per_frame: number,
  stimuliFrameCount: number,
  maskFrameCount: number,
  totalFrameCount: number,
  trialDuration: number,
  tile: number
): any[] {
  const sampleTrial = {
    type: psychophysics,
    stimuli: [
      createRectObject(startX, startY, initHue, width, height, rotation, deg_per_frame, 0.6, 0.1, stimuliFrameCount), 
      createStaticTileMaskManual(startX, startY, width, height, tile, 0.6, 0.1, stimuliFrameCount, maskFrameCount), 
      createFixationWindow(startX, startY, stimuliFrameCount, maskFrameCount, totalFrameCount)
    ],
    choices: "NO_KEYS",
    trial_duration: trialDuration,
    data: {
      trialID, blockID, practice,
      trialSegment: "stimuliPresentation",
      deg_per_frame: deg_per_frame,
      rotation: rotation,
      trialDuration: trialDuration
      }
  };

  return [sampleTrial];
}

// /* ───────── helpers ───────── */

// function randomStimulusPair(): [StimulusKind, StimulusKind] {
//   return Math.random() < 0.5
//     ? ["colored_circle", "oriented_circle"]
//     : ["oriented_circle", "colored_circle"];
// }

// function stimulusKind(stim: Stimulus): StimulusKind {
//   if (stim.obj_type === "line") return "oriented_circle";
//   return (stim as any).fill_color === "transparent"
//     ? "oriented_circle"
//     : "colored_circle";
// }

// /* ───────── factory ───────── */

// export function displayStimuli(
//   trialID: number,
//   blockID: number,
//   practice: boolean,
//   numCircles: 3 | 6,
//   grouping: "combined" | "split",
//   composition: "homogeneous_color" | "homogeneous_orientation" | "mixed",
//   layout: "clustered" | "interleaved",
//   stimulusTypeShownFirst: StimulusKind,
//   forcedFirstKind?: StimulusKind
// ): any[] {

//   /* 1 ─ specs for each logical screen ----------------------------- */
//   let specsBlock1: StimulusSpec[] = [];
//   let specsBlock2: StimulusSpec[] = [];

//   if (numCircles === 3) {
//     specsBlock1 = [{
//       count : 3, side : "left",
//       stimulusType: composition === "homogeneous_orientation"
//         ? "oriented_circle" : "colored_circle"
//     }];
//   } else if (grouping === "combined") {

//     if (composition !== "mixed") {
//       const stim = composition === "homogeneous_orientation"
//         ? "oriented_circle" : "colored_circle";
//       specsBlock1 = [
//         { count: 3, side: "left",  stimulusType: stim },
//         { count: 3, side: "right", stimulusType: stim }
//       ];

//     } else if (layout === "clustered") {
//       specsBlock1 = [
//         { count: 3, side: "left",  stimulusType: stimulusTypeShownFirst },
//         { count: 3, side: "right",
//           stimulusType: stimulusTypeShownFirst === "colored_circle"
//             ? "oriented_circle" : "colored_circle" }
//       ];

//     } else { // mixed + interleaved
//       const [typeA, typeB] = randomStimulusPair();
//       specsBlock1 = [
//         { count: 2, side: "left",  stimulusType: typeA },
//         { count: 1, side: "left",  stimulusType: typeB },
//         { count: 1, side: "right", stimulusType: typeA },
//         { count: 2, side: "right", stimulusType: typeB }
//       ];
//     }

//   } else { // 6 items, grouping === "split"
//     specsBlock1 = [{ count: 3, side: "left",  stimulusType: stimulusTypeShownFirst }];
//     specsBlock2 = [{
//       count: 3, side: "right",
//       stimulusType: stimulusTypeShownFirst === "colored_circle"
//         ? "oriented_circle" : "colored_circle"
//     }];
//   }

//   const blocksSpecs: StimulusSpec[][] = [];
//   if (specsBlock1.length) blocksSpecs.push(specsBlock1);
//   if (specsBlock2.length) blocksSpecs.push(specsBlock2);

//   /* 2 ─ shared closure state -------------------------------------- */
//   let placedBlocks: Stimulus[][] = [];   // created once, reused for both screens

//   /* 3 ─ build jsPsych trials -------------------------------------- */
//   return blocksSpecs.map((specsThisScreen, screenIdx) => ({

//     type: psychophysics,

//     stimuli: () => {
//       if (placedBlocks.length === 0) {          // ← this runs only once
//         const grid = createGrid(numColumns, numRows);
    
//         // 1. generate every stimulus for every screen of the logical trial
//         placedBlocks = blocksSpecs.map(specs =>
//           generateStimuli(grid, specs,
//                           cellSize.cellWidth, cellSize.cellHeight)
//         );
    
//         // 2. tag exactly two logical items with tested_first / tested_second
//         assignTestStatus(
//           placedBlocks.flat(),          // all low-level stimuli in the trial
//           numCircles,
//           composition,
//           forcedFirstKind               // may be undefined
//         );
//       }
    
//       // 3. hand the stimuli for *this* screen to the plugin
//       return placedBlocks[screenIdx];    },

//     choices         : "NO_KEYS",
//     background_color: "#FFFFFF",

//     /* duration can be dynamic, too */
//     trial_duration  : () => numCircles * 100,      // 100 ms per item

//     /* -------- fine-tune timing, no stimulus mutation ----------- */
//     on_start(trial: any) {

//       const placed       = trial.stimuli;          // already validated
//       const currentType  = specsThisScreen[0].stimulusType;
//       let   isi          = 0;

//       if (numCircles === 3 && currentType === stimulusTypeShownFirst) {
//         isi = 2300;
//       } else if (numCircles === 3) {
//         isi = 1000;
//       } else if (numCircles === 6 && grouping === "split") {
//         isi = 1000;
//       } else if (
//         grouping === "combined" &&
//         layout   === "clustered" &&
//         composition === "mixed"
//       ) {
//         const firstTestStim = placed.find(
//           (s: Stimulus) => (s as any).test_status === "tested_first"
//         );
//         const firstTestKind = firstTestStim ? stimulusKind(firstTestStim) : null;
//         isi = firstTestKind === stimulusTypeShownFirst ? 2000 : 1000;
    
//       // unchanged: homogeneous clustered keeps participant-level timing
//       } else if (grouping === "combined" && layout === "clustered") {
//         isi = currentType === stimulusTypeShownFirst ? 2000 : 1000;
    
//       } else if (grouping === "combined" && layout === "interleaved") {
//         const firstTestStim = placed.find(
//           (s: Stimulus) => (s as any).test_status === "tested_first"
//         );
//         const firstTestKind = firstTestStim ? stimulusKind(firstTestStim) : null;
//         isi = firstTestKind === stimulusTypeShownFirst ? 2000 : 1000;
//       }

//       trial.post_trial_gap = isi;
//     },

//     /* -------------- bookkeeping --------------------------------- */
//     on_finish(data: any) {
//       data.stimuliData = placedBlocks[screenIdx];
//       console.log("displayStimuli: placed stimuli", data.stimuliData);
//     },

//     data: {
//       trialID, blockID, practice,
//       part: screenIdx + 1,      // 1 or 2
//       numCircles, grouping, composition, layout,
//       trialSegment: "displayStimuli",
//       stimulusTypeShownFirst, forcedFirstKind
//     }
//   }));
// }
