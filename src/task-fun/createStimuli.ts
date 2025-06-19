

export interface BaseStimulus {
    category: 'predefined';
    obj_type: 'circle' | 'line';
    side: 'left' | 'right';              
    line_width: number;
    line_color: string;
    test_status: 'not_tested' | 'tested_first' | 'tested_second'; 
  }
  
  /* Circle --------------------------------------------------------*/
  export interface CircleStimulus extends BaseStimulus {
    obj_type: 'circle';
    startX: number;
    startY: number;
    radius: number;
    fill_color: string;
  }
  
  /* Line ----------------------------------------------------------*/
  export interface LineStimulus extends BaseStimulus {
    obj_type: 'line';
    x1: number; y1: number;
    x2: number; y2: number;
  }
  
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

  /* Convenience union ---------------------------------------------*/
  export type Stimulus = LineStimulus | CircleStimulus;
