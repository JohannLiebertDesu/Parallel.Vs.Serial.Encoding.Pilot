import { WheelStimulus } from "./defineStimuli";
import { colorconversion } from "./colorConversion";

// The wheels are just basic psychophysics stimuli of the obj_type: 'manual'. They get drawn using the drawFunc property.
// We can then import them into the trial as one of the stimuli displayd on screen.

export function createColorWheel(
    startX: number,
    startY: number,
    outerRadius: number,
    innerRadius: number,
    offset: number
  ): WheelStimulus {
    return {
      category: "customWheel", // Custom category to identify this stimulus
      obj_type: "manual",
      startX, // This is the x-coordinate of the center of the wheel
      startY, // This is the y-coordinate of the center of the wheel
      origin_center: true,
      outerRadius,
      innerRadius,
      offset, // Offset in degrees -> I use this so that the color wheel does not always have the same layout. It's important to match this number with the "invisible" color wheel that a participant selects from when they move the mouse around the stimulus.
      drawFunc: function(stimulus, canvas, context) { // (these are not passed by me, but required by the psychophysics plugin)

        const cx = stimulus.currentX ?? stimulus.startX;
        const cy = stimulus.currentY ?? stimulus.startY;

        const numSegments = 360; // Number of color segments
        const angleStep = (2 * Math.PI) / numSegments;

        for (let i = 0; i < numSegments; i++) {
            const startAngle = i * angleStep;
            const endAngle = startAngle + angleStep;
            const angleDegrees = (i / numSegments) * 360;
            const hue = (angleDegrees + offset) % 360;

            context.beginPath();
            context.arc(cx, cy, stimulus.outerRadius, startAngle, endAngle, false);
            context.arc(cx, cy, stimulus.innerRadius, endAngle, startAngle, true);
            context.closePath();
            context.fillStyle = colorconversion({ l: 0.6, c: 0.1, h: hue });
            context.fill();
        }
      }
    };
}

export function createOrientationWheel(
    startX: number,
    startY: number,
    outerRadius: number,
    innerRadius: number,
    offset: number
    ): WheelStimulus {
    return {
        category: 'customWheel', // Custom category to identify this stimulus
        obj_type: 'manual', // Ensure this matches your registration
        startX,
        startY,
        origin_center: true,
        outerRadius,
        innerRadius,
        offset, // No offset for orientation wheel
        drawFunc: function(stimulus, canvas, context) { 

            // Step 1: Fill the wheel with black
            context.beginPath();
            context.arc(startX, startY, outerRadius, 0, 2 * Math.PI);
            context.arc(startX, startY, innerRadius, 2 * Math.PI, 0, true);
            context.closePath();
            context.fillStyle = 'black';
            context.fill();

            // Step 2: Draw 16 yellow graduation lines
            const numSegments = 16; // Number of graduation lines
            const angleStep = (2 * Math.PI) / numSegments; // 22.5 degrees in radians

            context.strokeStyle = 'yellow';
            context.lineWidth = 2; // Adjust line width as needed

            for (let i = 0; i < numSegments; i++) {
                const angle = i * angleStep;

                // Calculate start (inner) and end (outer) points of the line
                const xStart = startX + innerRadius * Math.cos(angle);
                const yStart = startY + innerRadius * Math.sin(angle);
                const xEnd = startX + outerRadius * Math.cos(angle);
                const yEnd = startY + outerRadius * Math.sin(angle);

                // Draw the line
                context.beginPath();
                context.moveTo(xStart, yStart);
                context.lineTo(xEnd, yEnd);
                context.stroke();
            }
        }
    };
    }