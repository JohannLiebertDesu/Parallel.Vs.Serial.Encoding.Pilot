/* -------- experiment.ts ------------------------------------------ */
import { runBlock, BlockConfig, rotateArray, firstStimulusFor, DESIGN } from "./fullTrial";
// import { createBetweenBlockBreakScreen } from "../instructions/betweenBlock"; // 

/**
 * Build and run the whole experiment.
 *
 * @param timeline  jsPsych timeline to populate.
 * @param participantID  Unique numeric ID returned by initializeAndAssignSubjectID().
 * @param practice  Whether this run is practice or main task.
 */
export function runExperiment(
  timeline: any[],
  participantID: number,
  practice = false // default, but can be overridden
) {
  /* 1 ── Make the two counter-balances for this person ─────────── */
  const blockOrder = rotateArray(DESIGN, (participantID - 1) % DESIGN.length);
  const firstStimulusKind = firstStimulusFor(participantID);

  /* 2 ── Build BlockConfig list exactly as before, but from blockOrder */
  const participantBlocks: BlockConfig[] = blockOrder.map((d, idx) => ({
    ...d,
    blockID: idx + 1,
    practice,
    stimulusTypeShownFirst: firstStimulusKind,
  }));

  /* 3 ── Run the blocks (unchanged) */
  participantBlocks.forEach((blockCfg, i) => {
    runBlock(timeline, blockCfg);

    const isLast = i === participantBlocks.length - 1;
    // if (!isLast) {
    //   timeline.push(
    //     createBetweenBlockBreakScreen(
    //       blockCfg.blockID,
    //       participantBlocks.length
    //     )
    //   );
    // }
  });
}


export function buildExperimentNode(participantID: number) {
    const expTimeline: any[] = [];
  
    // practice first, then main
    runExperiment(expTimeline, participantID, true);
    runExperiment(expTimeline, participantID, false);
  
    return { timeline: expTimeline, name: "dual-set-task" };
  }