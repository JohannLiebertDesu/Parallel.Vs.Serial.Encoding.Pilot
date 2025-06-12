import { GridCell, selectAndOccupyCell, radius } from './createGrid';
import { Stimulus } from './createStimuli';

export function placeAndGenerateStimuli(grid: GridCell[], numCircles: number, cellWidth: number, cellHeight: number, side: 'left' | 'right' | 'both', stimulusType: 'colored_circle' | 'oriented_circle'): Stimulus[] {
    const stimuli: Stimulus[] = [];

    if (numCircles === 6 && side === 'both') {
        for (let i = 0; i < 3; i++) {
            let cell = selectAndOccupyCell(grid, 'left');
            if (cell) {
                const newStimuli = createStimulus(cell, cellWidth, cellHeight, stimulusType);
                stimuli.push(...newStimuli);
            }
        }
        for (let i = 0; i < 3; i++) {
            let cell = selectAndOccupyCell(grid, 'right');
            if (cell) {
                const newStimuli = createStimulus(cell, cellWidth, cellHeight, stimulusType);
                stimuli.push(...newStimuli);
            }
        }
    } else {
        for (let i = 0; i < numCircles; i++) {
            let cell = selectAndOccupyCell(grid, side);
            if (cell) {
                const newStimuli = createStimulus(cell, cellWidth, cellHeight, stimulusType);
                stimuli.push(...newStimuli);
            }
        }
    }

    return stimuli;
}


function createStimulus(cell: GridCell, cellWidth: number, cellHeight: number, stimulusType: 'colored_circle' | 'oriented_circle'): Stimulus[] {
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
            radius: radius,
            line_color: color,
            fill_color: color,
            line_width: 3,
        });
    } else if (stimulusType === 'oriented_circle') {
        const angle = Math.random() * 2 * Math.PI; // Random angle in radians
        const line_length = radius; // Line length is equal to the radius

        const endX = centerX + line_length * Math.cos(angle);
        const endY = centerY + line_length * Math.sin(angle);

        stimuli.push({
            category: 'predefined',
            obj_type: 'circle',
            startX: centerX,
            startY: centerY,
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
            x2: endX,
            y2: endY,
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