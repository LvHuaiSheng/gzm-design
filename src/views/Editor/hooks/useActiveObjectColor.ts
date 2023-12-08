import { isString } from 'lodash'
import { padHexColor } from '@/views/Editor/utils/fill'
import { appInstance } from '@/views/Editor/app'
import { IMLeaferCanvas } from '@/views/Editor/core/canvas/mLeaferCanvas'
import ColorPicker from '@/components/colorPicker'
import { Fn, tryOnScopeDispose } from '@vueuse/core'
import {typeUtil} from "@/views/Editor/utils/utils";
import Color from "@/utils/color/color";
import NP from 'number-precision'
import {replaceElementToNewArr} from "@/utils/utils";

type LinearGradientCoords<T> = {
  /**
   * X coordiante of the first point
   */
  x1: T;
  /**
   * Y coordiante of the first point
   */
  y1: T;
  /**
   * X coordiante of the second point
   */
  x2: T;
  /**
   * Y coordiante of the second point
   */
  y2: T;
};

/**
 * convertCoordsToDeg
 * @param coords
 */
const convertCoordsToDeg = ({ x1, y1, x2, y2 }: LinearGradientCoords<number>) =>
  (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI + 90

/**
 * TODO 优化并修复填充功能中的一些问题，暂时先这样用（纯色和线性渐变正常） 后续有时间处理
 * @param color
 * @param option
 */
export function useColor(
  color: Ref<any | null | undefined>,
  option: {
    attr: 'fill' | 'stroke'
    onChange: (value: string | null | undefined) => void
  },
) {
  /** 小方块颜色图标 */
  const colorBlock=computed(()=>(index:number)=>{
    // const colorBlock = computed(() => {
    const colorVal = color.value[index]
    let background = ''
    if (isString(colorVal)) {
      background += colorVal
    } else if (colorVal.type ==='solid') {
      background += colorVal.color
    } else if (typeUtil.isPattern(colorVal)) {
      background += `url(${colorVal.url}) center center / 14px no-repeat`
    } else if (typeUtil.isGradient(colorVal)) {
      if (colorVal.type === 'linear') {
        background += `linear-gradient(90deg`
        // background += `linear-gradient(8px 8px at 8px 8px`
      } else {
        background += `radial-gradient(8px 8px at 8px 8px`
      }
      background += `,${colorVal.stops
        .map((cs:any) => `${cs.color} ${cs.offset * 100}%`)
        .join(',')})`
    //   background: linear-gradient(90deg, rgb(79, 14, 14) 18.6364%, rgba(79, 14, 14, 0) 24.5455%, rgb(114, 59, 59) 30%, rgba(99, 162, 63, 0.47) 53.1818%, rgb(205, 83, 83) 59.5455%, rgba(255, 255, 255, 0) 75%);
    //   background: linear-gradient(90deg, rgb(114, 59, 59) 30%, rgba(255, 255, 255, 0) 75%, rgb(205, 83, 83) 59.5455%, rgba(99, 162, 63, 0.47) 53.1818%, rgba(79, 14, 14, 0) 24.5455%, rgb(79, 14, 14) 18.6364%);
    }
    // console.log('background=',background)
    return {
      class: 'w18px h18px rd-4px',
      style: {
        border: '1px solid #cccccc90',
        background: background || '#fff',
      },
    }
  })

  /** 展示文字 */
  const formatValue=computed(()=>(index:number)=>{
    const colorVal = color.value[index]
    let text = ''
    if (isString(colorVal) || colorVal.type==='solid') {
      const fabricColor = new Color(colorVal.color)
      text = fabricColor.hex.toUpperCase()
    } else if (typeUtil.isGradient(colorVal)) {
      text = colorVal.type === 'linear' ? '线性渐变' : '径向渐变'
    } else if (typeUtil.isPattern(colorVal)) {
      text = '图案填充'
    }
    return text
  })

  let closeFn: Fn | undefined

  /** 关闭颜色选择器 */
  const closeColorPicker = () => {
    closeFn && closeFn()
  }

  /** 打开颜色选择器 */
  const openColorPicker = (index:number) => {
    ColorPicker.close()
    appInstance.editor.service.invokeFunction((accessor) => {
      const canvas = accessor.get(IMLeaferCanvas)
      if (!isDefined(canvas.activeObject)) return
      closeFn = ColorPicker.open({
        object: canvas.activeObject.value,
        attr: option.attr,
        index:index,
        dialogOption: {
          onClose() {
            // 关闭后置空
            closeFn = undefined
          },
        },
      })
    })
  }

  tryOnScopeDispose(() => {
    closeColorPicker()
  })

  return {
    formatValue,
    colorBlock,
    openColorPicker,
    closeColorPicker,
    readonly: computed(() => {
      return !isString(color.value)
    }),
    /**
     * 更改透明度，透明度官方目前暂时仅针对`color`为`颜色对象`的有效（2023-11-10）
     * 实际上这个方法应该也用不到 直接在颜色选择色板区修改透明度即可
     */
    changeOpacity(value: number | undefined) {
      if (!isString(color.value) || !isDefined(value)) return
      const fabricColor = new Color(color.value)
      fabricColor.alpha = NP.divide(value, 100)
      option.onChange(fabricColor.rgba)
    },
    /** 更改颜色 */
    changeColor(value: string) {
      value = value.replace(/^#/, '')
      if (value.length < 6) {
        value = padHexColor(value)
      }
      const fabricColor = new Color(value)
      // fabricColor.alpha = NP.divide(opacity.value || 100, 100)
      option.onChange(fabricColor.rgba)
    },
  }
}
