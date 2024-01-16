<script setup lang="ts">
import Panel from './panel.vue'
import {useActiveObjectModel} from '@/views/Editor/hooks/useActiveObjectModel'
import type {SelectProps} from '@arco-design/web-vue/es/select'
import {popupMaxHeight} from '@/utils/arco'
import {useEditor} from '@/views/Editor/app'
import TipContentKey from "@/components/tooltip/tipContentKey.vue";
import SwipeNumber from "@/components/swipeNumber/swipeNumber.vue";

const fontFamily = useActiveObjectModel<'fontFamily', SelectProps['modelValue']>('fontFamily')
const fontSize = useActiveObjectModel<'fontSize', SelectProps['modelValue']>('fontSize') // 字号
const textWrap = useActiveObjectModel<'textWrap', SelectProps['modelValue']>('textWrap') // 文本换行规则
const lineHeight = useActiveObjectModel('lineHeight') // 行号
const letterSpacing = useActiveObjectModel('letterSpacing') // 字距
const textAlign = useActiveObjectModel('textAlign')
const verticalAlign = useActiveObjectModel('verticalAlign')
const italic = useActiveObjectModel('italic') // 文字是否倾斜
const textDecoration = useActiveObjectModel('textDecoration')
const textOverflow = useActiveObjectModel('textOverflow')

const textValue = useActiveObjectModel('text')
const options = useActiveObjectModel('options')

const padding = useActiveObjectModel('padding', [0, 0, 0, 0])
// 文字粗细
const fontWeight = useActiveObjectModel<
    'fontWeight',
    SelectProps['modelValue']
>('fontWeight')

const textStyle = ref()

const {canvas} = useEditor()

const newTextVal = ref()
const errorCorrectionLevel = ref()
watchEffect(() => {
    newTextVal.value = textValue.value.modelValue
})
watchEffect(() => {
    textValue.value.onChange(newTextVal.value)
})
watchEffect(() => {
    console.log('options',options)
    errorCorrectionLevel.value = options.value.modelValue?.errorCorrectionLevel
})
watchEffect(() => {
    options.value.onChange({...options,errorCorrectionLevel:errorCorrectionLevel.value})
})

const errorCorrectionLevelOptions = reactive([
    {
        value: 'H',
        label: '7%',
    },
    {
        value: 'M',
        label: '15% ',
    },
    {
        value: 'Q',
        label: '25%',
    },
    {
        value: 'H',
        label: '30%',
    },
])
</script>

<template>
    <div>
        <Panel title="二维码内容" hidden-add>
            <a-row :wrap="false" :gutter="[4, 4]" align="center">
                <a-col>
                    <a-textarea
                            v-model="newTextVal"
                            placeholder="请输入一些内容"
                            :auto-size="{
                            minRows:4,
                          }"/>
                </a-col>
            </a-row>
        </Panel>
        <Panel title="二维码边距" hidden-add>
            <a-row :gutter="[4, 4]" align="center">
                <a-col :span="12">
                    <a-select
                            size="small"
                            v-bind="errorCorrectionLevel"
                            :options="errorCorrectionLevelOptions"
                    >
                        <template #prefix>
                            容错率
                        </template>
                    </a-select>
                </a-col>
<!--                <a-col :span="10">-->
<!--                    <SwipeNumber size="small" :min="0" label="边距" v-bind="margin" />-->
<!--                </a-col>-->
<!--                <a-col :span="10">-->
<!--                    <SwipeNumber size="small" :min="0" label="缩放率" v-bind="scale" />-->
<!--                </a-col>-->
            </a-row>
        </Panel>
    </div>
</template>

<style scoped lang="less"></style>
