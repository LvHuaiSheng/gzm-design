import {Color} from "ag-psd/src/psd";
import NP from "number-precision";

export const toRGBAColor = (data: number[])=> {
  const [r, g, b] = data;
  let [, , , a] = data;
  if (a > 1) {
    a = a / 255;
  }
  return [r, g, b, a] as const;
}


export const toRGBAColorStr = (data)=> {
  // const {r, g, b} = data;
  let [ a,r,g,b] = data;
  if (a > 1) {
    a = a / 255;
  }
  return `rgba(${r*255},${g*255},${b*255},${a})`;
}

export const toRGBColorStr = (data: any)=> {
  const {r, g, b} = data;
  return `rgb(${r},${g},${b})`;
}

function roundFloat(number: number, decimalPoints: number): number {
  return NP.round(number, decimalPoints)
}

export class RGBA {
  _rgbaBrand: void = undefined

  /**
   * Red: integer in [0-255]
   */
  readonly r: number

  /**
   * Green: integer in [0-255]
   */
  readonly g: number

  /**
   * Blue: integer in [0-255]
   */
  readonly b: number

  /**
   * Alpha: float in [0-1]
   */
  readonly a: number

  constructor(r: number, g: number, b: number, a = 1) {
    this.r = Math.min(255, Math.max(0, r)) | 0
    this.g = Math.min(255, Math.max(0, g)) | 0
    this.b = Math.min(255, Math.max(0, b)) | 0
    this.a = roundFloat(Math.max(Math.min(1, a), 0), 3)
  }

  static equals(a: RGBA, b: RGBA): boolean {
    return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a
  }
}
