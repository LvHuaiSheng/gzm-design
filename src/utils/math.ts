import NP from 'number-precision'

/**
 * Clamps the given 'angle' between '-180' and '180'
 * @param angle
 * @returns The clamped angle
 */
export const clampAngle = (angle: number): number => {
    const normalizedAngle = ((angle % 360) + 360) % 360
    const clampedAngle = normalizedAngle > 180 ? normalizedAngle - 360 : normalizedAngle
    return clampedAngle
}

/**
 * Rounds a number to a specified number of decimal places.
 * @param {number} v - The number to round.
 * @param {number} [digits=2] - The number of decimal places to round to. Default is 2.
 * @returns {number} - The rounded number.
 */
export const toFixed = (v: number, digits = 2): number => NP.round(v, digits)
