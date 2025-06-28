import { Stimulus } from './createStimuli';
import { StimulusKind } from './placeStimuli';

/* ------------------------------------------------------------------
 * Helper: tag exactly two logical items with tested_first/second
 * -----------------------------------------------------------------*/

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; --i) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function makeBalancedFirstKinds(n: number): StimulusKind[] {
    if (n % 2 !== 0) throw new Error("Need an even trial count to balance.");
    const half = n / 2;
    const seq: StimulusKind[] = [
      ...Array(half).fill("colored_circle"),
      ...Array(half).fill("oriented_circle"),
    ];
    return shuffle(seq);      // random permutation, but still 50/50
  }
  
/** Works in-place on the same Stimulus objects you later pass to jsPsych */
export function assignTestStatus(
  allStimuli: Stimulus[],
  numCircles: 3 | 6,
  composition: 'homogeneous_colour' | 'homogeneous_orientation' | 'mixed',
  forcedFirst?: StimulusKind            
) {
  /* 1. Pack low-level stimuli into logical “items” ------------------*/
  interface Item { indices: number[]; feature: StimulusKind; }
  const items: Item[] = [];
  const seen = new Set<number>();

  for (let i = 0; i < allStimuli.length; i++) {
    if (seen.has(i)) continue;
    const s = allStimuli[i];

    /* ignore the line until we meet its circle */
    if (s.obj_type === 'line') continue;

    const group: Item = { indices: [i], feature: 'colored_circle' };
    seen.add(i);

    // coloured vs. oriented is decided by fill colour
    if ('fill_color' in s && s.fill_color === 'transparent') {
      group.feature = 'oriented_circle';
      // find the matching line (same centre)
      const partner = allStimuli.findIndex(o =>
        o.obj_type === 'line' &&
        (o as any).x1 === (s as any).startX &&
        (o as any).y1 === (s as any).startY
      );
      if (partner !== -1) {
        group.indices.push(partner);
        seen.add(partner);
      }
    }
    items.push(group);
  }

  /* 2. Pick which two items will be tested --------------------------*/
  let chosen: Item[] = [];

  if (numCircles === 3 || composition !== 'mixed') {
    chosen = shuffle(items).slice(0, 2);          // any two
  } else {                                        // mixed – one of each
    const coloured = shuffle(items.filter(x => x.feature === 'colored_circle'))[0];
    const oriented = shuffle(items.filter(x => x.feature === 'oriented_circle'))[0];
    chosen = [coloured, oriented];
  }

  if (forcedFirst) {
    // ensure the requested feature is the first element
    chosen.sort(item => (item.feature === forcedFirst ? -1 : 1));
  } else {
    // legacy behaviour: random
    chosen = shuffle(chosen);
  }

  /* 3. Annotate every low-level stimulus in the chosen items --------*/
  chosen[0].indices.forEach(idx => allStimuli[idx].test_status = 'tested_first');
  chosen[1].indices.forEach(idx => allStimuli[idx].test_status = 'tested_second');
}
