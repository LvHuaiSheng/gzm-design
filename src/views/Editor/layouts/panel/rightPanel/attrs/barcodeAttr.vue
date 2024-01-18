<script setup lang="ts">
import Panel from './panel.vue'
import {useActiveObjectModel} from '@/views/Editor/hooks/useActiveObjectModel'
import type {SelectProps} from '@arco-design/web-vue/es/select'
import {useEditor} from '@/views/Editor/app'
import SwipeNumber from "@/components/swipeNumber/swipeNumber.vue";

const textValue = useActiveObjectModel('text')
const margin = useActiveObjectModel('margin')
const codeHeight = useActiveObjectModel('codeHeight')
const codeUnitWidth = useActiveObjectModel('codeUnitWidth')
const format = useActiveObjectModel<'format', SelectProps['modelValue']>('format')
const textAlign = useActiveObjectModel<'textAlign', SelectProps['modelValue']>('textAlign')
const textPosition = useActiveObjectModel<'textPosition', SelectProps['modelValue']>('textPosition')
const textMargin = useActiveObjectModel('textMargin')
const fontSize = useActiveObjectModel('fontSize')
const background = useActiveObjectModel('background')
const lineColor = useActiveObjectModel('lineColor')

const {canvas} = useEditor()

const newTextVal = ref()
const lineColorVal = ref()
const backgroundVal = ref()
watchEffect(() => {
    newTextVal.value = textValue.value.modelValue
    backgroundVal.value = background.value.modelValue
    lineColorVal.value = lineColor.value.modelValue
})
watchEffect(() => {
    textValue.value.onChange(newTextVal.value)
    background.value.onChange(backgroundVal.value)
    lineColor.value.onChange(lineColorVal.value)
})

const formatOptions = reactive([
    {
        label: 'AUTO',
        isGroup:true,
        options:[
            {label: 'CODE128', value: 'CODE128', info: 'CODE 128是一种多功能条形码。它支持所有128个ASCII字符，但也有效地编码数字。它有三种模式（A/B/C），但可以随时在它们之间切换'},
        ]
    },
    {
        label: 'EAN',
        isGroup:true,
        options:[
            {label: 'EAN-13', value: 'EAN13', info: 'EAN有多种形式，最常用的是EAN-13（GTIN-13），在世界范围内用于标识产品的身份'},
            {label: 'EAN-8', value: 'EAN8'},
            {label: 'EAN-5', value: 'EAN5'},
            {label: 'EAN-2', value: 'EAN2'},
        ]
    },
    {
        label: 'UPC',
        isGroup:true,
        options:[
            {label: 'UPC(A)', value: 'UPC'},
            {label: 'UPC(E)', value: 'EAN-13'},
        ]
    },
    {
        label: 'ITF',
        isGroup:true,
        options:[
            {label: 'ITF', value: 'ITF'},
            {label: 'ITF-14', value: 'ITF14'},
        ]
    },
    {
        label: 'MSI',
        isGroup:true,
        options:[
            {label: 'MSI', value: 'MSI'},
            {label: 'MSI-10', value: 'MSI10'},
            {label: 'MSI-11', value: 'MSI11'},
            {label: 'MSI-1010', value: 'MSI1010'},
            {label: 'MSI-1110', value: 'MSI1110'},
        ]
    },
    {
        label: 'CODE39',
        isGroup:true,
        options:[
            {label: 'CODE39', value: 'CODE39'},
        ]
    },
    {
        label: 'Pharmacode',
        isGroup:true,
        options:[
            {label: 'Pharmacode', value: 'pharmacode'},
        ]
    },
    {
        label: 'Codabar',
        isGroup:true,
        options:[
            {label: 'Codabar', value: 'codabar'},
        ]
    },
])
const textAlignOptions = reactive([
    {
        value: 'left',
        label: '左对齐',
    },
    {
        value: 'center',
        label: '居中对齐',
    },
    {
        value: 'right',
        label: '右对齐',
    },
])
const textPositionOptions = reactive([
    {
        value: 'bottom',
        label: '底部',
    },
    {
        value: 'top',
        label: '顶部',
    },
])

</script>

<template>
    <div>
        <Panel title="条码内容" hidden-add>
            <a-row :wrap="false" :gutter="[4, 4]" align="center">
                <a-col>
                    <a-textarea
                            v-model="newTextVal"
                            placeholder="请输入一些内容"
                            :auto-size="{
                            minRows:3,
                          }"/>
                </a-col>
            </a-row>
        </Panel>
        <Panel title="条码设置" hidden-add>
            <a-space direction="vertical" size="mini">
                <a-col :span="20">
                    <a-select
                            size="small"
                            placeholder=""
                            v-bind="{...format}"
                            :options="formatOptions"
                    >
                        <template #prefix>
                            编码格式
                        </template>
                    </a-select>
                </a-col>
                <a-row :gutter="[4, 4]" align="center">
                    <a-col :span="12">
                        <SwipeNumber size="small" v-bind="codeHeight" :step="1" style="padding: 0 6px" label-class="text-left" label-width="45px">
                            <template #label>
                                <div>码高度</div>
                            </template>
                        </SwipeNumber>
                    </a-col>
                    <a-col :span="12">
                        <SwipeNumber size="small" v-bind="margin" :step="1" style="padding: 0 6px" label-class="text-left" label-width="45px">
                            <template #label>
                                <div>码边距</div>
                            </template>
                        </SwipeNumber>
                    </a-col>
                    <a-col :span="20">
                        <SwipeNumber size="small" v-bind="codeUnitWidth" :min="1" :step="1" style="padding: 0 6px" label-class="text-left" label-width="90px">
                            <template #label>
                                <div>条码单线间隔</div>
                            </template>
                        </SwipeNumber>
                    </a-col>
                    <a-col :span="20">
                        <a-select
                                size="small"
                                placeholder=""
                                v-bind="{...textAlign}"
                                :options="textAlignOptions"
                        >
                            <template #prefix>
                                文字对齐方式
                            </template>
                        </a-select>
                    </a-col>
                    <a-col :span="20">
                        <a-select
                                size="small"
                                placeholder=""
                                v-bind="{...textPosition}"
                                :options="textPositionOptions"
                        >
                            <template #prefix>
                                文字位置
                            </template>
                        </a-select>
                    </a-col>
                    <a-col :span="12">
                        <SwipeNumber size="small" v-bind="fontSize" :step="1" style="padding: 0 6px" label-class="text-left" label-width="60px">
                            <template #label>
                                <div>文字大小</div>
                            </template>
                        </SwipeNumber>
                    </a-col>
                    <a-col :span="12">
                        <SwipeNumber size="small" v-bind="textMargin" :step="1" style="padding: 0 6px" label-class="text-left" label-width="60px">
                            <template #label>
                                <div>文字边距</div>
                            </template>
                        </SwipeNumber>
                    </a-col>
                    <a-col :span="20">
                        <a-input
                                size="mini"
                                v-model="lineColorVal"
                        >
                            <template #prefix>
                                码颜色
                            </template>
                        </a-input>
                    </a-col>
                    <a-col :span="20">
                        <a-input
                                size="mini"
                                v-model="backgroundVal"
                        >
                            <template #prefix>
                                背景色
                            </template>
                        </a-input>
                    </a-col>
                </a-row>
            </a-space>
        </Panel>
    </div>
</template>

<style scoped lang="less"></style>
