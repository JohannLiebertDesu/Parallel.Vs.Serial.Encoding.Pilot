// Import necessary modules and plugins
import { displayStimuli } from './trials/displayStimuli';
import { test_trial } from './trials/reproductionTrial';
import { TEXT } from './task-fun/text';
import htmlButtonResponse from '@jspsych/plugin-html-button-response';

const gapAfterBreakScreens = 1000
/**
 * Enums for fixed values to ensure type safety and avoid magic strings.
 */

// Defines the types of stimuli used in the experiment
enum StimulusType {
  OrientedCircle = 'oriented_circle',
  ColoredCircle = 'colored_circle',
}

// Defines the order in which trial types can be presented
enum TrialOrder {
  PureFirst = 'PureFirst',
  MixedFirst = 'MixedFirst',
}

// Defines the order of recall within mixed trials
enum RecallOrderInMixed {
  Random = 'random',
  ABBA = 'ABBA',
}

enum PostTrialGaps {
  Long = 2300,
  Short = 1000,
}
/**
 * Interfaces to define the structure of various objects used in the experiment.
 */

// Represents a single trial with flexible properties
interface Trial {
  type: string | Function; // The type can be a string identifier or a function/plugin
  stimulus?: string; // Optional stimulus content
  choices?: string | string[]; // Possible choices for responses
  [key: string]: any; // Allows additional properties as needed
}

// Variables specific to pure trials
interface PureTimelineVariable {
  numCircles: number | string; // Number of circles to display
  side: string; // Side where circles appear ('left', 'right', 'both', etc.)
  stimulusType: StimulusType; // Type of stimulus (oriented or colored)
  post_trial_gap: number; // Gap after the trial in milliseconds
  trialType: string; // Type of trial ('pure')
  practice: boolean; // Indicates if it's a practice trial
}

// Variables specific to mixed trials
interface MixedTimelineVariable {
  firstStimulusType: StimulusType; // First stimulus type in the pair
  secondStimulusType: StimulusType; // Second stimulus type in the pair
  trialType: string; // Type of trial ('mixed')
  recallOrder: RecallOrderInMixed; // Order of stimulus recall
  numCircles: number | string; // Number of circles to display
  practice: boolean; // Indicates if it's a practice trial
}

// Represents a procedure consisting of a timeline of trials and how they are sampled
interface Procedure {
  timeline: Trial[]; // Array of trial definitions/functions
  timeline_variables: PureTimelineVariable[] | MixedTimelineVariable[]; // Variables for each trial
  sample: {
    type: string; // Sampling method (e.g., 'fixed-repetitions')
    size: number; // Number of times to repeat the timeline
  };
  procedureType: 'pure' | 'mixed'; // New property
}

// Represents the entire experiment structure
interface Experiment {
  name: string; // Name of the experiment
  timeline: (Procedure | Trial)[]; // Array of procedures or individual trials
}

// Parameters that define the condition for assembling the experiment
interface ConditionParams {
  firstStimulusInMixed: StimulusType; // First stimulus type in mixed trials
  trialOrder: TrialOrder; // Order of trial types (pure first or mixed first)
  recallOrderInMixed: RecallOrderInMixed; // Order within mixed trials
}

/**
 * Function to create a break screen trial.
 * Displays a message based on the type of break and includes a 'Continue' button.
 */
function createBreakScreen(
  breakType: 'postPractice' | 'betweenTrials' | 'betweenBlocks',
  loopValue: number | null,
  blocksCreated: number | null
): Trial {
  return {
    type: htmlButtonResponse, // Uses the html-button-response plugin
    stimulus: TEXT.blockBreak(breakType, loopValue, blocksCreated), // Message to display
    choices: ['Continue'], // Button choice
    post_trial_gap: gapAfterBreakScreens, // 1-second gap after the trial
  };
}

/**
 * Helper function to convert a stimulus type enum to a human-readable string.
 * This improves the readability of messages displayed to participants.
 */
function getReadableStimulus(stimulus: StimulusType | null): string {
  const mapping: Record<StimulusType, string> = {
    [StimulusType.OrientedCircle]: 'oriented lines',
    [StimulusType.ColoredCircle]: 'colored discs',
  };
  return stimulus ? mapping[stimulus] : '';
}

/**
 * Function to create an information screen that informs participants about the upcoming block.
 * It displays details such as the types of stimuli, recall order, trial order, and block number.
 */
function createUpcomingBlockInformationScreen(
  firstStimulus: StimulusType | null,
  secondStimulus: StimulusType | null,
  recallOrder: RecallOrderInMixed | null,
  trialOrder: TrialOrder,
  blocksCreated: number
): Trial {
  const readableFirstStimulus = getReadableStimulus(firstStimulus);
  const readableSecondStimulus = getReadableStimulus(secondStimulus);
  
  return {
    type: htmlButtonResponse, // Uses the html-button-response plugin
    stimulus: TEXT.blockInfo(
      readableFirstStimulus,
      readableSecondStimulus,
      recallOrder,
      trialOrder,
      blocksCreated
    ), // Information message
    choices: ['Continue'], // Button choice
    post_trial_gap: gapAfterBreakScreens, // 1-second gap after the trial
  };
}

/**
 * Functions to create timeline variables and procedures for pure and mixed trials.
 * These functions help in organizing the trials based on the experiment's conditions.
 */

/**
 * Creates an array of variables for pure trials based on the stimulus order and post-trial gaps.
 * @param stimulusOrder - Array indicating the order of stimulus types
 * @param postTrialGaps - Mapping of stimulus types to post-trial gaps
 * @param practice - Indicates if these are practice trials
 * @returns Array of PureTimelineVariable objects
 */
function createPureTimelineVariables(
  firstStimulusInMixed: StimulusType,
  secondStimulusInMixed: StimulusType,
  practice: boolean
): PureTimelineVariable[] {
  return [
    {
      numCircles: 6,
      side: 'both',
      stimulusType: firstStimulusInMixed,
      post_trial_gap: PostTrialGaps.Short,
      trialType: 'pure',
      practice: practice,
    },
    {
      numCircles: 6,
      side: 'both',
      stimulusType: secondStimulusInMixed,
      post_trial_gap: PostTrialGaps.Long,
      trialType: 'pure',
      practice: practice,
    },
    {
      numCircles: 3,
      side: 'left',
      stimulusType: secondStimulusInMixed,
      post_trial_gap: PostTrialGaps.Long,
      trialType: 'pure',
      practice: practice,
    },
    {
      numCircles: 3,
      side: 'left',
      stimulusType: firstStimulusInMixed,
      post_trial_gap: PostTrialGaps.Short,
      trialType: 'pure',
      practice: practice,
    },
    // Additional configurations can be added here as needed
  ];
}

/**
 * Creates an array of variables for mixed trials based on the stimulus types and recall order.
 * @param firstStimulusType - First stimulus type in the mixed pair
 * @param secondStimulusType - Second stimulus type in the mixed pair
 * @param recallOrder - Order in which stimuli are presented within mixed trials
 * @param practice - Indicates if these are practice trials
 * @returns Array of MixedTimelineVariable objects
 */
function createMixedTimelineVariables(
  firstStimulusInMixed: StimulusType,
  secondStimulusInMixed: StimulusType,
  recallOrder: RecallOrderInMixed,
  practice: boolean
): MixedTimelineVariable[] {
  return [
    {
      firstStimulusType: firstStimulusInMixed,
      secondStimulusType: secondStimulusInMixed,
      trialType: 'mixed',
      recallOrder: recallOrder,
      numCircles: 3, // Number of circles is fixed as 3 for mixed trials
      practice: practice,
    },
  ];
}

/**
 * Creates a procedure for pure stimuli by defining the timeline and how trials are sampled.
 * @param timelineVariablesPureSet - Array of variables for pure trials
 * @param practice - Indicates if this is a practice procedure
 * @returns A Procedure object for pure stimuli
 */
function createPureStimuliProcedure(
  timelineVariablesPureSet: PureTimelineVariable[],
  practice: boolean
): Procedure {
  return {
    timeline: [displayStimuli, test_trial, test_trial], // Sequence of trial functions/plugins
    timeline_variables: timelineVariablesPureSet, // Variables defining each trial's parameters
    sample: {
      type: 'fixed-repetitions', // Fixed number of repetitions
      size: practice ? 3 : 8, // Number of repetitions varies for practice vs. main trials
    },
    procedureType: 'pure'
  };
}

/**
 * Creates a procedure for mixed stimuli by defining the timeline and how trials are sampled.
 * @param timelineVariablesMixedSet - Array of variables for mixed trials
 * @param practice - Indicates if this is a practice procedure
 * @returns A Procedure object for mixed stimuli
 */
function createMixedStimuliProcedure(
  timelineVariablesMixedSet: MixedTimelineVariable[],
  practice: boolean
): Procedure {
  return {
    timeline: [displayStimuli, displayStimuli, test_trial, test_trial], // Sequence of trial functions/plugins
    timeline_variables: timelineVariablesMixedSet, // Variables defining each trial's parameters
    sample: {
      type: 'fixed-repetitions', // Fixed number of repetitions
      size: practice ? 12 : 32, // Number of repetitions varies for practice vs. main trials
    },
    procedureType: 'mixed'
  };
}

/**
 * Refactored function to create a block of trials, including practice procedures and breaks.
 * @param mainProcedure - The main procedure (pure or mixed) to be repeated
 * @param practiceProcedure - The corresponding practice procedure
 * @param repetitions - Number of times the main procedure is repeated in the block
 * @param BlockNr - Block number (for tracking and messaging)
 * @param params - Condition parameters defining the block's setup
 * @returns An array containing the sequence of trials and procedures for the block
 */
function createBlock(
  mainProcedure: Procedure,
  practiceProcedure: Procedure,
  repetitions: number,
  firstStimulusInMixed: StimulusType,
  secondStimulusInMixed: StimulusType,
  recallOrderInMixed: RecallOrderInMixed,
  trialOrder: TrialOrder,
): (Procedure | Trial)[] {
  const block: (Procedure | Trial)[] = [];
  
  // Determine the current block number by checking whether the procedure we are creating corresponds to the procedure that is first shown to the participant. 
  const BlockNr = 
  (trialOrder === TrialOrder.PureFirst && mainProcedure.procedureType === 'pure') || (trialOrder === TrialOrder.MixedFirst && mainProcedure.procedureType === 'mixed')
    ? 1
    : 2
  
  // Create an information screen about the upcoming block
  const upcomingBlockInformationScreen = createUpcomingBlockInformationScreen(
    firstStimulusInMixed,
    secondStimulusInMixed,
    recallOrderInMixed,
    trialOrder,
    BlockNr
  );
  
  block.push(upcomingBlockInformationScreen); // Add information screen to the block
  block.push(practiceProcedure); // Add practice trials
  
  // Add a break after practice trials
  let postPracticeBreakTrial = createBreakScreen('postPractice', null, null);
  block.push(postPracticeBreakTrial);
  
  // Add the main procedure repeated 'repetitions' times with short breaks in between
  for (let i = 0; i < repetitions; i++) {
    block.push(mainProcedure); // Add the main procedure
    
    // Add a short break between trials, except after the last repetition
    if (i < repetitions - 1) {
      let shortBreakTrial = createBreakScreen('betweenTrials', i + 1, BlockNr);
      block.push(shortBreakTrial);
    }
  }
  
  return block; // Return the assembled block
}

/**
 * Function to assemble the entire experiment based on the provided condition parameters.
 * It creates pure and mixed blocks, inserts breaks, and organizes the timeline based on trial order.
 * @param params - Condition parameters defining the experiment's setup
 * @returns An Experiment object containing the name and the complete timeline
 */
export function assembleExperiment(params: ConditionParams): Experiment {
  const { firstStimulusInMixed, trialOrder, recallOrderInMixed } = params; // Extract the variables from params
  
  // We set the secondStimulusInMixed depending on whether firstStimulusInMixed equates to to OrientedCircle or ColoredCircle
  const secondStimulusInMixed = 
  firstStimulusInMixed === StimulusType.OrientedCircle
    ? StimulusType.ColoredCircle
    : StimulusType.OrientedCircle;

  /**
   * Create practice procedures for both pure and mixed trials.
   * These procedures use the 'practice' flag to adjust parameters like repetition size.
   */
  const practiceProcedures = {
    pureProcedure: createPureStimuliProcedure(
      createPureTimelineVariables(firstStimulusInMixed, secondStimulusInMixed, true),
      true
    ),
    mixedProcedure: createMixedStimuliProcedure(
      createMixedTimelineVariables(
        firstStimulusInMixed,
        secondStimulusInMixed,
        recallOrderInMixed,
        true
      ),
      true
    ),
  };
  
  /**
   * Create main (non-practice) procedures for both pure and mixed trials.
   * These procedures use the 'practice' flag to adjust parameters like repetition size.
   */
  const mainProcedures = {
    pureProcedure: createPureStimuliProcedure(
      createPureTimelineVariables(firstStimulusInMixed, secondStimulusInMixed, false),
      false
    ),
    mixedProcedure: createMixedStimuliProcedure(
      createMixedTimelineVariables(
        firstStimulusInMixed,
        secondStimulusInMixed,
        recallOrderInMixed,
        false
      ),
      false
    ),
  };
    
  /**
   * Create pure and mixed blocks using the previously defined procedures.
   * Each block includes practice trials, main trials, and appropriate breaks.
   */
  const pureBlock = createBlock(
    mainProcedures.pureProcedure, // Main pure procedure
    practiceProcedures.pureProcedure, // Practice pure procedure
    3, // Number of repetitions for pure trials
    firstStimulusInMixed,
    secondStimulusInMixed,
    recallOrderInMixed,
    trialOrder
  );
    
  const mixedBlock = createBlock(
    mainProcedures.mixedProcedure, // Main mixed procedure
    practiceProcedures.mixedProcedure, // Practice mixed procedure
    3, // Number of repetitions for pure trials
    firstStimulusInMixed,
    secondStimulusInMixed,
    recallOrderInMixed,
    trialOrder
  );
  
  // Create a large break after pure and mixed blocks
  const largeBreakTrial = createBreakScreen("betweenBlocks", null, null);
  
  /**
   * Assemble the complete experiment timeline based on the specified trial order.
   * The timeline will have pure and mixed blocks separated by a large break.
   */
  let experimentTimeline: (Procedure | Trial)[];
  
  if (trialOrder === TrialOrder.PureFirst) {
    experimentTimeline = [...pureBlock, largeBreakTrial, ...mixedBlock];
  } else {
    experimentTimeline = [...mixedBlock, largeBreakTrial, ...pureBlock];
  }
  
  // Return the assembled experiment with a descriptive name and the complete timeline
  return {
    name: 'Experiment_' + trialOrder, // Name includes the trial order for identification
    timeline: experimentTimeline, // Complete timeline of the experiment
  };
}

/**
 * Arrays containing all possible options for each condition variable.
 * These arrays are used to generate all combinations of experimental conditions.
 */

// Possible options for the first stimulus in mixed trials
const firstStimulusInMixedOptions: StimulusType[] = [
  StimulusType.OrientedCircle,
  StimulusType.ColoredCircle,
];

// Possible options for the order of trial types
const trialOrderOptions: TrialOrder[] = [
  TrialOrder.PureFirst,
  TrialOrder.MixedFirst,
];

// Possible options for the order of stimulus recall within mixed trials
const recallOrderInMixed: RecallOrderInMixed[] = [
  RecallOrderInMixed.Random,
  RecallOrderInMixed.ABBA,
];

/**
 * Generates all possible combinations of experimental conditions based on the provided options.
 * Each combination is given a descriptive name and associated with its parameter set.
 * @returns Array of condition objects containing a name and corresponding parameters
 */
function generateConditionCombinations(): {
  name: string;
  params: ConditionParams;
}[] {
  const conditions: { name: string; params: ConditionParams }[] = [];
  
  // Iterate over each possible value of firstStimulusInMixed
  firstStimulusInMixedOptions.forEach((firstStimulusInMixed) => {
    // Iterate over each possible value of trialOrder
    trialOrderOptions.forEach((trialOrder) => {
      // Iterate over each possible value of recallOrderInMixed
      recallOrderInMixed.forEach((recallOrderInMixed) => {
        // Generate a descriptive name for the condition
        const conditionName = `${
          firstStimulusInMixed === StimulusType.OrientedCircle
            ? 'OrientedFirst'
            : 'ColoredFirst'
        }_${trialOrder}_${
          recallOrderInMixed === RecallOrderInMixed.ABBA
            ? 'ABBA'
            : 'Random'
        }`;
        
        
        // Push the condition with its name and parameters to the conditions array
        conditions.push({
          name: conditionName,
          params: {
            firstStimulusInMixed,
            trialOrder,
            recallOrderInMixed: recallOrderInMixed,
          },
        });
      });
    });
  });
  
  return conditions; // Return all generated conditions
}

// Generate all condition combinations and export them for use in the experiment setup
export const conditions = generateConditionCombinations();
