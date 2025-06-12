export type LineStimulus = {
    category: 'predefined' | 'customWheel'
    obj_type: 'line';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    line_color: string;
    line_width: number;
};

export type CircleStimulus = {
    category: 'predefined' | 'customWheel'
    obj_type: 'circle';
    startX: number;
    startY: number;
    line_color?: string;
    fill_color?: string;
    radius: number;
    line_width: number;
};

export type WheelStimulus = {
    category: 'customWheel';
    obj_type: 'manual';
    startX: number;
    startY: number;
    outerRadius: number;
    innerRadius: number;
    show_start_time: number;
    show_end_time: null; // Show for the duration of the trial
    offset: number; // Offset is always a number
    drawFunc: (stimulus: any, canvas: any, context: any) => void;
};

export type Stimulus = LineStimulus | CircleStimulus | WheelStimulus;
