/**********************************************************************
 *  featureRecall.ts                                                  *
 *  Probe the two items tagged `tested_first` / `tested_second`.      *
 *  • Orientation probe → line + orientation wheel.                   *
 *  • color probe      → colored disc + color wheel.               *
 *********************************************************************/

import { jsPsych } from "../jsp";
import psychophysics from "@kurokida/jspsych-psychophysics";
import { filterAndMapStimuli } from "../task-fun/filterStimuli";
import {
  createColorWheel,
  createOrientationWheel,
} from "../task-fun/createWheels";

import {
  Stimulus,
  LineStimulus,
  CircleStimulus,
  WheelStimulus,
} from "../task-fun/defineStimuli";
import { StimulusKind } from "../task-fun/placeStimuli";

// Type helpers
type DisplayStimulus = LineStimulus | CircleStimulus | WheelStimulus;

/* ------------------------------------------------------------------ */
/*  Type guards                                                        */
/* ------------------------------------------------------------------ */
function isCircleStimulus(stim: Stimulus): stim is CircleStimulus {
  return stim.obj_type === "circle";
}
function isLineStimulus(stim: Stimulus): stim is LineStimulus {
  return stim.obj_type === "line";
}

/* ------------------------------------------------------------------ */
/*  Wheel helpers                                                      */
/* ------------------------------------------------------------------ */
function makeColorWheelForProbe(circle: CircleStimulus): WheelStimulus {
  const { startX, startY, radius } = circle;
  const offset = Math.floor(Math.random() * 360);
  return createColorWheel(startX, startY, radius * 1.2, radius * 0.6, offset);
}
function makeOrientationWheelForProbe(circle: CircleStimulus): WheelStimulus {
  const { startX, startY, radius } = circle;
  return createOrientationWheel(startX, startY, radius * 1.2, radius * 0.6, 0);
}

/**
 * Generate the screen where the stimuli features have to be recalled (color or orientation).  
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
export function featureRecall(
    trialID: number,
    blockID: number,
    practice: boolean,
    numCircles: 3 | 6,
    grouping: "combined" | "split",
    composition: "homogeneous_color" | "homogeneous_orientation" | "mixed",
    layout: "clustered" | "interleaved",
    stimulusTypeShownFirst: StimulusKind,
    forcedFirstKind?: StimulusKind
  ): any[] {
  
    /* helper that builds ONE recall screen -------------------------- */
    const makeRecallTrial = (probeIndex: 1 | 2) => {
      /* variables shared with mouse handler ------------------------- */
      let orientedLine: LineStimulus | undefined;
      let coloredCircle: CircleStimulus | undefined;
      let colorWheel: WheelStimulus | undefined;
      let anchorCircle: CircleStimulus;
  
      return {
        type: psychophysics,
        stimuli: [],                      // will be filled in on_start
        background_color: "#FFFFFF",
        response_type: "mouse",
        post_trial_gap: probeIndex === 1 ? 100 : 1000,
  
        /* --------------------------- on-start ---------------------- */
        on_start(trial) {
          /* 1. fetch sample-phase stimuli for THIS logical trial ---- */
          const sampleRows = jsPsych.data.get().filter({
            trialID,
            blockID,
            practice,
            trialSegment: "displayStimuli",
          });
          const allStimuli: Stimulus[] = sampleRows
            .values()
            .flatMap((r: any) => r.stimuliData);
  
          const logicalItem = allStimuli.filter(
            (s) =>
              s.test_status ===
              (probeIndex === 1 ? "tested_first" : "tested_second")
          );
  
          /* 2. build wheel & final stimulus list -------------------- */
          const isOrientation = logicalItem.some(isLineStimulus);
  
          anchorCircle = (isOrientation
            ? logicalItem.find(
                (s) =>
                  isCircleStimulus(s) &&
                  (s as CircleStimulus).fill_color === "transparent"
              ) ?? logicalItem.find(isCircleStimulus)
            : logicalItem.find(isCircleStimulus)) as CircleStimulus;
  
          if (!anchorCircle)
            throw new Error("Could not locate anchor circle for wheel creation.");
  
          const wheelStim = isOrientation
            ? makeOrientationWheelForProbe(anchorCircle)
            : makeColorWheelForProbe(anchorCircle);
  
          /* cache references for mouse handler ---------------------- */
          if (isOrientation) {
            orientedLine = logicalItem.find(isLineStimulus) as LineStimulus;
          } else {
            coloredCircle = anchorCircle;
            colorWheel = wheelStim;
          }
  
          trial.stimuli = filterAndMapStimuli(
            [...logicalItem, wheelStim] as unknown as Stimulus[]
          );
        },
  
        /* ---------------------- mouse handler ---------------------- */
        mouse_move_func(ev: MouseEvent) {
          const { offsetX, offsetY } = ev;
  
          if (orientedLine) {
            /* rotate the line */
            const cx = orientedLine.x1;
            const cy = orientedLine.y1;
            const R = anchorCircle.radius;
            const angle = Math.atan2(offsetY - cy, offsetX - cx);
            orientedLine.x2 = cx + R * Math.cos(angle);
            orientedLine.y2 = cy + R * Math.sin(angle);
          } else if (coloredCircle && colorWheel) {
            /* recolor the disc */
            const cx = coloredCircle.startX;
            const cy = coloredCircle.startY;
            let deg = (Math.atan2(offsetY - cy, offsetX - cx) * 180) / Math.PI;
            if (deg < 0) deg += 360;
            deg = (deg + colorWheel.offset) % 360;
  
            const hsl = `hsl(${deg}, 80%, 50%)`;
            coloredCircle.fill_color = hsl;
            coloredCircle.line_color = hsl;
          }
        },
  
        /* -------------------------- bookkeeping -------------------- */
        data: {
          trialID,
          blockID,
          practice,
          numCircles,
          grouping,
          composition,
          layout,
          probeIndex,
          trialSegment: "featureRecall",
          stimulusTypeShownFirst,
          forcedFirstKind,
        },
      };
    };
  
    /* return the two probes ---------------------------------------- */
    return [makeRecallTrial(1), makeRecallTrial(2)];
  }
  