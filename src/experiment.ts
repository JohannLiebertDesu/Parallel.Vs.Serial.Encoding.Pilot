/**
 * @title Parallel Vs Serial Encoding Pilot
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
import { buildBlock } from "./trials/fullTrial"
import { seedCalibrationBlock } from "./trials/fullCalibrationTrial";
import psychophysics from "@kurokida/jspsych-psychophysics";
import {block1, block2 } from "./trials/runExperiment"


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


timeline.push(fullMode_screen)

// seedCalibrationBlock(timeline, block1, {
//   maxTrials: 100,
//   startMs: 80,
//   errTolDeg: 30,
//   upStep: 4,
//   downStep: 1,
//   minMs: 5,
//   maxMs: 200,
// });

buildBlock(timeline, block2);  




  // // Preload assets
  // const preloadSlides = {
  //   type: preload,
  //   max_load_time: 1000,
  //   images: [
  //     "assets/instructionImages/Slide1.gif",
  //     "assets/instructionImages/Slide2.gif",
  //     "assets/instructionImages/Slide3.gif",
  //     "assets/instructionImages/Slide4.gif",
  //     "assets/instructionImages/Slide5.gif",
  //     "assets/instructionImages/Slide6.gif"
  //   ]
  // };

  /* pre-task screens */
  // timeline.push(
  //   welcome_screen,
  //   consent_screen,
  //   notice_screen,
  //   fullMode_screen,
  //   browser_screen,
  //   instructionSlidesConfig,      
  // );

  // timeline.push({
  //   type: jsPsychCallFunction,
  //   async: true,                         // ← tell jsPsych to wait
  //   func: async (done) => {              // ← done = resume button
  //     const participantID = await initializeAndAssignSubjectID();
  //     jsPsych.data.addProperties({ subject: participantID });
  
  //     const expNode = buildExperimentNode(participantID);
  
  //     jsPsych.addNodeToEndOfTimeline({
  //       timeline: [
  //         expNode,                       // task
  //         survey_screen,                 // post-task screens
  //         debrief_screen,
  //         closeFullScreen,
  //       ],
  //     });
  
  //     done();                            // ← now jsPsych may continue
  //   },
  // });
  
  await jsPsych.run(timeline);
}