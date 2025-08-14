// breakScreen.ts
import htmlButtonResponse from "@jspsych/plugin-html-button-response";
import type { BlockConfig } from "../trials/fullTrial"; // type-only import avoids runtime cycles

/** Only the fields we need to describe a block to the participant. */
export type PrePracticeOpts = Pick<
  BlockConfig,
  "numCircles" | "grouping" | "composition" | "layout"
>;

/* ----------------------- Small text helpers ----------------------- */

const sentence = (s: string) => (s.trim().endsWith(".") ? s.trim() : s.trim() + ".");
const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

const describeGrouping = (numCircles: 3 | 6, grouping: "combined" | "split") => {
  if (grouping === "split") {
    return "The display will appear in two steps: first the left side, then the right side";
  }
  // combined
  return numCircles === 6
    ? "Everything will appear on one screen with stimuli on both the left and right side"
    : "Everything will appear on one screen with stimuli on the left side only";
};

const describeComposition = (
  composition: "homogeneous_color" | "homogeneous_orientation" | "mixed"
) => {
  switch (composition) {
    case "homogeneous_color":
      return "You will only see colored circles. Try to remember the colors as well as you can.";
    case "homogeneous_orientation":
      return "You will only see circles with an oriented line inside. Try to remember the line's orientations as well as you can.";
    case "mixed":
      return "You will see a mix: some circles are colored and others have an oriented line. Try to remember the line's orientations and the colors as well as you can.";
  }
};

const describeLayout = (
  layout: "clustered" | "interleaved",
  composition: "homogeneous_color" | "homogeneous_orientation" | "mixed"
) => {
  if (composition !== "mixed") return ""; // layout only matters when both kinds appear
  return layout === "clustered"
    ? "Each screen side will contain just one type of circle"
    : "The two types of circles will be mixed and presented on both sides of the screen";
};

/* ----------------------- HTML templates --------------------------- */

export const BREAK = {
  prePractice: (
    blockIndex: number,
    totalBlocks: number,
    practiceTrials: number,
    { numCircles, grouping, composition, layout }: PrePracticeOpts
  ) => {
    const t1 = `In this practice block, you’ll complete ${practiceTrials} ${plural(
      practiceTrials,
      "trial",
      "trials"
    )}.`;
    const t2 = `Each trial shows ${numCircles} circles.`;
    const t3 = sentence(describeGrouping(numCircles, grouping));
    const t4 = sentence(describeComposition(composition));
    const t5 = describeLayout(layout, composition);
    const body = [t1, t2, t3, t4, t5 && sentence(t5)].filter(Boolean).join(" ");

    return `
      <div class='main'>
        <h1 class='title'>Next: Practice for Block ${blockIndex} of ${totalBlocks}</h1>
        <p class='fb-text'>${body}</p>
        <p class='fb-text'>When you’re ready, click the button to start practice.</p>
      </div>`;
  },

  postPractice: (blockIndex: number, totalBlocks: number) => `
    <div class='main'>
      <h1 class='title'>Ready for more?</h1>
      <p class='fb-text'>
        Great! Those were the practice trials for block <b>${blockIndex}</b> of <b>${totalBlocks}</b>.
        Click the button to begin the main trials.
      </p>
    </div>`,

  betweenBlocks: (completedBlocks: number, totalBlocks: number) => `
    <div class='main'>
      <h1 class='title'>Take a break</h1>
      <p class='fb-text'>
        Good job! You’ve completed <b>${completedBlocks}</b> of <b>${totalBlocks}</b> blocks.
        Take a few seconds to rest. When you’re ready, click to continue.
      </p>
    </div>`,
};

/* ----------------------- Factory trials --------------------------- */

export function createPrePracticeScreen(
  blockIndex: number,
  totalBlocks: number,
  practiceTrials: number,
  opts: PrePracticeOpts
) {
  return {
    type: htmlButtonResponse,
    stimulus: BREAK.prePractice(blockIndex, totalBlocks, practiceTrials, opts),
    choices: ["Start practice"],
    data: {
      trialSegment: "prePractice",
      blockIndex,
      totalBlocks,
      practiceTrials,
      ...opts,
    },
  };
}

export function createPostPracticeScreen(blockIndex: number, totalBlocks: number) {
  return {
    type: htmlButtonResponse,
    stimulus: BREAK.postPractice(blockIndex, totalBlocks),
    choices: ["Start main trials"],
    data: { trialSegment: "postPractice", blockIndex, totalBlocks },
  };
}

export function createBetweenBlockBreakScreen(completedBlocks: number, totalBlocks: number) {
  return {
    type: htmlButtonResponse,
    stimulus: BREAK.betweenBlocks(completedBlocks, totalBlocks),
    choices: ["Continue"],
    data: { trialSegment: "betweenBlocks", completedBlocks, totalBlocks },
  };
}
