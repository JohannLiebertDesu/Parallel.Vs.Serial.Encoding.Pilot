import { jsPsych } from "../jsp";
import psychophysics from "@kurokida/jspsych-psychophysics";
import { filterAndMapStimuli } from "../task-fun/filterStimuli";
import { createColorWheel, createOrientationWheel } from "../task-fun/createWheels";
import { Stimulus, LineStimulus, CircleStimulus, WheelStimulus } from "../task-fun/createStimuli";
import { cloneDeep } from "lodash";
import { trialID, practiceTrialID, segmentID, blockID } from "./displayStimuli";
import { screenWidth } from "../task-fun/createGrid";

type StimulusType = 'colored_circle' | 'oriented_circle';

const stateManager = (function() {
    // Private state variables
    let filteredData: Stimulus[] = [];
    let currentStimulusToIdentify: CircleStimulus | [CircleStimulus, LineStimulus] | null = null;
    let selectedStimulusTypeForRandomOrder: StimulusType | null = null;

    // Public methods to access and modify the state
    return {
        getFilteredData(): Stimulus[] {
            return filteredData;
        },
        setFilteredData(data: Stimulus[]): void {
            filteredData = data;
        },
        getCurrentStimulusToIdentify(): CircleStimulus | [CircleStimulus, LineStimulus] | null {
            return currentStimulusToIdentify;
        },
        setCurrentStimulusToIdentify(stimulus: CircleStimulus | [CircleStimulus, LineStimulus] | null): void {
            currentStimulusToIdentify = stimulus;
        },
        getSelectedStimulusTypeForRandomOrder(): StimulusType | null {
            return selectedStimulusTypeForRandomOrder;
        },
        setSelectedStimulusTypeForRandomOrder(type: StimulusType | null): void {
            selectedStimulusTypeForRandomOrder = type;
        },
        resetState(): void {
            filteredData = [];
            currentStimulusToIdentify = null;
            selectedStimulusTypeForRandomOrder = null;
        }
    };
})();

// Fetch previous trials based on the number and optional stimulusType
function fetchPreviousTrials(numTrials: number, stimulusType?: StimulusType | null) {
    const trials = jsPsych.data.get().last(numTrials).values();
    if (stimulusType) {
        return trials.filter(trial => trial.stimulusType === stimulusType);
    }
    return trials;
}

// Check if it's the first test screen by tracking test trials
function isFirstTestScreen() {
    const testTrials = jsPsych.data.get().filter({ isTestTrial: true });
    return testTrials.count() % 2 === 0;
}

// Type guard functions to check stimulus types
function isCircleStimulus(stim: Stimulus): stim is CircleStimulus {
    return stim.obj_type === 'circle';
}

function isLineStimulus(stim: Stimulus): stim is LineStimulus {
    return stim.obj_type === 'line';
}

function isWheelStimulus(stim: Stimulus): stim is WheelStimulus {
    return stim.obj_type === 'manual' && stim.category === 'customWheel';
  }  

// Main function to select stimuli based on the provided stimulus type
function selectStimuli(stimulusType: StimulusType): Stimulus[] {
    const trialType = jsPsych.timelineVariable('trialType');
    let recallOrder: 'ABBA' | 'random' | undefined;

    if (trialType !== 'pure') {
        recallOrder = jsPsych.timelineVariable('recallOrder');
    }

    // Fetch the relevant stimuli data based on trial type and recall order
    let stimuliData = getStimuliData(trialType, recallOrder, stimulusType);

    if (!stimuliData || stimuliData.length === 0) {
        throw new Error("No stimuli available.");
    }

    // Decide which selection logic to use based on the stimulus type
    if (stimulusType === 'colored_circle') {
        const circleStimuliData = stimuliData.filter(isCircleStimulus);
        return selectColoredCircleStimuli(circleStimuliData);
    } else if (stimulusType === 'oriented_circle') {
        return selectOrientedCircleStimuli(stimuliData);
    } else {
        throw new Error("Unknown stimulusType: " + stimulusType);
    }
}

// Helper function to get stimuli data based on trial type and recall order
function getStimuliData(
    trialType: 'pure' | 'mixed',
    recallOrder: 'ABBA' | 'random' | undefined,
    stimulusType: StimulusType
): Stimulus[] {
    let stimuliData: Stimulus[] = [];
    if (trialType === 'pure') {
        const previousTrial = fetchPreviousTrials(1)[0];
        stimuliData = isFirstTestScreen()
            ? cloneDeep(previousTrial.stimuliData)
            : stateManager.getFilteredData();
    } else if (trialType === 'mixed') {
        if (recallOrder === 'ABBA') {
            const indexOffset = isFirstTestScreen() ? 1 : 3;
            const previousTrial = fetchPreviousTrials(indexOffset)[0];
            stimuliData = cloneDeep(previousTrial.stimuliData);
        } else if (recallOrder === 'random') {
            const numTrials = isFirstTestScreen() ? 2 : 3;
            const recentTrials = fetchPreviousTrials(numTrials, stimulusType);
            const relevantTrial = recentTrials.find(trial => trial.stimulusType === stimulusType);
            stimuliData = relevantTrial ? cloneDeep(relevantTrial.stimuliData) : [];
        } else {
            throw new Error(`Unknown recall order: ${recallOrder}`);
        }
    } else {
        throw new Error(`Unknown trial type: ${trialType}`);
    }

    return stimuliData;
}

// Function to select stimuli for 'colored_circle' type
function selectColoredCircleStimuli(stimuliData: CircleStimulus[]): CircleStimulus[] {
    const randomIndex = Math.floor(Math.random() * stimuliData.length);
    const selectedCircle = stimuliData[randomIndex];

    // Store the selected stimulus
    stateManager.setCurrentStimulusToIdentify(cloneDeep(selectedCircle));

    // Modify the selectedCircle to be partially displayed
    const greyColor = 'hsl(0, 0%, 50%)';
    selectedCircle.line_color = greyColor;
    selectedCircle.fill_color = greyColor;

    // Remove the selected circle from stimuliData
    stimuliData.splice(randomIndex, 1);

    // Store the new shortened array in global state
    stateManager.setFilteredData(cloneDeep(stimuliData));

    return [selectedCircle];
}

// Function to select stimuli for 'oriented_circle' type
function selectOrientedCircleStimuli(stimuliData: Stimulus[]): [CircleStimulus, LineStimulus] {
    if (stimuliData.length % 2 !== 0) {
        throw new Error("Stimuli data length is not even. Cannot form circle-line pairs.");
    }

    const numPairs = stimuliData.length / 2;
    const randomPairIndex = Math.floor(Math.random() * numPairs);
    const index = randomPairIndex * 2;

    const selectedCircle = stimuliData[index];
    const selectedLine = stimuliData[index + 1];

    // Use type guards to ensure correct types
    if (!isCircleStimulus(selectedCircle)) {
        throw new Error('Expected selectedCircle to be a CircleStimulus');
    }

    if (!isLineStimulus(selectedLine)) {
        throw new Error('Expected selectedLine to be a LineStimulus');
    }

    // Now TypeScript knows selectedCircle and selectedLine types
    stateManager.setCurrentStimulusToIdentify(cloneDeep([selectedCircle, selectedLine]));

    // Remove both stimuli from stimuliData
    stimuliData.splice(index, 2);

    stateManager.setFilteredData(cloneDeep(stimuliData));

    // Hide the line by setting its color to white
    selectedLine.line_color = 'white';

    // Set a random line position so that an instantaneous click without moving the mouse 
    // does not result in a perfect match
    const randomAngle = Math.random() * 360;
    const angleRadians = randomAngle * (Math.PI / 180);
    const line_length = selectedCircle.radius;
    const lineX = selectedLine.x1;
    const lineY = selectedLine.y1;

    // Compute the new endpoint of the line using the random angle
    selectedLine.x2 = lineX + line_length * Math.cos(angleRadians);
    selectedLine.y2 = lineY + line_length * Math.sin(angleRadians);

    return [selectedCircle, selectedLine];
}

export const test_trial = {
    type: psychophysics,
    stimuli: function() {
        const trialType = jsPsych.timelineVariable('trialType');
        let stimulusType: StimulusType;

        if (trialType === 'pure') {
            stimulusType = jsPsych.timelineVariable('stimulusType');
        } else if (trialType === 'mixed') {
            const recallOrder = jsPsych.timelineVariable('recallOrder');
            const firstStimulusType = jsPsych.timelineVariable('firstStimulusType');
            const secondStimulusType = jsPsych.timelineVariable('secondStimulusType');

            if (recallOrder === 'ABBA') {
                stimulusType = isFirstTestScreen() ? secondStimulusType : firstStimulusType;
            } else if (recallOrder === 'random') {
                if (isFirstTestScreen()) {
                    stimulusType = Math.random() < 0.5 ? firstStimulusType : secondStimulusType;
                    stateManager.setSelectedStimulusTypeForRandomOrder(stimulusType);
                } else {
                    stimulusType = stateManager.getSelectedStimulusTypeForRandomOrder() === firstStimulusType
                        ? secondStimulusType
                        : firstStimulusType;
                }
            } else {
                throw new Error(`Unknown recall order: ${recallOrder}`);
            }
        } else {
            throw new Error(`Unknown trial type: ${trialType}`);
        }

        // Get the selected stimuli
        const selectedStimuli = selectStimuli(stimulusType);

        // Calculate the radius for the wheels, independent of stimulus type
        const circleStim = selectedStimuli.find(isCircleStimulus);
        if (!circleStim) {
            throw new Error("No circle stimulus found in selected stimuli");
        }
        const radius = circleStim.radius;
        const outerRadius = radius * 2.7;
        const innerRadius = outerRadius * 0.68;

        // Define the center coordinates of the wheel
        const centerX = circleStim.startX;
        const centerY = circleStim.startY;

        // We also need to calculate the random offset of the colored circle
        const offset = Math.floor(Math.random() * 360); // Random offset between 0 and 359

        if (stimulusType === 'colored_circle') {
            const colorWheel = createColorWheel(centerX, centerY, outerRadius, innerRadius, offset);
            return [colorWheel, circleStim];
        } else {
            const orientationWheel = createOrientationWheel(centerX, centerY, outerRadius, innerRadius);
            return [orientationWheel, ...selectedStimuli];
        }
    },
    data: function () {
        const practice = jsPsych.timelineVariable('practice')
        const trialType = jsPsych.timelineVariable('trialType')
        const numCircles = jsPsych.timelineVariable("numCircles")
        let recallOrder = null; // Declare recallOrder at a higher scope
        if (trialType === "mixed") {
            recallOrder = jsPsych.timelineVariable('recallOrder')
        }

        return {
          segmentID: segmentID,
          practiceTrialID: practiceTrialID,
          trialID: trialID,
          blockID: blockID,
          practice: practice,
          recallOrder: recallOrder,
          trialType: trialType,
          numCircles: numCircles,
        };
      },

    background_color: "#FFFFFF",
    response_type: "mouse",
    mouse_move_func: function(event) {
        const currentTrial = jsPsych.getCurrentTrial();
        const stim_array = currentTrial.stim_array as Stimulus[];

        if (stim_array.some(isLineStimulus)) {
            const oriented_line = stim_array.find(isLineStimulus);
            const static_circle = stim_array.find(isCircleStimulus);

            if (!oriented_line || !static_circle) {
                throw new Error("Expected both line and circle stimuli");
            }

            oriented_line.line_color = 'black';

            const line_length = static_circle.radius;
            const lineX = oriented_line.x1;
            const lineY = oriented_line.y1;

            const dx = event.offsetX - lineX;
            const dy = event.offsetY - lineY;

            const angleRadians = Math.atan2(dy, dx);

            oriented_line.x2 = lineX + line_length * Math.cos(angleRadians);
            oriented_line.y2 = lineY + line_length * Math.sin(angleRadians);

        } else {
            const colored_circle = stim_array.find(isCircleStimulus);
            const colorWheel = stim_array.find(isWheelStimulus);

            if (!colorWheel) {
              throw new Error("Expected a color wheel stimulus");
            } 

            const offset = colorWheel.offset;

            if (!colored_circle) {
                throw new Error("Expected a circle stimulus");
            }

            const circleX = colored_circle.startX;
            const circleY = colored_circle.startY;

            const dx = event.offsetX - circleX;
            const dy = event.offsetY - circleY;

            const angleRadians = Math.atan2(dy, dx);

            let angleDegrees = angleRadians * (180 / Math.PI);
            if (angleDegrees < 0) {
                angleDegrees += 360;
            }

            // Apply the offset and ensure it stays within 0–360 degrees
            angleDegrees = (angleDegrees + offset) % 360;

            const hue = angleDegrees;
            const color = `hsl(${hue}, 80%, 50%)`;

            colored_circle.fill_color = color;
            colored_circle.line_color = color;
        }
    },
    on_start: function(trial) {
        // Merge new fields into trial.data without overwriting existing ones
        Object.assign(trial.data, {
            stimulusToIdentify: stateManager.getCurrentStimulusToIdentify(),
            isTestTrial: true
        });
    },
    on_finish: function (data) {
        const stimuli_array = jsPsych.getCurrentTrial().stim_array as Stimulus[];

        // Filter out the wheel from the stimuli array
        const filteredStimuli = stimuli_array.filter(stim => stim.category !== 'customWheel');

        // Pick out the circle object from the array and check whether it's on the left or right side
        const circleObject = filteredStimuli.find(isCircleStimulus);
        if (circleObject) {
            const midpoint = screenWidth / 2;
            const side = circleObject.startX < midpoint ? 'left' : 'right';
            data.side = side;
        }

        // Map the stimuli onto the predefined stimuli types
        // Im no longer sure about the necessity of this step, but it's here for now
        const processedStimuli = filterAndMapStimuli(filteredStimuli);

        // Add the selected stimuli to the dataframe
        data.selectedStimuli = processedStimuli;

        // Add the stimulus type to the dataframe
        let stimulusType: StimulusType;

        if (processedStimuli.find(isLineStimulus)) {
            stimulusType = 'oriented_circle';
        } else {
            stimulusType = 'colored_circle';
        }
    
        data.stimulusType = stimulusType;

        // In this part of the code, when we calculate isFirstTestScreen() again, it actually returns false, even though it is the first test screen. 
        // This is why we reset the stateManager like this, even though it seems we are resetting it during the first test screen, when actually
        // it is the second test screen. None of the other functions are affected by this, not even post_trial_gap.

        if (isFirstTestScreen()) {
            data.recallPosition = 2;
        } else {
            data.recallPosition = 1;
        }

        if (isFirstTestScreen()) {
            stateManager.resetState();
        }
    },
    post_trial_gap: function() {
        return isFirstTestScreen() ? 100 : 1000;
    }
};
