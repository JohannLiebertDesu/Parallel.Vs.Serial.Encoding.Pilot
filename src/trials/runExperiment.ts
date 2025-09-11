import { BlockConfig } from "./fullTrial";

const chroma = 0.1
const lightness = 0.7
const assumedHz = 60 // frames per second
const fixationDuration = 0.5 // in seconds
const fixationFrameCount = Math.ceil(assumedHz * fixationDuration)
const maskDuration = 0.05 // in seconds
const maskFrameCount = Math.ceil(assumedHz * maskDuration)
const possibleDegPerFrame = [0, 5, 10, 15]
const startDurationStimuli = 0.08 //s = 80ms
const width = 300
const height = 300
const wheelOuterRadius = 450
const wheelInnerRadius = 350
const ITIduration = 2000
const tile = 4
const triangleRadius = 250

  // ----- Configure one block (edit to taste) -----
  export const block1: BlockConfig = {
    startX: 0,
    startY: 0,
    width: width,
    height: height,
    deg_per_frame: possibleDegPerFrame[0],      // hue step per frame
    stimuliFrameCount: 3,
    maskFrameCount: maskFrameCount,
    fixationFrameCount: fixationFrameCount,
    tile: tile,               // tile size (px) for the mask
    assumedHz: assumedHz,

    wheelOuterRadius: wheelOuterRadius,
    wheelInnerRadius: wheelInnerRadius,

    ITIduration: ITIduration,

    blockID: 1,
    practice: false,
    trialsPerBlock: 10,

    triangleRadius: triangleRadius,      // distance from center to each square center
    nColoredSquares: 1,     // 0..3: how many of the 3 are colored

    chroma: chroma,
    lightness: lightness,

    calibrationTrial: true,
  };


    export const block2: BlockConfig = {
    startX: 0,
    startY: 0,
    width: width,
    height: height,
    deg_per_frame: 10,      // hue step per frame
    stimuliFrameCount: 3,
    maskFrameCount: maskFrameCount,
    fixationFrameCount: fixationFrameCount,
    tile: tile,               // tile size (px) for the mask
    assumedHz: assumedHz,

    wheelOuterRadius: wheelOuterRadius,
    wheelInnerRadius: wheelInnerRadius,

    ITIduration: ITIduration,

    blockID: 1,
    practice: false,
    trialsPerBlock: 10,

    triangleRadius: triangleRadius,      // distance from center to each square center
    nColoredSquares: 1,     // 0..3: how many of the 3 are colored

    chroma: chroma,
    lightness: lightness,

    calibrationTrial: false,
  };

// /**
//  * Build and run the whole experiment.
//  *
//  * @param timeline  jsPsych timeline to populate.
//  * @param participantID  Unique numeric ID returned by initializeAndAssignSubjectID().
//  * @param practice  Whether this run is practice or main task.
//  */
// export function runExperiment(timeline: any[], participantID: number) {
//   // 1) participant-specific first-stim flip
//   const firstStimulusKind = firstStimulusFor(participantID);

//   // 2) duplicate mixed blocks BEFORE ordering (so they’re distinct levels)
//   const expandedOrder = DESIGN.flatMap(d =>
//     d.composition === "mixed" ? [d, { ...d }] : [d]
//   );

//   // 3) Williams order over the expanded set
//   const orderIdx = williamsOrderForParticipant(expandedOrder.length, participantID);
//   const participantBlocks: BlockConfig[] = orderIdx.map((idx, i) => ({
//     ...expandedOrder[idx],
//     blockID: i + 1,
//     practice: false,
//     stimulusTypeShownFirst: firstStimulusKind,
//   }));

//   const totalBlocks = participantBlocks.length;

//   // 4) assemble timeline (unchanged from your version)
//   participantBlocks.forEach((blockCfg, i) => {
//     const practiceTrials = i === 0 ? 10 : 4;

//     timeline.push(
//       createPrePracticeScreen(blockCfg.blockID, totalBlocks, practiceTrials, {
//         numCircles: blockCfg.numCircles,
//         grouping: blockCfg.grouping,
//         composition: blockCfg.composition,
//         layout: blockCfg.layout,
//       })
//     );

//     runBlock(timeline, { ...blockCfg, practice: true, trialsPerBlock: practiceTrials });
//     timeline.push(createPostPracticeScreen(blockCfg.blockID, totalBlocks));
//     runBlock(timeline, blockCfg);

//     if (i !== totalBlocks - 1) {
//       timeline.push(createBetweenBlockBreakScreen(blockCfg.blockID, totalBlocks));
//     }
//   });
// }

// export function buildExperimentNode(participantID: number) {
//   const expTimeline: any[] = [];
//   runExperiment(expTimeline, participantID);
//   return { timeline: expTimeline, name: "dual-set-task" };
// }
