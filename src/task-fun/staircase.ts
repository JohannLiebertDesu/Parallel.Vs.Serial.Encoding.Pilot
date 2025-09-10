// staircase.ts
export type StairHistory = { trial: number; levelFrames: number; correct: boolean };

const median = (xs: number[]) => {
  if (!xs || xs.length === 0) return NaN;
  const a = xs.slice().sort((u, v) => u - v);
  const m = Math.floor(a.length / 2);
  return (a.length % 2) ? a[m] : (a[m - 1] + a[m]) / 2;
};

export class Staircase {
  level: number;               // current frames
  up: number;                  // frames to ADD after error
  down: number;                // frames to SUBTRACT after correct
  min: number;
  max: number;
  trial: number = 0;
  reversals: number = 0;
  lastDir: -1 | 0 | 1 = 0;
  history: StairHistory[] = [];
  pTarget: number;

  revMidpoints: number[] = [];
  thresholdFrames?: number;   // set once at stop

  constructor(opts: {
    startFrames: number; up?: number; down?: number;
    minFrames?: number; maxFrames?: number; pTarget?: number;
  }) {
    this.level = opts.startFrames;
    this.up = opts.up ?? 4;              // 4-up
    this.down = opts.down ?? 1;          // 1-down  → ~80%
    this.min = Math.max(1, opts.minFrames ?? 1);
    this.max = Math.max(this.min, opts.maxFrames ?? 60);
    this.pTarget = opts.pTarget ?? 0.8;
  }

  current() { return this.level; }

  update(correct: boolean) {
    this.trial += 1;
    const prev = this.level;
    this.level = correct ? (this.level - this.down) : (this.level + this.up);
    this.level = Math.min(this.max, Math.max(this.min, this.level));

    const dir: -1 | 0 | 1 = this.level > prev ? +1 : (this.level < prev ? -1 : 0);
    if (this.lastDir !== 0 && dir !== 0 && dir !== this.lastDir) {
      this.reversals += 1;
      // NEW: reversal midpoint (between pre- and post-step levels)
      this.revMidpoints.push((prev + this.level) / 2);
    }
    if (dir !== 0) this.lastDir = dir;

    // log the level that PRODUCED this outcome
    this.history.push({ trial: this.trial, levelFrames: prev, correct });
  }

  accLast(n = 60) {
    const H = this.history.slice(-n);
    if (!H.length) return NaN;
    return H.filter(h => h.correct).length / H.length;
  }

  isStable(n = 60, tol = 0.07) {
    if (this.history.length < n) return false;
    const acc = this.accLast(n);
    return Number.isFinite(acc) && Math.abs(acc - this.pTarget) <= tol && this.reversals >= 8;
  }

    // NEW: compute a robust threshold estimate (frames)
  estimateThresholdFrames(kRev = 6, wTail = 20): number {
    const revs = this.revMidpoints.slice(-kRev);
    if (revs.length >= Math.max(3, Math.floor(kRev/2))) {
      return Math.round(median(revs));
    }
    const tail = this.history.slice(-wTail).map(h => h.levelFrames);
    return Math.round(median(tail));
  }

  // NEW: call once at stop to freeze the threshold you’ll use later
  finalizeThreshold(kRev = 6, wTail = 20) {
    if (this.thresholdFrames == null) {
      this.thresholdFrames = this.estimateThresholdFrames(kRev, wTail);
    }
    return this.thresholdFrames!;
  }
}
