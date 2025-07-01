/* displayStimuli.ts  – run-time stimulus generation (option B) */
import psychophysics from "@kurokida/jspsych-psychophysics";
import { generateStimuli, StimulusSpec, StimulusKind } from "../task-fun/placeStimuli";
import {
  createGrid,
  numColumns,
  numRows,
  cellSize
} from "../task-fun/createGrid";
import { Stimulus } from "../task-fun/defineStimuli";
import { start } from "repl";
import { fill } from "lodash";


function randomStimulusPair(): [StimulusKind, StimulusKind] {
  return Math.random() < 0.5
    ? ['colored_circle', 'oriented_circle']
    : ['oriented_circle', 'colored_circle'];
}

function stimulusKind(stim: Stimulus): StimulusKind {
  if (stim.obj_type === 'line') return 'oriented_circle';
  // circle stimulus
  return (stim as any).fill_color === 'transparent'
    ? 'oriented_circle'
    : 'colored_circle';
}

/* -------------------------------------------------------------------
   Factory that returns ONE psychophysics trial
--------------------------------------------------------------------*/
export function displayStimuliTest(
  trialID: number,
  blockID: number,
  practice: boolean,
  numCircles: 3 | 6,
  composition: 'homogeneous_color' | 'homogeneous_orientation' | 'mixed',
  layout: 'clustered' | 'interleaved',
  stimulusTypeShownFirst: StimulusKind,
  forcedFirstKind?: StimulusKind
): any /* jsPsych trial object */ {
  /* 1 ─ Declarative specification for this single screen ---------- */
  let specs: StimulusSpec[] = [];

  if (numCircles === 3) {
    /* three items always go on the left half-field */
    specs = [
      {
        count: 3,
        side: 'left',
        stimulusType:
          composition === 'homogeneous_orientation'
            ? 'oriented_circle'
            : 'colored_circle'
      }
    ];
  } else {
    /* six items (two columns of three) – always a “combined” display */
    if (composition !== 'mixed') {
      const stim =
        composition === 'homogeneous_orientation'
          ? 'oriented_circle'
          : 'colored_circle';
      specs = [
        { count: 3, side: 'left',  stimulusType: stim },
        { count: 3, side: 'right', stimulusType: stim }
      ];
    } else if (layout === 'clustered') {
      specs = [
        { count: 3, side: 'left',  stimulusType: stimulusTypeShownFirst },
        {
          count: 3,
          side: 'right',
          stimulusType:
            stimulusTypeShownFirst === 'colored_circle'
              ? 'oriented_circle'
              : 'colored_circle'
        }
      ];
    } else {
      /* mixed + interleaved */
      const [typeA, typeB] = randomStimulusPair();
      specs = [
        { count: 2, side: 'left',  stimulusType: typeA },
        { count: 1, side: 'left',  stimulusType: typeB },
        { count: 1, side: 'right', stimulusType: typeA },
        { count: 2, side: 'right', stimulusType: typeB }
      ];
    }
  };

  /* 2 ─ Build the trial; the heavy lifting happens in on_start ----- */


  const quickTestCircle = {
    obj_type: 'circle',
    startX: 100,
    startY: 100,
    radius: 50,
    fill_color: 'black'
  };

  return {
    type    : psychophysics,
    stimuli : () => [{
      obj_type        : "circle",
      startX          : 100,
      startY          : 100,
      radius          : 50,
      fill_color      : "black"
    }],
    choices         : "NO_KEYS",
    background_color: "#FFFFFF",
    trial_duration  : 1000
     };
}
