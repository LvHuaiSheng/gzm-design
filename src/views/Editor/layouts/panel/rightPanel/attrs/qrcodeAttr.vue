<script setup lang="ts">
import Panel from './panel.vue'
import {useActiveObjectModel} from '@/views/Editor/hooks/useActiveObjectModel'
import type {SelectProps} from '@arco-design/web-vue/es/select'
import {useEditor} from '@/views/Editor/app'
import SwipeNumber from "@/components/swipeNumber/swipeNumber.vue";


const textValue = useActiveObjectModel('text')
const options = useActiveObjectModel('options')


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
    errorCorrectionLevel.value = options.value.modelValue?.errorCorrectionLevel
})
watchEffect(() => {
    options.value.onChange({...options.value.modelValue, errorCorrectionLevel: errorCorrectionLevel.value})
})

const darkColor = ref()
const lightColor = ref()
watchEffect(() => {
    if (options.value.modelValue?.color.dark) {
        darkColor.value = <any>options.value.modelValue.color.dark
    } else {
        darkColor.value = ''
    }
    if (options.value.modelValue?.color.light) {
        lightColor.value = <any>options.value.modelValue.color.light
    } else {
        lightColor.value = ''
    }
})
watchEffect(() => {
    options.value.onChange({...options.value.modelValue, color: {light:lightColor.value,dark:darkColor.value}})
})
const errorCorrectionLevelOptions = reactive([
    {
        value: 'L',
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
                            minRows:3,
                          }"/>
                </a-col>
            </a-row>
        </Panel>
        <Panel title="二维码设置" hidden-add>

            <a-space direction="vertical" size="mini">
                <a-row :wrap="false" :gutter="[4, 4]" align="center">
                    <a-col flex="none">
                        <a-select
                                size="small"
                                v-model="errorCorrectionLevel"
                                :options="errorCorrectionLevelOptions"
                        >
                            <template #prefix>
                                容错率
                            </template>
                        </a-select>
                    </a-col>
                </a-row>
                <a-row :gutter="[4, 4]" align="center">
                    <a-col :span="15">
                        <SwipeNumber size="small" v-model="options.modelValue.margin" :step="1" style="padding: 0 6px" label-class="text-left" label-width="45px">
                            <template #label>
                                <div>码边距</div>
                            </template>
                        </SwipeNumber>
                    </a-col>
                    <a-col :span="20">
                        <a-input
                                size="mini"
                                v-model="darkColor"
                        >
                            <template #prefix>
                                码颜色(hex)
                            </template>
                        </a-input>
                    </a-col>
                    <a-col :span="20">
                        <a-input
                                size="mini"
                                v-model="lightColor"
                        >
                            <template #prefix>
                                码背景色(hex)
                            </template>
                        </a-input>
                    </a-col>
                </a-row>
            </a-space>
        </Panel>
    </div>
</template>

<style scoped lang="less"></style>
