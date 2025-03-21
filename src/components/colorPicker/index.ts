import Dialog from '@/components/dialog'
import _ColorPicker from './colorPicker.vue'
import {DialogReturn} from '@/components/dialog/interface'
// import { Color as FabricColor, Gradient, Pattern, GradientCoords } from '@fabric'
import {appInstance} from '@/views/Editor/app'
import {ColorPoint, ColorType} from '@/components/colorPicker/interface'
import {fabricGradientToPoints, gradAngleToCoords, pointsToColorStops} from '@/views/Editor/utils/fill'
import {isDefined} from '@vueuse/core'
import {IMLeaferCanvas} from '@/views/Editor/core/canvas/mLeaferCanvas'
// import { IUndoRedoService } from '@/views/Editor/app/editor/undoRedo/undoRedoService'
import {ServicesAccessor} from '@/views/Editor/core/instantiation/instantiation'
import {ColorPickerOption, Props} from './interface'
import GColor from "@/utils/color/g-color";
import {replaceElementToNewArr, calculatePoints, calculateAngle} from "@/utils/utils";

let dialog: DialogReturn | undefined

/**
 * 关闭dialog
 */
const dialogClose = () => {
  dialog && dialog.close()
  dialog = undefined
}

const openDialog = (
  accessor: ServicesAccessor,
  { object, attr,index, dialogOption, initialColor, ...props }: ColorPickerOption & Partial<Props>,
) => {
  const canvas = accessor.get(IMLeaferCanvas)
  // const undoRedo = accessor.get(IUndoRedoService)

  let points: ColorPoint[]
  let type: ColorType = 'color'
  let degree: number = 0
  const colorArr = <[]>(object && attr ? object.proxyData[attr] : [initialColor])
  const colorValue:any = colorArr[index]
  // 渐变
  if (colorValue.type === 'linear' || colorValue.type === 'radial') {
    points = fabricGradientToPoints(colorValue)
    type = colorValue.type
    // 坐标转角度
    const {from, to} = colorValue
    degree = calculateAngle(from.x, from.y, to.x, to.y)
  }
  // 图案
  else if (colorValue.type === 'image') {
    points = [
      {
        left: 0,
        red: 255,
        green: 255,
        blue: 255,
        alpha: 1,
      },
      {
        left: 100,
        red: 255,
        green: 255,
        blue: 255,
        alpha: 0,
      },
    ]
    type = 'pattern'
  }
  // 纯色
  else if (colorValue) {
    const color = new GColor(colorValue.color)
    const {r, g, b, a} = color.getRgba()
    points = [
      {
        left: 0,
        red:r,
        green:g,
        blue:b,
        alpha:a,
      },
      {
        left: 100,
        red: 255,
        green: 255,
        blue: 255,
        alpha: 0,
      },
    ]
  }

  return Dialog.open({
    width: 240,
    top: window.innerHeight / 2 - 202,
    left: window.innerWidth - 240 - 270,
    title: '颜色',
    ...dialogOption,
    body: () =>
      h(_ColorPicker, {
        onChange(data:any) {
          if (!isDefined(object) || !isDefined(attr)) return
          const colorArr = object[attr]
          const colorValue = colorArr[index]
          if (data.type === 'color') {
            if (data.points.length < 1) return
            const [{ red, green, blue, alpha }] = data.points
            // object.set(attr, `rgba(${red}, ${green}, ${blue}, ${alpha})`)
            colorValue.color = `rgba(${red}, ${green}, ${blue}, ${alpha})`
            // 这里使用新数组，因为leafer是浅监听的 修改数组值无法监听到并重新渲染
            object[attr] = replaceElementToNewArr(colorArr,index,{
              type: 'solid',
              color:colorValue.color,
            })
          } else if (data.type === 'linear' || data.type === 'radial') {
            const colorStops = pointsToColorStops(data.points)
            const angle = data.degree // 渐变角度
            const [to, from] = calculatePoints(angle) // 角度转换成坐标

            // 这里使用新数组，因为leafer是浅监听的 修改数组值无法监听到并重新渲染
            object[attr] = replaceElementToNewArr(colorArr,index,{
              type: data.type,
              stops:colorStops,
              from: {x: from.x, y: from.y, type: 'percent'},
              to: {x: to.x, y: to.y, type: 'percent'}
              // coords:coords,
            })
          }else if (data.type === 'pattern'){
            // 这里使用新数组，因为leafer是浅监听的 修改数组值无法监听到并重新渲染
            object[attr] = replaceElementToNewArr(colorArr,index,{
              type: 'image',
              url:''
            })
          }
          // canvas.requestRenderAll()
        },
        onEndChange() {
          // undoRedo.saveState()
        },
        attr:attr,
        index:index,
        ...props,
        degree,
        gradient: {
          type,
          points,
        },
      }),
    onClose() {
      dialog = undefined
      dialogOption?.onClose?.()
    },
  })
}

const open = (option: ColorPickerOption & Partial<Props>) => {
  if (!dialog) {
    dialog = appInstance.editor.service.invokeFunction(openDialog, option)
  }
  return dialogClose
}

const ColorPicker = Object.assign(_ColorPicker, { open, close: dialogClose })

export default ColorPicker
