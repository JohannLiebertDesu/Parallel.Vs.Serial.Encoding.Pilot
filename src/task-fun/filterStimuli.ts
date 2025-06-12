import { Stimulus, LineStimulus, CircleStimulus } from './createStimuli';

export function filterAndMapStimuli(stimuli_array: Stimulus[]): (LineStimulus | CircleStimulus)[] {
    return stimuli_array
        .map((stim) => {
            if (stim.obj_type === 'line') {
                const lineStim: LineStimulus = {
                    category: 'predefined',
                    obj_type: 'line',
                    x1: stim.x1,
                    y1: stim.y1,
                    x2: stim.x2,
                    y2: stim.y2,
                    line_color: stim.line_color,
                    line_width: stim.line_width,
                };
                return lineStim;
            } else if (stim.obj_type === 'circle') {
                const circleStim: CircleStimulus = {
                    category: 'predefined',
                    obj_type: 'circle',
                    startX: stim.startX,
                    startY: stim.startY,
                    line_color: stim.line_color, // Optional
                    fill_color: stim.fill_color, // Optional
                    radius: stim.radius,
                    line_width: stim.line_width,
                };
                return circleStim;
            }
            // If you are certain that no other obj_type will appear here, 
            // you can remove this null return and its filter below.
            return null;
        })
        .filter((stim): stim is LineStimulus | CircleStimulus => stim !== null);
}