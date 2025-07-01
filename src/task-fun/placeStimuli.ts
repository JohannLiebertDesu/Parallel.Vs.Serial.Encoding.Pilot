import { GridCell, selectAndOccupyCell, radius } from './createGrid';
import { Stimulus } from './defineStimuli';

/** Which basic shapes we support */
export type StimulusKind = 'colored_circle' | 'oriented_circle';

/** Declarative request: “give me N items of KIND on SIDE” */
export interface StimulusSpec {
    count: number;
    side: 'left' | 'right';
    stimulusType: StimulusKind;
  }

  
/** Low-level workhorse: executes an array of StimulusSpec objects */
export function generateStimuli (
    grid: GridCell[],
    specs: StimulusSpec[],
    cellWidth: number,
    cellHeight: number,
  ): Stimulus[] {    
    
    const stimuli: Stimulus[] = [];

    for (const { count, side, stimulusType } of specs) {
      for (let i = 0; i < count; i++) {
        const cell = selectAndOccupyCell(grid, side);
        if (cell) {
          stimuli.push(
            ...createStimulus(side, cell, cellWidth, cellHeight, stimulusType),
          );
        }
      }
    }
    return stimuli;
  }

/** * Creates a stimulus based on the provided cell, cell dimensions, and stimulus type. */
function createStimulus(side: 'left' | 'right', cell: GridCell, cellWidth: number, cellHeight: number, stimulusType: 'colored_circle' | 'oriented_circle'): Stimulus[] {
    const color = randomColor();
    const stimuli: Stimulus[] = [];

    const centerX = cell.x * cellWidth + cellWidth / 2;
    const centerY = cell.y * cellHeight + cellHeight / 2;

    if (stimulusType === 'colored_circle') {
        stimuli.push({
            category: 'predefined',
            obj_type: 'circle',
            startX: centerX,
            startY: centerY,
            side,
            test_status: 'not_tested',
            radius: radius,
            line_color: color,
            fill_color: color,
            line_width: 3,
        });
    } else if (stimulusType === 'oriented_circle') {
        const angle = Math.random() * 2 * Math.PI; // Random angle in radians
        const line_length = radius; // Line length is equal to the radius

        const secondX = centerX + line_length * Math.cos(angle);
        const secondY = centerY + line_length * Math.sin(angle);

        stimuli.push({
            category: 'predefined',
            obj_type: 'circle',
            startX: centerX,
            startY: centerY,
            side,
            test_status: 'not_tested',
            radius: radius,
            line_color: 'black',
            fill_color: 'transparent', // No fill for circle_with_line
            line_width: 3,
        });
        stimuli.push({
            category: 'predefined',
            obj_type: 'line',
            x1: centerX,
            y1: centerY,
            x2: secondX,
            y2: secondY,
            side,
            test_status: 'not_tested',
            line_color: 'black',
            line_width: 3,
        });
    }

    return stimuli;
}


export function randomColor() {
    // Generate a random hue value between 0 and 360
    const hue = Math.floor(Math.random() * 360);
    // Use fixed saturation and lightness values to match the color wheel
    const saturation = 80;
    const lightness = 50;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}