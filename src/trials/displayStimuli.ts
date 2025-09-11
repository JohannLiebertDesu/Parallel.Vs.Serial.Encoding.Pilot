/* displayStimuli.ts – run-time stimulus generation */
import psychophysics from "@kurokida/jspsych-psychophysics";
import { createRectObject, createCrossDuringSample, createStaticTileMaskManual, createFixationWindow } from "../task-fun/stimuli";
import type { Vertex } from "../task-fun/triangleHelpers"

export function displayStimuli(
  trialID: number,
  blockID: number,
  practice: boolean,
  calibrationTrial: boolean,
  startX: number,
  startY: number,
  width: number,
  height: number,
  rotation: "cw" | "ccw",
  deg_per_frame: number,
  stimuliFrameCount: number,
  maskFrameCount: number,
  totalFrameCount: number,
  trialDuration: number,
  tile: number,
  nColoredSquares: number,                // NEW (0..3)
  chroma: number,
  lightness: number,
  verts: ReadonlyArray<Vertex>,
  coloredIdx: ReadonlySet<number>,
  hueStarts: ReadonlyArray<number>,
  targetIdx: number,

): any[] {

  // build 3 squares (colored or outline), each with its own random starting hue
  const squares = verts.map((p, i) => {
    const colored = coloredIdx.has(i);
    const initHue = hueStarts[i];
    return createRectObject(
      p.x, p.y, initHue, width, height,
      rotation, deg_per_frame, lightness, chroma, stimuliFrameCount,
      colored ? 'colored' : 'outline'
    );
  });

  // localized masks for each square
  const masks = verts.map(p =>
    createStaticTileMaskManual(
      p.x, p.y, width, height, tile, lightness, chroma,
      stimuliFrameCount, maskFrameCount
    )
  );

  const sampleTrial = {
    type: psychophysics,
    stimuli: [
      ...squares,
      ...masks,
      createCrossDuringSample(startX, startY, stimuliFrameCount, maskFrameCount),
      createFixationWindow(startX, startY, stimuliFrameCount, maskFrameCount, totalFrameCount)
    ],
    choices: "NO_KEYS",
    trial_duration: trialDuration,
    data: {
      trialID, blockID, practice,
      calibrationTrial,
      trialSegment: "stimuliPresentation",
      deg_per_frame,
      stimuliFrameCount,
      rotation,
      trialDuration,
      nColoredSquares,
      verts,
      coloredIdx: Array.from(coloredIdx),
      hueStarts,
      targetIdx: targetIdx,
    }
  };

  return [sampleTrial];
}