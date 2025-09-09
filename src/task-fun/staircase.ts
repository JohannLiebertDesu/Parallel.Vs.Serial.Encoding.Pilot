// staircase.ts
export type StairHistory = { trial: number; levelFrames: number; correct: boolean };

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

  constructor(opts: {
    startFrames: number; up?: number; down?: number;
    minFrames?: number; maxFrames?: number; pTarget?: number;
  }) {
    this.level = opts.startFrames;
    this.up = opts.up ?? 1;              // 1-up
    this.down = opts.down ?? 3;          // 3-down  → ~75%
    this.min = Math.max(1, opts.minFrames ?? 1);
    this.max = Math.max(this.min, opts.maxFrames ?? 60);
    this.pTarget = opts.pTarget ?? 0.75;
  }

  current() { return this.level; }

  update(correct: boolean) {
    this.trial += 1;
    const prev = this.level;
    this.level = correct ? (this.level - this.down) : (this.level + this.up);
    this.level = Math.min(this.max, Math.max(this.min, this.level));

    const dir: -1 | 0 | 1 = this.level > prev ? +1 : (this.level < prev ? -1 : 0);
    if (this.lastDir !== 0 && dir !== 0 && dir !== this.lastDir) this.reversals += 1;
    if (dir !== 0) this.lastDir = dir;

    this.history.push({ trial: this.trial, levelFrames: this.level, correct });
  }

  accLast(n = 20) {
    const H = this.history.slice(-n);
    if (!H.length) return NaN;
    return H.filter(h => h.correct).length / H.length;
  }

  isStable(n = 20, tol = 0.05) {
    if (this.history.length < n) return false;
    const acc = this.accLast(n);
    return Number.isFinite(acc) && Math.abs(acc - this.pTarget) <= tol && this.reversals >= 4;
  }
}
