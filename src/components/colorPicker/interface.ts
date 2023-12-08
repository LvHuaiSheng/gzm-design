import type { DialogConfig } from '@/components/dialog/interface'

export type Props = {
  solidColor?: boolean
  mode?: Mode
  attr?: string
  index?: number
  gradient: {
    type: ColorType
    points: ColorPoint[]
  }
  onChange?: (data: { points: ColorPoint[]; type: ColorType }) => void
  onStartChange?: (data: { points: ColorPoint[]; type: ColorType }) => void
  onEndChange?: (data: { points: ColorPoint[]; type: ColorType }) => void
}

export interface ColorPoint {
  left: number
  red: number
  green: number
  blue: number
  alpha: number
}

export type Mode = 'hex' | 'rgb' | 'hsb' | 'hsl'

export type ActionName = 'onStartChange' | 'onChange' | 'onEndChange'

export type ColorType = 'color' | 'linear' | 'radial' | 'pattern'

export type UpdateColor = (
  color: {
    r?: number
    g?: number
    b?: number
    a?: number
    hue?: number
    saturation?: number
    value?: number
  },
  actionName?: ActionName,
) => void

export interface ColorPickerOption {
  /** 初始颜色 */
  initialColor?: string | any
  /** Fabricjs对象 */
  object?: any
  // 数组角标
  index: number
  attr?: 'fill' | 'stroke'
  /** dialog配置 */
  dialogOption?: Partial<DialogConfig>
}
