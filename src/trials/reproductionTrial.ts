/**********************************************************************
 *  featureRecall.ts                                                  *
 *  Probe the two items tagged `tested_first` / `tested_second`.      *
 *********************************************************************/

import psychophysics                       from "@kurokida/jspsych-psychophysics";
import { jsPsych }                         from "../jsp";
import { createColorWheel}                 from "../task-fun/createWheels";
import { colorconversion }                 from "../task-fun/colorConversion";
import type { Vertex } from "../task-fun/triangleHelpers"

const signedDiff360 = (a: number, b: number) => (((a - b + 540) % 360) - 180);

// Factory
export function featureRecall(
  trialID: number,
  blockID: number,
  practice: boolean,
  calibrationTrial: boolean,
  width: number,
  height: number,
  wheelOuterRadius: number,
  wheelInnerRadius: number,
  rotation: "cw" | "ccw",
  deg_per_frame: number,
  stimuliFrameCount: number,
  trialDuration: number,
  assumedHz: number,
  chroma: number,
  lightness: number,
  verts: ReadonlyArray<Vertex>,
  coloredIdx: ReadonlySet<number>,
  nColoredSquares: number,
  hueStarts: ReadonlyArray<number>,       
  targetIdx: number,                      

): any[] {

  const wheelOffset = Math.random() * 360;
  const dir = rotation === "ccw" ? -1 : 1;

  // Probe location = chosen square's center
  const { x: cx, y: cy } = verts[targetIdx];

  // The color that has to be recalled
  const initHue   = hueStarts[targetIdx];

  let selectedHue: number;

  const patch = {
    obj_type: "rect",
    startX: cx,
    startY: cy,
    origin_center: true,
    width,
    height,
    line_color: colorconversion({ l: 1, c: 0, h: 0 }),
    fill_color: colorconversion({ l: 1, c: 0, h: 0 }),
  };

  const wheel = createColorWheel(cx, cy, wheelOuterRadius, wheelInnerRadius, wheelOffset, lightness, chroma);

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

      const cx = livePatch.currentX ?? livePatch.startX;
      const cy = livePatch.currentY ?? livePatch.startY;

      const dx = ev.offsetX - cx;
      const dy = ev.offsetY - cy;

      // angle in [0, 360)
      let deg = Math.atan2(dy, dx) * 180 / Math.PI;
      if (deg < 0) deg += 360;

      // add wheel offset 
      const hue = (deg + wheelOffset + 360) % 360;
      selectedHue = hue;

      const col = colorconversion({ l: lightness, c: chroma, h: hue });
      livePatch.fill_color = col;
      livePatch.line_color = col;
    },

    on_finish: (data: any) => {
      data.trialID              = trialID;
      data.blockID              = blockID;
      data.practice             = practice;
      data.calibrationTrial     = calibrationTrial;
      data.trialSegment         = "featureRecall";
      data.trialDuration        = trialDuration;
      data.coloredIdx           = Array.from(coloredIdx);
      data.wheelOffset_deg      = wheelOffset;
      data.target_index         = targetIdx;
      data.target_vertex_x      = cx;
      data.target_vertex_y      = cy;
      data.target_color_deg     = initHue;
      data.selected_color_deg   = selectedHue;
      data.signed_error_deg     = signedDiff360(selectedHue, initHue);
      data.err_deg_aligned      = dir * data.signed_error_deg;        
      data.abs_error_deg        = Math.abs(data.signed_error_deg);
      data.deg_per_frame        = deg_per_frame;
      data.stimuliFrameCount    = stimuliFrameCount;
      data.stimuliMsCount       = Math.round((stimuliFrameCount / assumedHz) * 1000)
      data.total_drift_deg      = dir * (stimuliFrameCount - 1) * deg_per_frame;
      data.rotation             = rotation;
      data.nColoredSquares      = nColoredSquares;
    },
  };
  return [trial];
}