import type {ColorPoint} from '@/components/colorPicker/interface'
import {PiBy180} from './constants'
import {Point} from "leafer-ui";
import Color from "@/utils/color/color";
// import type { GradientCoords } from 'fabric/src/gradient/typedefs'

// 获取镜像的点 p1原点 p2手的位置
export function getMirrorPoint(p1: Point, p2: Point) {
    // 获取两点之间的弧度
    const radian = getRadian(p1, p2)
    // 弧度转角度
    const degrees = radian2Angle(radian)
    // 求出距离作为半径
    const radius = getDistance(p1, p2)
    // 根据半径[radius],原点[p1.x,p1.y]坐标, 计算出角度[degrees]对应的圆上坐标点
    const x = p1.x + radius * Math.cos((degrees * Math.PI) / 180)
    const y = p1.y + radius * Math.sin((degrees * Math.PI) / 180)
    return {x, y}
}

// 获取两点之间的弧度
export function getRadian(p1: Point, p2: Point) {
    return Math.atan2(p1.y - p2.y, p1.x - p2.x)
}

// 弧度转角度
export function radian2Angle(radian: number) {
    return (180 / Math.PI) * radian
}

// 获取两点的距离
export function getDistance(p1: Point, p2: Point) {
    const dx = Math.abs(p1.x - p2.x)
    const dy = Math.abs(p1.y - p2.y)
    const radius = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
    return radius
}

/**
 * 根据坐标计算角度
 * @param coords 坐标 { x1, y1, x2, y2 }
 * @returns 角度值
 */
// export const getAngle = ({ x1, y1, x2, y2 }: GradientCoords<'linear' | 'radial'>) => {
//   // if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) return
//   const dx = x2 - x1
//   const dy = y2 - y1
//   const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90
//   return angle >= 0 ? angle : angle + 360
// }

// 角度转换坐标
export const gradAngleToCoords = (paramsAngle: number) => {
    const anglePI = -parseInt(paramsAngle + '', 10) * PiBy180
    const angleCoords = {
        x1: Math.round(50 + Math.sin(anglePI) * 50) / 100,
        y1: Math.round(50 + Math.cos(anglePI) * 50) / 100,
        x2: Math.round(50 + Math.sin(anglePI + Math.PI) * 50) / 100,
        y2: Math.round(50 + Math.cos(anglePI + Math.PI) * 50) / 100,
    }
    return angleCoords
}

export const pointsToColorStops = (points: ColorPoint[]) => {
    return points.map((item) => ({
        offset: item.left / 100,
        color: `rgba(${item.red}, ${item.green}, ${item.blue}, ${item.alpha})`,
    }))
}

export const fabricGradientToPoints = (val: any): ColorPoint[] => {
    console.log('val=', val)
    return val.stops.map((item: any) => {
        const _color = new Color(item.color)
        const {r, g, b, a} = _color.getRgba()
        return {
            left: item.offset * 100,
            red: r,
            green: g,
            blue: b,
            alpha: a,
        }
    })
}

/**
 * 将不足6位的十六进制颜色代码转换为6位的格式。
 * @param {string} hex - 十六进制颜色代码
 * @returns {string} - 6位的十六进制颜色代码
 */
export const padHexColor = (hex: string): string => {
    return hex.padEnd(6, hex)
}
