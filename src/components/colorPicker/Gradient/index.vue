<!--
 * @Descripttion:
 * @version:
 * @Author: June
 * @Date: 2023-03-19 20:10:11
 * @LastEditors: June
 * @LastEditTime: 2023-05-12 22:58:54
-->
<template>
    <GradientControls
            v-if="!solidColor"
            :type="state.gradientType"
            :change-gradient-control="changeGradientControl"
    />

    <template v-if="state.gradientType === 'pattern'">
        <div class="pattern-box">
            <div class="upload-box">
                <m-a-upload :prefix="baseUrl"
                            list-type="picture-card"
                            :action="baseUrl+'/upload'"
                            v-model="image"
                            :limit="1"
                            imagePreview
                            :onSuccess="patternUploadSuccess"
                            accept=".png,.jpg,.jpeg"/>

<!--                <a-upload-->
<!--                    list-type="picture-card"-->
<!--                    image-preview-->
<!--                    :limit="1"-->
<!--                    :onSuccess="patternUploadSuccess"-->
<!--                    :onError="patternUploadError"-->
<!--                    :on-before-upload="patternUpload"-->
<!--                />-->
            </div>
            <a-row>
                <a-col>
                    <a-select v-model="fit" :options="options">
                        <template #prefix>
                            填充模式
                        </template>
                    </a-select>
                </a-col>
            </a-row>
            <a-row>
                <a-col>
                    <SwipeNumber size="small" v-model="newOpacity" :min="0" :max="100" :step="1" style="padding: 0 12px" label-width="68px">
                        <template #label>
                            <div style="text-align: right;padding-right: 12px"><icon-mosaic style="margin-right: 2px"/>透明度</div>
                        </template>
                        <template #suffix>
                            <div class="absolute top-1 right-1">%</div>
                        </template>
                    </SwipeNumber>
                </a-col>
            </a-row>

        </div>
    </template>
    <template v-else>
        <Area
                :red="state.colorRed"
                :green="state.colorGreen"
                :blue="state.colorBlue"
                :alpha="state.colorAlpha"
                :hue="state.colorHue"
                :saturation="state.colorSaturation"
                :value="state.colorValue"
                :update-color="updateColor"
                :is-gradient="true"
                :type="state.gradientType"
                :points="state.gradientPoints"
                :active-point-index="state.activePointIndex"
                :change-gradient-control="changeGradientControl"
                :change-active-point-index="changeActivePointIndex"
                :update-gradient-left="updateGradientLeft"
                :add-point="addPoint"
                :remove-point="removePoint"
        />
        <Preview
                :red="state.colorRed"
                :green="state.colorGreen"
                :blue="state.colorBlue"
                :alpha="state.colorAlpha"
                :update-color="updateColor"
                :mode="mode"
        />
    </template>
</template>

<script lang="ts" setup>
import {reactive, onMounted, onBeforeUnmount} from 'vue'
import GradientControls from './GradientControls/index.vue'
import Preview from '../Preview/index.vue'
import Area from '../Area/index.vue'
import {clamp} from '@vueuse/core'
import {ColorType, Props} from '@/components/colorPicker/interface'
import {RGBA} from '@/utils/color'
import {Color} from '@/utils/color/color'
import {useActiveObjectModel} from '@/views/Editor/hooks/useActiveObjectModel'
import {useEditor} from '@/views/Editor/app'
import {typeUtil} from "@/views/Editor/utils/utils";
import MAUpload from "@/components/upload/m-a-upload.vue";
import {replaceElementToNewArr} from "@/utils/utils";
import SwipeNumber from "@/components/swipeNumber/swipeNumber.vue";
import NP from "number-precision";
const baseUrl = import.meta.env.VITE_UPLOAD_BASE_URL;
const {canvas, undoRedo} = useEditor()
const options = reactive([
    {value: 'cover', label: '覆盖'},
    {value: 'fit', label: '适应'},
    {value: 'strench', label: '拉伸'},
    {value: 'clip', label: '裁剪'},
    {value: 'repeat', label: '平铺'},
])
const props = defineProps<Required<Props>>()

const state = reactive({
    attr: props.attr,
    index: props.index,
    activePointIndex: 0,
    gradientPoints: props.gradient.points,
    activePoint: props.gradient.points[0],
    colorRed: props.gradient.points[0].red,
    colorGreen: props.gradient.points[0].green,
    colorBlue: props.gradient.points[0].blue,
    colorAlpha: props.gradient.points[0].alpha,
    colorHue: 0,
    colorSaturation: 1,
    colorValue: 1,
    gradientType: props.gradient.type,
})

const object = useActiveObjectModel(state.attr)
const fit = computed({
    get() {
        if (typeUtil.isPattern(object.value.modelValue[state.index])) {
            return object.value.modelValue[state.index].mode
        }
    },
    set(value) {
        if (typeUtil.isPattern(object.value.modelValue[state.index]) && value) {
            // 这里使用新数组，因为leafer是浅监听的 修改数组值无法监听到并重新渲染
            const elementVal : any= object.value.modelValue[state.index]
            const newElement = replaceElementToNewArr(object.value.modelValue,state.index,{
                ...elementVal,
                mode: value,
            })
            object.value.onChange(newElement)
        }
    },
})
const newOpacity = computed({
    get() {
        if (typeUtil.isPattern(object.value.modelValue[state.index])) {
            let opacity = 100
            if (object.value.modelValue[state.index].opacity !== undefined){
                opacity = NP.round((object.value.modelValue[state.index].opacity * 100),2)
            }
            return opacity
        }
    },
    set(value) {
        if (typeUtil.isPattern(object.value.modelValue[state.index]) && value !== undefined) {
            // 这里使用新数组，因为leafer是浅监听的 修改数组值无法监听到并重新渲染
            const elementVal : any= object.value.modelValue[state.index]
            const newElement = replaceElementToNewArr(object.value.modelValue,state.index,{
                ...elementVal,
                opacity: NP.round((value / 100),2),
            })
            object.value.onChange(newElement)
        }
    },
})
const image = computed({
    get() {
        if (typeUtil.isPattern(object.value.modelValue[state.index])) {
            return object.value.modelValue[state.index].url
        }
    },
    set(value) {
        if (typeUtil.isPattern(object.value.modelValue[state.index]) && value) {
            // 这里使用新数组，因为leafer是浅监听的 修改数组值无法监听到并重新渲染
            let elementVal : any= object.value.modelValue[state.index]
            if (!elementVal.mode){
                elementVal.mode = 'cover'
            }
            const newElement = replaceElementToNewArr(object.value.modelValue,state.index,{
                ...elementVal,
                url: value,
            })
            object.value.onChange(newElement)
        }
    },
})


const getChangeData = () => ({
    points:
        state.gradientType === 'color'
            ? [state.gradientPoints[state.activePointIndex]]
            : state.gradientPoints,
    type: state.gradientType,
    // style: generateGradientStyle(state.gradientPoints, state.gradientType),
})

const onChange = () => {
    props.onChange && props.onChange(getChangeData())
}

const removePoint = (index = state.activePointIndex) => {
    if (state.gradientPoints.length <= 2) {
        return
    }

    state.gradientPoints.splice(index, 1)

    if (index > 0) {
        state.activePointIndex = index - 1
    }

    onChange()
}

const keyUpHandler = (event: KeyboardEvent) => {
    if (event.keyCode === 46 || event.keyCode === 8) {
        removePoint(state.activePointIndex)
    }
}

const changeActivePointIndex = (index: number) => {
    state.activePointIndex = index
    state.activePoint = state.gradientPoints[index]
    const {red, green, blue, alpha} = state.activePoint
    state.colorRed = red
    state.colorGreen = green
    state.colorBlue = blue
    state.colorAlpha = alpha

    const color = new Color(`rgba(${red},${green},${blue},alpha)`)
    const {h, s, v} = color.getHsva()

    state.colorHue = h
    state.colorSaturation = s
    state.colorValue = v
}

const changeGradientControl = (type: ColorType) => {
    type = type ?? state.gradientType

    state.gradientType = type

    onChange()
}

const updateColor = (
    {
        r,
        g,
        b,
        a,
        hue,
        saturation,
        value,
    }: {
        r?: number
        g?: number
        b?: number
        a?: number
        hue?: number
        saturation?: number
        value?: number
    },
    actionName: 'onStartChange' | 'onChange' | 'onEndChange' = 'onChange',
) => {
    r = r ?? state.colorRed
    g = g ?? state.colorGreen
    b = b ?? state.colorBlue
    a = a ?? state.colorAlpha
    hue = hue ?? state.colorHue
    saturation = saturation ?? state.colorSaturation
    value = value ?? state.colorValue

    const localGradientPoints = state.gradientPoints.slice()

    localGradientPoints[state.activePointIndex] = {
        ...localGradientPoints[state.activePointIndex],
        red: r,
        green: g,
        blue: b,
        alpha: a,
    }

    state.colorRed = r
    state.colorGreen = g
    state.colorBlue = b
    state.colorAlpha = a
    state.colorHue = hue
    state.colorSaturation = saturation
    state.colorValue = value
    state.gradientPoints = localGradientPoints

    const action = props[actionName]

    action && action(getChangeData())
}

const updateGradientLeft = (
    left: number,
    index: number,
    actionName: 'onStartChange' | 'onChange' | 'onEndChange' = 'onChange',
) => {
    state.gradientPoints[index].left = clamp(left, 0, 100)

    const action = props[actionName]

    action && action(getChangeData())
}

const addPoint = (left: number) => {
    left = clamp(left, 0, 100)
    state.gradientPoints.push({
        ...state.gradientPoints[state.activePointIndex],
        left,
        // todo
        alpha: 1,
    })

    state.activePointIndex = state.gradientPoints.length - 1

    onChange()
}
const patternUploadSuccess = (response: any) => {
  console.log('response=',response)
}
const patternUploadError = (response: any) => {
  console.log('response=',response)
}
const patternUpload = (files: File[]) => {
    console.log('files=',files)
  // uploadFile().then(value => {
      // files
  // })
}

onMounted(() => {

    const color = new Color(`rgba(${state.colorRed},${state.colorGreen},${state.colorBlue},1)`)
    // const color = new Color(new RGBA(state.colorRed, state.colorGreen, state.colorBlue, 1))
    const {h, s, v} = color.getHsva()

    state.colorHue = h
    state.colorSaturation = s
    state.colorValue = v
    document.addEventListener('keyup', keyUpHandler)
})

onBeforeUnmount(() => {
    document.removeEventListener('keyup', keyUpHandler)
})
</script>
