/**********************************************************************
 *  featureRecall.ts                                                  *
 *  Probe the two items tagged `tested_first` / `tested_second`.      *
 *********************************************************************/

import psychophysics                       from "@kurokida/jspsych-psychophysics";
import { jsPsych }                         from "../jsp";
import { createColorWheel}                 from "../task-fun/createWheels";
import { colorconversion }                 from "../task-fun/colorConversion";


export const screenWidth = window.screen.width; // Width of the user's screen
export const screenHeight = window.screen.height; // Height of the user's screen
export const centerX = screenWidth / 2;
export const centerY = screenHeight / 2;

const signedDiff360 = (a: number, b: number) => (((a - b + 540) % 360) - 180);

// Factory
export function featureRecall(
  trialID: number,
  blockID: number,
  practice: boolean,
  startX: number,
  startY: number,
  width: number,
  height: number,
  wheelOuterRadius: number,
  wheelInnerRadius: number,
  initHue: number,
  L = 1, 
  C = 0,
): any[] {

  const wheelOffset = Math.random() * 360;

  const wheel = createColorWheel(centerX, centerY, wheelOuterRadius, wheelInnerRadius, wheelOffset);

  let selectedHue: number;

  const patch = {
    obj_type: "rect",
    centerX,
    centerY,
    origin_center: false,
    width: width,
    height: height,
    line_color: colorconversion({ l: L, c: C, h: 0 }),
    fill_color: colorconversion({ l: L, c: C, h: 0 }),
  };

  const trial: any = {
    type: psychophysics,
    response_type: "mouse",
    stimuli: [wheel, patch],

    mouse_move_func(ev: MouseEvent) {
          
      const t:any = jsPsych.getCurrentTrial();
      const live = t.stim_array as any[];

      const liveWheel = live.find(s => s.category === "customWheel");
      const livePatch = live.find(s => s.obj_type === "rect");
      if (!liveWheel || !livePatch) return;

      const cx = liveWheel.currentX ?? liveWheel.startX;
      const cy = liveWheel.currentY ?? liveWheel.startY;

      const dx = ev.offsetX - cx;
      const dy = ev.offsetY - cy;

      // angle in [0, 360)
      let deg = Math.atan2(dy, dx) * 180 / Math.PI;
      if (deg < 0) deg += 360;

      // remove wheel offset so 0° is canonical wheel 0°
      const hue = (deg - wheelOffset + 360) % 360;
      selectedHue = hue;

      const col = colorconversion({ l: 0.6, c: 0.1, h: hue });
      livePatch.fill_color = col;
      livePatch.line_color = col;
    },

    on_finish: (data: any) => {
      data.trialID              = trialID;
      data.blockID              = blockID;
      data.practice             = practice;
      data.trialSegment         = "featureRecall";

      data.wheelOffset_deg      = wheelOffset;
      data.target_color_deg     = initHue;
      data.selected_color_deg   = selectedHue;
      data.signed_error_deg     = signedDiff360(selectedHue, initHue);
    },
  };
  return [trial];
}