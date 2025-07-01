/**
 * @title DualSet Interference Exp1
 * @description Inspecting the impact of a random vs an ABBA testing sequence on dual-set interference in WM
 * @author Noah Rischert, Chenyu Li and Hannah (Dames) Tschannen
 * @version 0.3.2
 *
 *
 * @assets assets/
 */

// import stylesheets (.scss or .css).
import "../styles/main.scss";

// jsPsych official plugin
import preload from "@jspsych/plugin-preload";

// Global variables
import { jsPsych } from "./jsp";

// screens
import { welcome_screen } from "./instructions/welcome";
import { consent_screen, notice_screen } from "./instructions/consent";
import { browser_screen } from "./instructions/browserCheck";
import { fullMode_screen, closeFullScreen } from "./instructions/fullScreen";
import { initializeAndAssignSubjectID } from "./task-fun/participantID";
import { survey_screen } from "./ending/questionnaire";
import { debrief_screen } from "./ending/debriefing";
import { instructionSlidesConfig } from "./instructions/InstrStart";
import jsPsychCallFunction from '@jspsych/plugin-call-function';
import { buildExperimentNode } from "./trials/runExperiment";
import psychophysics from "@kurokida/jspsych-psychophysics";
import { Stimulus, CircleStimulus, LineStimulus, WheelStimulus } from "./task-fun/defineStimuli";
import { createColorWheel, createOrientationWheel } from "./task-fun/createWheels";
import { generateStimuli, StimulusSpec } from "./task-fun/placeStimuli";
import { GridCell, createGrid, numColumns, numRows, cellSize } from "./task-fun/createGrid";
import { displayStimuli } from "./trials/displayStimuli";

/**
 * This function will be executed by jsPsych Builder and is expected to run the jsPsych experiment
 *
 * @type {import("jspsych-builder").RunFunction}
 */
export async function run({
  assetPaths,
  input = {},
  environment,
  title,
  version,
}) {
  // Initialize a timeline to hold the trials
  var timeline: any[] = [];

  // Preload assets
  const preloadSlides = {
    type: preload,
    max_load_time: 1000,
    images: [
      "assets/instructionImages/Slide1.gif",
      "assets/instructionImages/Slide2.gif",
      "assets/instructionImages/Slide3.gif",
      "assets/instructionImages/Slide4.gif",
      "assets/instructionImages/Slide5.gif",
      "assets/instructionImages/Slide6.gif"
    ]
  };


  const quickTestLine: Stimulus = {
    category   : 'predefined',
    obj_type   : 'line',
    x1         : 200,
    y1         : 200,
    x2         : 300,
    y2         : 200,
    side       : 'left',
    test_status: 'not_tested',
    line_color : 'black',
    line_width : 3,
  };
  
  const quickTestCircle: Stimulus = {
    category   : 'predefined',
    obj_type   : 'circle',
    startX     : 200,
    startY     : 200,
    side       : 'left',
    test_status: 'not_tested',
    radius     : 40,
    line_color : 'black',
    fill_color : 'black',
    line_width : 3
  };
  

  const testColorWheel: WheelStimulus =
     createColorWheel(200, 200, 100, 50, 0);
  
  const testOrientationWheel: WheelStimulus =
    createOrientationWheel(100, 200, 100, 50, 0);

  const lineTrial = {
    type    : psychophysics,
    stimuli : [quickTestLine],
    choices : "NO_KEYS",
    trial_duration: 1000,
    background_color: "#ffffff"
  };
  
  const circleTrial = {
    type    : psychophysics,
    stimuli : [quickTestCircle],
    choices : "NO_KEYS",
    trial_duration: 1000,
    background_color: "#ffffff"
  };

  const combinedStimuli = {
    type: psychophysics,
    stimuli: [quickTestCircle, quickTestLine], 
    choices: "NO_KEYS",
    trial_duration: 1000,
    background_color: "#ffffff"
  };

  const colorWheelTrial = {
    type: psychophysics,
    stimuli: [testColorWheel],
    choices: "NO_KEYS",
    trial_duration: 1000,
    background_color: "#ffffff",
  };

  const orientationWheelTrial = {
    type: psychophysics,
    stimuli: [testOrientationWheel],
    choices: "NO_KEYS",
    trial_duration: 1000,
    background_color: "#ffffff",
  };

  const grid: GridCell [] = createGrid(numColumns, numRows);     // fresh grid
  
  const SpecsOrientedCircle: StimulusSpec [] = [
    { count: 3, side: "left", stimulusType: "oriented_circle" }];
  
  
  const multipleOrientedCircles =
    generateStimuli(grid, SpecsOrientedCircle, cellSize.cellWidth, cellSize.cellHeight);
  
  const multipleOrientedCirclesTrial = {
    type: psychophysics,
    stimuli: [...multipleOrientedCircles],
    choices: "NO_KEYS",
    trial_duration: 1000,
    background_color: "#ffffff",
  };

  const SpecsColoredCircle: StimulusSpec [] = [
    { count: 3, side: "right", stimulusType: "colored_circle" }];

  const MultipleColoredCircles =
    generateStimuli(grid, SpecsColoredCircle, cellSize.cellWidth, cellSize.cellHeight);

  const multipleColoredCirclesTrial = {
    type: psychophysics,
    stimuli: [...MultipleColoredCircles],
    choices: "NO_KEYS",
    trial_duration: 1000,
    background_color: "#ffffff",
  };

  const combinedStimuliTrial = {
    type: psychophysics,
    stimuli: [...multipleOrientedCircles, ...MultipleColoredCircles, testColorWheel, testOrientationWheel],
    choices: "NO_KEYS",
    trial_duration: 1000,
    background_color: "#ffffff",
  }

  const fullTrialStimuli = 
  displayStimuli(1, 1, true, 6, "combined", "homogeneous_orientation", "clustered", "colored_circle", "colored_circle");

  // const fullTrial = {
  //   type: psychophysics,
  //   stimuli: [fullTrialStimuli],
  //   choices: "NO_KEYS",
  //   trial_duration: 1000,
  //   background_color: "#ffffff",
  // }; 

  /* pre-task screens */
  timeline.push(
    // fullMode_screen,
    // preloadSlides,
    // welcome_screen,
    // consent_screen,
    // notice_screen,
    browser_screen,
    instructionSlidesConfig,          // <- last screen before the task
    lineTrial,
    circleTrial,
    combinedStimuli, // <- quick test trials
    colorWheelTrial,
    orientationWheelTrial, // <- quick test wheels
    multipleOrientedCirclesTrial, // <- multiple oriented circles
    multipleColoredCirclesTrial, // <- multiple colored circles
    combinedStimuliTrial,
    fullTrialStimuli[0], 
  );

  timeline.push({
    type: jsPsychCallFunction,
    async: true,                         // ← tell jsPsych to wait
    func: async (done) => {              // ← done = resume button
      const participantID = await initializeAndAssignSubjectID();
      jsPsych.data.addProperties({ subject: participantID });
  
      const expNode = buildExperimentNode(participantID);
  
      jsPsych.addNodeToEndOfTimeline({
        timeline: [
          expNode,                       // task
          survey_screen,                 // post-task screens
          debrief_screen,
          closeFullScreen,
        ],
      });
  
      done();                            // ← now jsPsych may continue
    },
  });
  
  await jsPsych.run(timeline);
}
