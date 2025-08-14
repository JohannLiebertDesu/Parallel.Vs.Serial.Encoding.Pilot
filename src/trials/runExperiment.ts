/* -------- experiment.ts ------------------------------------------ */
import { runBlock, BlockConfig, firstStimulusFor, DESIGN, williamsOrderForParticipant } from "./fullTrial";
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
  // 1) participant-specific first-stim flip
  const firstStimulusKind = firstStimulusFor(participantID);

  // 2) duplicate mixed blocks BEFORE ordering (so they’re distinct levels)
  const expandedOrder = DESIGN.flatMap(d =>
    d.composition === "mixed" ? [d, { ...d }] : [d]
  );

  // 3) Williams order over the expanded set
  const orderIdx = williamsOrderForParticipant(expandedOrder.length, participantID);
  const participantBlocks: BlockConfig[] = orderIdx.map((idx, i) => ({
    ...expandedOrder[idx],
    blockID: i + 1,
    practice: false,
    stimulusTypeShownFirst: firstStimulusKind,
  }));

  const totalBlocks = participantBlocks.length;

  // 4) assemble timeline (unchanged from your version)
  participantBlocks.forEach((blockCfg, i) => {
    const practiceTrials = i === 0 ? 10 : 4;

    timeline.push(
      createPrePracticeScreen(blockCfg.blockID, totalBlocks, practiceTrials, {
        numCircles: blockCfg.numCircles,
        grouping: blockCfg.grouping,
        composition: blockCfg.composition,
        layout: blockCfg.layout,
      })
    );

    runBlock(timeline, { ...blockCfg, practice: true, trialsPerBlock: practiceTrials });
    timeline.push(createPostPracticeScreen(blockCfg.blockID, totalBlocks));
    runBlock(timeline, blockCfg);

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
