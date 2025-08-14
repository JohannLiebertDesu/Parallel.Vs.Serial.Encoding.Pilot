/* -------- experiment.ts ------------------------------------------ */
import { runBlock, BlockConfig, rotateArray, firstStimulusFor, DESIGN } from "./fullTrial";
import {
  createPrePracticeScreen,
  createPostPracticeScreen,
  createBetweenBlockBreakScreen,
} from "../task-fun/breakScreens";

/**
 * Build and run the whole experiment.
 *
 * @param timeline  jsPsych timeline to populate.
 * @param participantID  Unique numeric ID returned by initializeAndAssignSubjectID().
 * @param practice  Whether this run is practice or main task.
 */
export function runExperiment(timeline: any[], participantID: number) {
  // 1) participant-specific rotation
  const baseOrder = rotateArray(DESIGN, (participantID - 1) % DESIGN.length);
  const firstStimulusKind = firstStimulusFor(participantID);

  // 2) duplicate mixed blocks
  const expandedOrder = baseOrder.flatMap(d => (d.composition === "mixed" ? [d, { ...d }] : [d]));

  // 3) build configs
  const participantBlocks: BlockConfig[] = expandedOrder.map((d, idx) => ({
    ...d,
    blockID: idx + 1,
    practice: false,
    stimulusTypeShownFirst: firstStimulusKind,
  }));

  const totalBlocks = participantBlocks.length;

  // 4) for each block: pre-practice screen → practice → post-practice → main → between-block screen
  participantBlocks.forEach((blockCfg, i) => {
    const practiceTrials = i === 0 ? 10 : 4;

    // PRE-PRACTICE INFO
    timeline.push(
      createPrePracticeScreen(blockCfg.blockID, totalBlocks, practiceTrials, {
        numCircles: blockCfg.numCircles,
        grouping: blockCfg.grouping,
        composition: blockCfg.composition,
        layout: blockCfg.layout,
      })
    );

    // PRACTICE
    runBlock(timeline, { ...blockCfg, practice: true, trialsPerBlock: practiceTrials });

    // POST-PRACTICE CONNECTOR
    timeline.push(createPostPracticeScreen(blockCfg.blockID, totalBlocks));

    // MAIN BLOCK (20 trials)
    runBlock(timeline, blockCfg);

    // BETWEEN-BLOCK BREAK (skip after last)
    if (i !== totalBlocks - 1) {
      timeline.push(createBetweenBlockBreakScreen(blockCfg.blockID, totalBlocks));
    }
  });
}

export function buildExperimentNode(participantID: number) {
  const expTimeline: any[] = [];
  runExperiment(expTimeline, participantID);
  return { timeline: expTimeline, name: "dual-set-task" };
}
