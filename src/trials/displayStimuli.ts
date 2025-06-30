import psychophysics from "@kurokida/jspsych-psychophysics";
import { generateStimuli, StimulusSpec, StimulusKind } from "../task-fun/placeStimuli";
import {
  createGrid,
  numColumns,
  numRows,
  cellSize,
  resetGrid,
} from "../task-fun/createGrid";
import { jsPsych } from "../jsp";
import { filterAndMapStimuli } from "../task-fun/filterStimuli";
import { Stimulus } from "../task-fun/createStimuli";
import { assignTestStatus } from "../task-fun/assignTestStatus";

// We only need the grid to place the stimuli, so we can create it once and reuse it.
const GRID = createGrid(numColumns, numRows);

/** Randomly returns a tuple [typeA, typeB] such that
 *  - typeA will be used for the “first/left” role in a mixed trial
 *  - typeB is the remaining feature
 */
function randomStimulusPair(): [StimulusKind, StimulusKind] {
  return Math.random() < 0.5
    ? ['colored_circle', 'oriented_circle']
    : ['oriented_circle', 'colored_circle'];
}

/** Convert a low-level Stimulus back to its logical “feature type”. 
 * Basically, to determine what post-stimulus interval to use, we need to know which stimulus type will be probed first.
 * This is used in the conditions where the stimuli are mixed and interleaved.
*/
function stimulusKind(stim: Stimulus): StimulusKind {
  if (stim.obj_type === 'line') return 'oriented_circle';
  // circle: transparent → oriented;  colored → colored
  const circle = stim as any;                       // CircleStimulus | Wheel…
  return circle.fill_color === 'transparent'
    ? 'oriented_circle'
    : 'colored_circle';
}


/**
 * Generate the screen containing the colored discs or the oriented discs that have to be remembered.  
 *
 * @param trialID                   - Trial number 
 * @param blockID                   - Block number to distinguish different segments of the experiment
 * @param practice                  - A boolean indicating whether this is a practice trial or not
 * @param numCircles                - The number of circles to be displayed, either 3 or 6
 * @param grouping                  - Temporal presentation mode: "combined" (all at once) or "split" (3-then-3).
 * @param composition               - Set composition: "homogeneous" (all color or all orientation) or "mixed".
 * @param layout                    - Spatial arrangement on mixed trials: "clustered" (segregated) or "interleaved".
 * @param stimulusTypeShownFirst    - Whether the orientation or the color stimuli are shown first in the mixed trials
 * @param forcedFirstKind           - If defined, this is the stimulus that must be probed first (e.g., for ABBA testing order).
 * @returns One or two displays containing the stimuli, depending on the grouping.
 */
export function displayStimuli (
  trialID: number,
  blockID: number,
  practice: boolean,
  numCircles: 3 | 6,
  grouping:      'combined' | 'split',                                           // temporal
  composition:   'homogeneous_color' | 'homogeneous_orientation' | 'mixed',     // set composition
  layout:        'clustered' | 'interleaved',                                    // spatial
  stimulusTypeShownFirst: StimulusKind,                                          // only used in split trials
  forcedFirstKind?: StimulusKind        
): any {


  // Convert the high-level condition into one or two StimulusSpec arrays
  let specsBlock1: StimulusSpec[] = [];
  let specsBlock2: StimulusSpec[] = [];   // only used in split trials

  // ---------- CASE A: 3 items (always on the left) ----------
  if (numCircles === 3) {
    specsBlock1 = [{
      count: 3,
      side: 'left',
      stimulusType:
        composition === 'homogeneous_orientation'
          ? 'oriented_circle'
          : 'colored_circle',
    }];
  }

  // ---------- CASE B: 6 items, grouping = combined ----------
  else if (grouping === 'combined') {

    // (i)  homogeneous ----------------------------------------
    if (composition !== 'mixed') {
      const stim = composition === 'homogeneous_orientation'
        ? 'oriented_circle'
        : 'colored_circle';
      specsBlock1 = [
        { count: 3, side: 'left',  stimulusType: stim },
        { count: 3, side: 'right', stimulusType: stim },
      ];
    }

    // (ii) mixed + clustered ---------------------------------
    else if (layout === 'clustered') {
      specsBlock1 = [
        { count: 3, side: 'left',  stimulusType: stimulusTypeShownFirst  },
        { count: 3, side: 'right', stimulusType: stimulusTypeShownFirst === 'colored_circle' ? 'oriented_circle' : 'colored_circle' },
      ];
    }

    // (iii) mixed + interleaved ------------------------------
    else { // layout === 'interleaved'
      const [typeA, typeB] = randomStimulusPair();
      specsBlock1 = [
        { count: 2, side: 'left',  stimulusType: typeA  },
        { count: 1, side: 'left',  stimulusType: typeB },
        { count: 1, side: 'right', stimulusType: typeA   },
        { count: 2, side: 'right', stimulusType: typeB },
      ];
    }
  }

  // ---------- CASE C: 6 items, grouping = split (always mixed) ----------
  else { // grouping === 'split'
    specsBlock1 = [
      { count: 3, side: 'left',  stimulusType: stimulusTypeShownFirst },
    ];
    specsBlock2 = [
      { count: 3, side: 'right', stimulusType: stimulusTypeShownFirst === 'colored_circle' ? 'oriented_circle' : 'colored_circle' },
    ];
  }

  /* Decide whether we show one or two displays */
  const blocks: StimulusSpec[][] = [];
  if (specsBlock1.length) blocks.push(specsBlock1);   // always exists
  if (specsBlock2.length) blocks.push(specsBlock2);   // only in split trials
  
  /* ----- generate all Stimulus objects for every display ------------*/
  const placedBlocks: Stimulus[][] = blocks.map(specs =>
    generateStimuli(GRID, specs, cellSize.cellWidth, cellSize.cellHeight)
  );

  /* ----- decide & mark which items will be tested -------------------*/
  assignTestStatus(
    placedBlocks.flat(),          // all low-level objects together
    numCircles,
    composition,
    forcedFirstKind
  );

  /* Turn the screens into jsPsych trials. The arrow => creates a loop through the blocks */
  const display = placedBlocks.map((placed, idx) => {

    /* 2b. Convert them to psychophysics-plugin format                */
    const stimuli = filterAndMapStimuli(placed);        // → [{obj_type:"circle", …}, …]

    /* 2c. Assigne time durations */
    const presentationDuration = numCircles * 100;  // 100 ms per item

    /* --- choose the post-stimulus blank ---------------------------*/
    const currentType = blocks[idx][0].stimulusType;   // feature on *this* screen
    let postStimulusInterval = 0;
    
    if (numCircles === 3 && currentType === stimulusTypeShownFirst) {
      postStimulusInterval = 2300;
    } else if (numCircles === 3) {
      postStimulusInterval = 1000;
    } else if (numCircles === 6 && grouping === 'split') {
      postStimulusInterval = 1000;
    } else if (
      grouping === 'combined' &&
      layout   === 'clustered' &&
      currentType === stimulusTypeShownFirst
    ) {
      postStimulusInterval = 2000;                      // 1st feature, clustered
    } else if (
      grouping === 'combined' &&
      layout   === 'clustered'
    ) {
      postStimulusInterval = 1000;                      // 2nd feature, clustered
    
    } else if (grouping === 'combined' && layout === 'interleaved') {
    
      // find the logical item that will be probed first
      const firstTestStim = placed.find(s => s.test_status === 'tested_first');
      const firstTestKind = firstTestStim ? stimulusKind(firstTestStim) : null;
    
      postStimulusInterval =
        firstTestKind === stimulusTypeShownFirst ? 2000 : 1000;
    }


    return {
      type: psychophysics,
      stimuli,
      trial_duration: presentationDuration,
      post_trial_gap: postStimulusInterval,   
      choices: "NO_KEYS",
      background_color: "#FFFFFF",
  
      on_finish: function (data) {
      // Access the stimuli array from the current trial
      const stimuli_array = jsPsych.getCurrentTrial().stim_array;
      // Attach the relevant stimuli data to the trial data
      data.stimuliData = stimuli_array;

      // Reset the grid for the next trial
      resetGrid(GRID, numColumns, numRows);
      },

      /* useful bookkeeping ----------------------------------------*/
      data: {
        trialID,
        blockID,
        practice,
        part: idx + 1,           // 1 or 2
        numCircles,
        grouping,
        composition,
        layout,
        trialSegment: 'displayStimuli',
        stimulusTypeShownFirst: stimulusTypeShownFirst,
        forcedFirstKind 
      },
    };
  });
  
  return display;
}