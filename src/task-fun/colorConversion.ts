function oklchToOklab({ l, c, h }: { l: number, c: number, h: number }) { // Function to convert Oklch to Oklab
    const a = c * Math.cos(h * (Math.PI / 180)); // Calculate a
    const b = c * Math.sin(h * (Math.PI / 180)); // Calculate b
    return { l, a, b }; // Return the Oklab values
  }
  
  function oklabToLinearSrgb({ l, a, b }: { l: number, a: number, b: number }) { // Function to convert Oklab to linear sRGB
    const l_ = l + 0.3963377774 * a + 0.2158037573 * b; 
    const m_ = l - 0.1055613458 * a - 0.0638541728 * b; 
    const s_ = l - 0.0894841775 * a - 1.2914855480 * b;
    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;
  
    const r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    const bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;
  
    return { r, g, b: bl };
  }
  
  function linearSrgbToSrgb(value: number) { // Function to convert color values
    return value <= 0.0031308
      ? 12.92 * value
      : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
  }
  
  function linearSrgbToRgb({ r, g, b }: { r: number, g: number, b: number }) { // Conversion of linear RGB to sRGB
    return {
      r: linearSrgbToSrgb(r),
      g: linearSrgbToSrgb(g),
      b: linearSrgbToSrgb(b),
    };
  }
  
  function rgbToHex(value: number) { // Function to convert RGB to hexadecimal
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }
  
  function rgbToHexString({ r, g, b }: { r: number, g: number, b: number }) { // Function to convert RGB to hexadecimal string
    return `#${rgbToHex(r)}${rgbToHex(g)}${rgbToHex(b)}`;
  }
  export function colorconversion({ l, c, h }: { l: number, c: number, h: number }) { // Function to convert oklch to hex string
    const oklab = oklchToOklab({ l, c, h });
    const linearSrgb = oklabToLinearSrgb(oklab);
    const srgb = linearSrgbToRgb(linearSrgb);
    return rgbToHexString(srgb);
  
  }