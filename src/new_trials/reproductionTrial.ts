/**********************************************************************
 *  featureRecall.ts                                                  *
 *  Probe the two items tagged `tested_first` / `tested_second`.      *
 *  • Orientation probe → line + orientation wheel.                   *
 *  • Colour probe      → coloured disc + colour wheel.               *
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
} from "../task-fun/createStimuli";
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
  return createOrientationWheel(startX, startY, radius * 1.2, radius * 0.6);
}

/**
 * Generate the screen where the stimuli features have to be recalled (colour or orientation).  
 *
 * @param trialID                   - Trial number 
 * @param blockID                   - Block number to distinguish different segments of the experiment
 * @param practice                  - A boolean indicating whether this is a practice trial or not
 * @param numCircles                - The number of circles to be displayed, either 3 or 6
 * @param grouping                  - Temporal presentation mode: "combined" (all at once) or "split" (3-then-3).
 * @param composition               - Set composition: "homogeneous" (all colour or all orientation) or "mixed".
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
  composition: "homogeneous_colour" | "homogeneous_orientation" | "mixed",
  layout: "clustered" | "interleaved",
  stimulusTypeShownFirst: StimulusKind,
  forcedFirstKind?: StimulusKind            
): any[] {
  /* 1 ── Fetch the sample-phase stimuli for this logical trial ───── */
  const sampleRows = jsPsych.data.get().filter({
    trialID,
    blockID,
    practice,
    trialSegment: "displayStimuli",
  });

  const allStimuli: Stimulus[] = sampleRows
    .values()
    .flatMap((row: any) => row.stimuliData);

  const firstItem = allStimuli.filter(
    (s) => s.test_status === "tested_first"
  );
  const secondItem = allStimuli.filter(
    (s) => s.test_status === "tested_second"
  );

  const probeSequence: Stimulus[][] = [firstItem, secondItem];

  /* 2 ── Build one jsPsych–psychophysics trial per probe ─────────── */
  const recallTrials = probeSequence.map((logicalItem, idx) => {
    const isOrientation = logicalItem.some(isLineStimulus);

    /* 2a. anchor circle (needed for either wheel variant) */
    const anchorCircle = (
      isOrientation
        ? logicalItem.find(
            (s) => isCircleStimulus(s) && (s as CircleStimulus).fill_color === "transparent"
          )
        : logicalItem.find(isCircleStimulus)
    ) as CircleStimulus | undefined;

    if (!anchorCircle) {
      throw new Error("Could not locate anchor circle for wheel creation.");
    }

    /* 2b. add the appropriate wheel */
    const wheelStim: WheelStimulus = isOrientation
      ? makeOrientationWheelForProbe(anchorCircle)
      : makeColorWheelForProbe(anchorCircle);

    const stimuliForTrial: DisplayStimulus[] = [...logicalItem, wheelStim];

    /* 2c. cache references once per trial (fast mouse handler) */
    let orientedLine: LineStimulus | undefined;
    let colouredCircle: CircleStimulus | undefined;
    const colourWheel = wheelStim; // always present

    const on_start = () => {
      if (isOrientation) {
        orientedLine = logicalItem.find(isLineStimulus) as LineStimulus;
      } else {
        colouredCircle = anchorCircle;
      }
    };

    /* 2d. mouse-drag handler */
    const mouse_move_func = (ev: MouseEvent) => {
      const { offsetX, offsetY } = ev;

      if (isOrientation && orientedLine) {
        /* rotate the line */
        const cx = orientedLine.x1;
        const cy = orientedLine.y1;
        const R = anchorCircle.radius;
        const angle = Math.atan2(offsetY - cy, offsetX - cx);
        orientedLine.x2 = cx + R * Math.cos(angle);
        orientedLine.y2 = cy + R * Math.sin(angle);
      } else if (colouredCircle) {
        /* recolour the disc */
        const cx = colouredCircle.startX;
        const cy = colouredCircle.startY;
        let deg = (Math.atan2(offsetY - cy, offsetX - cx) * 180) / Math.PI;
        if (deg < 0) deg += 360;
        deg = (deg + colourWheel.offset) % 360;

        const hsl = `hsl(${deg}, 80%, 50%)`;
        colouredCircle.fill_color = hsl;
        colouredCircle.line_color = hsl;
      }
    };

    /* 2e. return the jsPsych trial object */
    return {
      type: psychophysics,
      stimuli: filterAndMapStimuli(stimuliForTrial as unknown as Stimulus[]),
      background_color: "#FFFFFF",
      response_type: "mouse",
      post_trial_gap: idx === 0 ? 100 : 1000,
      on_start,
      mouse_move_func,

      data: {
        trialID,
        blockID,
        practice,
        numCircles,
        grouping,
        composition,
        layout,
        probeIndex: idx + 1,       // 1 → tested_first, 2 → tested_second
        trialSegment: "featureRecall",
        stimulusTypeShownFirst,      
        forcedFirstKind,                  // if defined, this is the stimulus that must be probed first
    },
    };
  });

  return recallTrials;
}
