/**
 * This file contains the settings for the experiment.
 */



// Task functions
import { setCSS } from "./task-fun/setCSS";


setCSS();

export const SETTINGS = {
  chroma: 0.1,            // Color saturation for stimuli (passed to colorconversion as 'c').
  lightness: 0.7,         // Perceptual lightness for stimuli (passed as 'l').

  assumedHz: 60,          // Display refresh rate used to convert seconds ↔ frames.
                          // If you measure a participant's actual Hz, override this.

  fixationSec: 0.5,       // Duration of fixation BEFORE/AROUND the sample+mask, in seconds.
  maskSec: 0.05,          // Duration of the post-sample mask, in seconds.

  width: 250,             // Width  of each stimulus rectangle (px).
  height: 250,            // Height of each stimulus rectangle (px).

  wheelOuterRadius: 300,  // Outer radius of the color wheel used at recall (px).
  wheelInnerRadius: 200,  // Inner radius (defines ring thickness and inner hole).

  ITIdurationMs: 2000,    // Inter-trial interval (ms) with fixation only.

  tile: 4,                // Mask tile size (px). Smaller → higher spatial frequency noise.
  triangleRadius: 225,    // Distance from display center to each of the 3 square centers (px).

  startX: 0,              // Display center X in plugin coordinates (0,0 ≈ canvas center when origin_center=true).
  startY: 0,              // Display center Y.

  degSteps: [0, 5, 10, 15] as const, // Allowed per-frame hue drift steps (deg/frame).
                                     // 0 is typical for calibration (no drift); >0 adds motion/difficulty.
} as const;

// DERIVED: timing in frames computed from SETTINGS.
export const DERIVED = {
  fixationFrames: Math.ceil(SETTINGS.assumedHz * SETTINGS.fixationSec), // frames of fixation
  maskFrames:     Math.ceil(SETTINGS.assumedHz * SETTINGS.maskSec),     // frames of mask
} as const;




export const expInfo = {
  // settings for the experiment
  TITLE: "Parallel.Vs.Serial.Encoding.pilot",
  LANG: "en", // the default language of the experiment

  SETTINGS,
  DERIVED,

  // when using Prolific, you can set customized completion codes for different situations
  // e.g., when participants complete the experiment, or when they fail the attention check
  // you can set them here and use them in the end of the experiment (jsp.ts)
  CODES: {
    SUCCESS: "C17L614H", // the code for a successfully completion of the experiment
    OFFLINE: "CT6UZCBB", // the code for the offline situation
    FAILED_ATTENTION: "C16PVDBW", // the code for the failed experiment
    FAILED_OTHERS: "C10CL4CD", // the code for other failed situations (e.g., failed to resize the window)
    // You can specify the codes for different situations here.
  },

  /** The key is case-sensitive and position-sensitive.
   * It is recommended to allow both upper and lower case keys.
   * You can use the `convertCase` function to prevent the issue.
   * Be cautious, the names of the number keys on the top of the keyboard
   * are different from those on the right side of the keyboard.
   */
  KEYS: {
    CONTINUE: ["enter"],
    START_TRIAL: [" "],
  },

  // If you want to use the keyCode rather than key name,
  // you can go to the following link to get the key code:
  // https://www.toptal.com/developers/keycode/

  // Running environment variables
  RUN_JATOS: false, // a switch to run the experiment on JATOS
};

// Global variables for the system. Normally, you don't need to change them.
export const varSystem = {
  TRACK: false, // a switch to track participants' interactions with the browser
  nBLUR: 0, // use to count how many times participants left the browser
  MAX_BLUR: 3, // the maximum number of times participants can leave the browser
  LOOP: true, // a switch to control whether participants need to read the instruction and practice again
  RUN_TIMER: false, // a switch to control the countdown timer
  STATUS: "success", // the status of the experiment
};
