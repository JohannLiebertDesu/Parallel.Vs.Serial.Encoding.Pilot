import { colorconversion } from "./colorConversion";
// import { jsPsych } from "../jsp"; // not needed in this version

export function createRectObject(
  startX: number, startY: number, hueStart: number, width: number, height: number,
  rotation: "cw" | "ccw" = "cw", deg_per_frame: number, lightness: number, chroma: number,
  stimuliFrameCount: number = Infinity, mode: 'colored' | 'outline' = 'colored'
) {
  const dir = rotation === "ccw" ? -1 : 1;
  const wrapHue = (h: number) => ((h % 360) + 360) % 360;

  const initColor = colorconversion({ l: lightness, c: chroma, h: wrapHue(hueStart)});

  return {
    obj_type: "rect",
    startX,
    startY,
    origin_center: true,
    width,
    height,
    // initial colors
    line_color: mode === 'outline' ? "#000000" : initColor,
    // transparent fill if outline
    fill_color: mode === 'outline' ? "rgba(0,0,0,0)" : initColor,

    // (stim, elapsedMs, frameCount)
    change_attr(stim: any, _times: number, frames: number) {
      if (mode === 'outline') return; // no animation for outline
      const h = wrapHue(hueStart + dir * frames * deg_per_frame);
      const col = colorconversion({ l: lightness, c: chroma, h });
      stim.fill_color = col;
      stim.line_color = col;
    },

    // show for N frames: 0..N-1
    show_start_frame: 0,
    show_end_frame: stimuliFrameCount,
    is_frame: true,
  };
}

export function createCrossDuringSample(
  startX: number, startY: number, stimuliFrameCount: number = Infinity, maskFrameCount: number = Infinity
) {
return {
    obj_type: "cross",
    startX,
    startY,
    origin_center: true,
    line_color: "#000000",
    line_length: 20,
    line_width: 3,
    show_start_frame: 0,                     // visible from first frame...
    show_end_frame: stimuliFrameCount + maskFrameCount,       // ...through the sample period
    is_frame: true
};
}

// Static, localized color-tile mask via drawFunc
export function createStaticTileMaskManual(
  startX: number, startY: number, width: number, height: number,
  tile: number, lightness: number, chroma: number,
  stimuliFrameCount: number = Infinity,  // when to start (in frames)
  maskFrameCount: number = Infinity      // how many frames to show
) {
  const nCols = Math.max(1, Math.round(width  / tile));
  const nRows = Math.max(1, Math.round(height / tile));
  const tileW = width  / nCols;
  const tileH = height / nRows;

  const colors = Array.from({ length: nCols * nRows }, () => {
    const h = Math.random() * 360;
    return colorconversion({ l: lightness, c: chroma, h });
  });

  return {
    obj_type: "manual",
    startX,
    startY,
    origin_center: true,
    width,
    height,
    _nCols: nCols,
    _nRows: nRows,
    _tileW: tileW,
    _tileH: tileH,
    _colors: colors,

    drawFunc(stim: any, _canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.translate(stim.currentX, stim.currentY);
      const left = -stim.width / 2;
      const top  = -stim.height / 2;

      let i = 0;
      for (let r = 0; r < stim._nRows; r++) {
        const y = top + r * stim._tileH;
        for (let c = 0; c < stim._nCols; c++, i++) {
          const x = left + c * stim._tileW;
          ctx.fillStyle = stim._colors[i];
          ctx.fillRect(x, y, stim._tileW, stim._tileH);
        }
      }
      ctx.restore();
    },

    // start exactly when the sample ends; end after maskFrameCount frames
    show_start_frame: stimuliFrameCount,
    show_end_frame: stimuliFrameCount + maskFrameCount,
    is_frame: true,
  };
}


export function createFixationWindow(
  startX: number, startY: number,
  stimuliFrameCount: number = Infinity,   // when to start (in frames)
  maskFrameCount: number = Infinity,      // how many frames to show
  totalFrameCount: number = Infinity
) {
  return {
    obj_type: "cross",
    startX,
    startY,
    origin_center: true,
    line_color: "#000000",
    line_length: 20,
    line_width: 3,

    show_start_frame: stimuliFrameCount + maskFrameCount,
    show_end_frame: totalFrameCount,
    is_frame: true
  };
}

export function createITI(
  startX: number, startY: number,
) {
  return {
    obj_type: "cross",
    startX,
    startY,
    origin_center: true,
    line_color: "#000000",
    line_length: 20,
    line_width: 3,
  };
}