/**********************************************************************
 *  reproductionTrial.ts — feature recall (lean, object-style API)
 *********************************************************************/

import psychophysics from "@kurokida/jspsych-psychophysics";
import { jsPsych }   from "../jsp";
import { createColorWheel }  from "../task-fun/createWheels";
import { colorconversion }   from "../task-fun/colorConversion";
import type { BlockConfig, TrialSpec } from "../task-fun/configurations";

const signedDiff360 = (a: number, b: number) => (((a - b + 540) % 360) - 180);

type Args = {
  trialID: number;
  cfg: BlockConfig;
  spec: TrialSpec;
  stimuliFrameCount: number;
};

/** Single entry: build recall trial from cfg + spec + frames */
export function featureRecall({ trialID, cfg, spec, stimuliFrameCount }: Args): any[] {
  const totalFrameCount = stimuliFrameCount + cfg.maskFrameCount + cfg.fixationFrameCount;
  const trialDuration   = Math.ceil((totalFrameCount / cfg.assumedHz) * 1000);

  const wheelOffset = Math.random() * 360;
  const dir = spec.rotation === "ccw" ? -1 : 1;

  // Probe at the chosen target square
  const { x: cx, y: cy } = spec.verts[spec.targetIdx];
  const initHue = spec.hueStarts[spec.targetIdx];

  let selectedHue: number | undefined;

  const patch = {
    obj_type: "rect",
    startX: cx, startY: cy, origin_center: true,
    width: cfg.width, height: cfg.height,
    line_color: colorconversion({ l: 1, c: 0, h: 0 }),
    fill_color: colorconversion({ l: 1, c: 0, h: 0 }),
  };

  const wheel = createColorWheel(
    cx, cy, cfg.wheelOuterRadius, cfg.wheelInnerRadius,
    wheelOffset, cfg.lightness, cfg.chroma
  );

  const trial: any = {
    type: psychophysics,
    response_type: "mouse",
    stimuli: [wheel, patch],

    mouse_move_func(ev: MouseEvent) {
      const t: any = jsPsych.getCurrentTrial();
      const live = t.stim_array as any[];

      const liveWheel = live.find(s => s.category === "customWheel");
      const livePatch = live.find(s => s.obj_type === "rect");
      if (!liveWheel || !livePatch) return;

      const cxp = livePatch.currentX ?? livePatch.startX;
      const cyp = livePatch.currentY ?? livePatch.startY;

      const dx = ev.offsetX - cxp;
      const dy = ev.offsetY - cyp;

      // angle in [0, 360)
      let deg = Math.atan2(dy, dx) * 180 / Math.PI;
      if (deg < 0) deg += 360;

      const hue = (deg + wheelOffset + 360) % 360;
      selectedHue = hue;

      const col = colorconversion({ l: cfg.lightness, c: cfg.chroma, h: hue });
      livePatch.fill_color = col;
      livePatch.line_color = col;
    },

    on_finish: (data: any) => {
      const chosenHue = selectedHue ?? initHue; // safe fallback

      data.trialSegment         = "featureRecall";
      data.trialID              = trialID;
      data.blockID              = cfg.blockID;
      data.practice             = cfg.practice;
      data.calibrationTrial     = cfg.calibrationTrial;

      data.wheelOffset_deg      = wheelOffset;
      data.target_index         = spec.targetIdx;
      data.target_vertex_x      = cx;
      data.target_vertex_y      = cy;

      data.target_color_deg     = initHue;
      data.selected_color_deg   = chosenHue;

      data.signed_error_deg     = signedDiff360(chosenHue, initHue);
      data.err_deg_aligned      = dir * data.signed_error_deg;
      data.abs_error_deg        = Math.abs(data.signed_error_deg);

      data.rotation             = spec.rotation;
      data.deg_per_frame        = cfg.deg_per_frame;
      data.stimuliFrameCount    = stimuliFrameCount;
      data.stimuliMsCount       = Math.round((stimuliFrameCount / cfg.assumedHz) * 1000);
      data.total_drift_deg      = dir * (stimuliFrameCount - 1) * cfg.deg_per_frame;

      data.nColoredSquares      = spec.coloredIdx.size;
      data.coloredIdx           = Array.from(spec.coloredIdx);
      data.trialDuration        = trialDuration;
    },
  };

  return [trial];
}
