

export type CircleStimulus = {
    category: 'predefined';
    obj_type: 'circle';
    startX: number;
    startY: number;
    side: 'left' | 'right';
    radius: number;
    fill_color: string;
    line_color: string;
    line_width: number;
    test_status: 'not_tested' | 'tested_first' | 'tested_second';
};

export type LineStimulus = {
    category: 'predefined';
    obj_type: 'line';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    side: 'left' | 'right';
    line_color: string;
    line_width: number;
    test_status: 'not_tested' | 'tested_first' | 'tested_second';
};
  
  export type WheelStimulus = {
    category: 'customWheel';
    obj_type: 'manual';
    origin_center: true,
    startX: number;
    startY: number;
    outerRadius: number;
    innerRadius: number;
    offset: number; // Offset is always a number
    drawFunc: (stimulus: any, canvas: any, context: any) => void;
};

  /* Convenience union ---------------------------------------------*/
  export type Stimulus = LineStimulus | CircleStimulus;
