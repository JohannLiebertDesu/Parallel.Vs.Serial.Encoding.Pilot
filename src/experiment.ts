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


  /* pre-task screens */
  timeline.push(
    // fullMode_screen,
    // preloadSlides,
    // welcome_screen,
    // consent_screen,
    // notice_screen,
    browser_screen,
    instructionSlidesConfig          // <- last screen before the task
  );

  /* call-function that assigns the ID *after* instructions */
  timeline.push({
    type: jsPsychCallFunction,
    async func() {
      const participantID = await initializeAndAssignSubjectID();   // now safe
      jsPsych.data.addProperties({ subject: participantID });

      /* build the real experiment timeline and append it */
      const expNode = buildExperimentNode(participantID);
      jsPsych.addNodeToEndOfTimeline(expNode);      // <- key line
    },
  });

  /* post-task questionnaires */
  timeline.push(survey_screen, debrief_screen, closeFullScreen);

  await jsPsych.run(timeline);
}
