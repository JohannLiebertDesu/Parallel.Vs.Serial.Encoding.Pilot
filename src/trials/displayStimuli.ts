import psychophysics from "@kurokida/jspsych-psychophysics";
import { placeAndGenerateStimuli } from "../task-fun/placeStimuli";
import {
  createGrid,
  numColumns,
  numRows,
  cellSize,
  resetGrid,
} from "../task-fun/createGrid";
import { jsPsych } from "../jsp";
import { filterAndMapStimuli } from "../task-fun/filterStimuli";

// Constants
const BLOCK_SIZE = 96; // Number of trials per block
const SEGMENT_SIZE = 32 // Number of trials per segment
const GRID = createGrid(numColumns, numRows);
export let practiceTrialID = 0;
export let trialID = 0;
export let blockID = Math.ceil(trialID / BLOCK_SIZE)
export let segmentID = Math.ceil(trialID / SEGMENT_SIZE)

export const displayStimuli = {
    type: psychophysics,
    stimuli: function () {
        let numCircles
        numCircles = jsPsych.timelineVariable("numCircles");
        const { side, stimulusType } = computeTrialVariables();
      
        const generatedStimuli = placeAndGenerateStimuli(
          GRID,
          numCircles,
          cellSize.cellWidth,
          cellSize.cellHeight,
          side,
          stimulusType
        );
      
        return generatedStimuli;
      },
    
      data: function () {
        const { side, stimulusType } = computeTrialVariables();
        const trialType = jsPsych.timelineVariable('trialType'); 
        const practice = jsPsych.timelineVariable('practice') 
        let recallOrder = null; // Declare recallOrder at a higher scope

        if (practice) {
          if (trialType === "pure") {  // We cant increment the trial number blindly, as in the mixed trials the displayStimuli is called twice.
            practiceTrialID++; // The trial number is incremented here and not in an on_start function, because the data storing happens before.
          } else if (isFirstPresentation()) {
            practiceTrialID++;
          }
        } else {
          if (trialType === "pure") {
            trialID++;
          } else if (isFirstPresentation()) {
            trialID++;
        }
      }
       if (trialType === "mixed") {
        recallOrder = jsPsych.timelineVariable('recallOrder')
      }

        return {
          segmentID: segmentID,
          practiceTrialID: practiceTrialID,
          trialID: trialID,
          blockID: blockID,
          numCircles: jsPsych.timelineVariable("numCircles"),
          side: side,
          stimulusType: stimulusType,
          trialType: trialType,
          recallOrder: recallOrder,
          practice: practice,
          isTestTrial: false
        };
      },
      
    background_color: "#FFFFFF",
    choices: "NO_KEYS",
    trial_duration: function () {
        return jsPsych.timelineVariable("numCircles") * 100;
    },
    on_finish: function (data) {
      // Access the stimuli array from the current trial
      const stimuli_array = jsPsych.getCurrentTrial().stim_array;
  
      // Use the shared function to filter and map the stimuli
      const filteredStimuli = filterAndMapStimuli(stimuli_array);
    
      // Attach the relevant stimuli data to the trial data
      data.stimuliData = filteredStimuli;

      // Reset the grid for the next trial
      resetGrid(GRID, numColumns, numRows);
  },

      post_trial_gap: function() {

        const trialType = jsPsych.timelineVariable('trialType');
      
        if (trialType === "pure") {
          return jsPsych.timelineVariable("post_trial_gap");
        } else {
          
          return 1000; // I really hope im not making a logical mistake here, because in the slides it says 2000 for the first presentation and 1000 for the second, but no matter how i look at it that seems wrong.
          // if (isFirstPresentation()) {
          //   return 2000;
          // } else {
          //   return 1000;
          // }
        }
    }  
};

function computeTrialVariables() {
    let side;
    let stimulusType;
    const trialType = jsPsych.timelineVariable("trialType");
  
    if (trialType === "pure") {
      side = jsPsych.timelineVariable("side");
      stimulusType = jsPsych.timelineVariable("stimulusType");
    } else {
      if (isFirstPresentation()) {
        side = "left";
        stimulusType = jsPsych.timelineVariable("firstStimulusType");
      } else {
        side = "right";
        stimulusType = jsPsych.timelineVariable("secondStimulusType");
      }
    }
  
    return { side, stimulusType };
  }

// Determine if it's the first or second presentation
// The modulus operation % finds the part of a number that is left over after subtracting 
// the largest possible multiple of the divisor (2 in this case) from the number.
// If the result is 0, it means the number is divisible by 2, i.e., it's an even number
function isFirstPresentation() {
    const mixedTrialCount = jsPsych.data.get().filter({ trialType: "mixed" }).count();
    return mixedTrialCount % 2 === 0;
  }