<script setup lang="ts">
import Panel from './panel.vue'
import {useActiveObjectModel} from '@/views/Editor/hooks/useActiveObjectModel'
import {useEditor} from '@/views/Editor/app'
import SwipeNumber from '@/components/swipeNumber'
import type {SelectProps} from '@arco-design/web-vue/es/select'
import {useColor} from '@/views/Editor/hooks/useActiveObjectColor'
import {watch} from "vue";

const {canvas} = useEditor()

const stroke = useActiveObjectModel('stroke')
const strokeWidth = useActiveObjectModel('strokeWidth')
const strokeAlign = useActiveObjectModel<'strokeAlign', SelectProps['modelValue']>('strokeAlign')
const strokeJoin = useActiveObjectModel<'strokeJoin', SelectProps['modelValue']>('strokeJoin')
const strokeCap = useActiveObjectModel<'strokeCap', SelectProps['modelValue']>('strokeCap')

const {formatValue, colorBlock, changeColor, closeColorPicker, openColorPicker, readonly} =
    useColor(
        computed(() => stroke.value.modelValue),
        {
            attr: 'stroke',
            onChange() {
                stroke.value.onChange(strokeArray.value)
            },
        },
    )

watch(canvas.activeObject, () => closeColorPicker())

const options = reactive([
    {
        value: 'inside',
        label: '内部',
    },
    {
        value: 'center',
        label: '居中',
    },
    {
        value: 'outside',
        label: '外部',
    },
])

const strokeJoinOptions = reactive([
    {
        value: 'miter',
        label: '直角',
    },
    {
        value: 'bevel',
        label: '平角',
    },
    {
        value: 'round',
        label: '圆角',
    },
])
const strokeCapOptions = reactive([
    {
        value: 'none',
        label: '无',
    },
    {
        value: 'round',
        label: '圆形',
    },
    {
        value: 'square',
        label: '方形',
    },
])

const strokeArray = ref([])
watchEffect(() => {
    if (stroke.value.modelValue) {
        strokeArray.value = <any>stroke.value.modelValue
    } else {
        strokeArray.value = []
    }
})

const refreshStroke = () => {
    stroke.value.onChange([])
    stroke.value.onChange(strokeArray.value.length <= 0 ? [] : strokeArray.value)
}

const addStroke = () => {
    strokeArray.value.push({
        type: 'solid',
        color: 'rgba(151,151,151,1)',
    })
    refreshStroke()
}
const removeStroke = (index) => {
    strokeArray.value.splice(index, 1)
    refreshStroke()
}

</script>

<template>
    <Panel
            title="描边"
            @click-add="addStroke"
    >
        <a-space direction="vertical">
            <a-row v-if="strokeArray.length > 0" :gutter="[4, 4]">
                <a-col :span="10">
                    <SwipeNumber size="small" :min="1" label="宽" v-bind="strokeWidth" :hide-button="false"/>
                </a-col>
                <a-col :span="12">
                    <a-select
                            size="small"
                            v-bind="strokeJoin"
                            :options="strokeJoinOptions"
                    >
                        <template #prefix>
                            拐角
                        </template>
                    </a-select>
                </a-col>
                <a-col :span="12">
                    <a-select
                            size="small"
                            v-bind="strokeAlign"
                            :options="options"
                    >
                        <template #prefix>
                            对齐
                        </template>
                    </a-select>
                </a-col>
                <a-col :span="12">
                    <a-select
                            size="small"
                            v-bind="strokeCap"
                            :options="strokeCapOptions"
                    >
                        <template #prefix>
                            端点
                        </template>
                    </a-select>
                </a-col>
            </a-row>
            <a-row :gutter="[8, 4]" v-for="(item,index) in strokeArray" :key="index">
                <a-col :span="20">
                    <a-col :span="20">
                        <a-input
                                 size="mini"
                                 :model-value="formatValue(index)"
                                 :readonly="readonly"
                                 @change="changeColor"
                                 class="pl0!"
                        >
                            <template #prefix>
                                <a-button size="mini" class="icon-btn" @click="openColorPicker(index)">
                                    <template #icon>
                                        <div v-bind="colorBlock(index)"></div>
                                    </template>
                                </a-button>
                            </template>
                        </a-input>
                    </a-col>
                </a-col>
                <a-col :span="3.5" class="mlauto">
                    <a-button size="small" class="icon-btn" @click="removeStroke(index)">
                        <template #icon>
                            <icon-minus/>
                        </template>
                    </a-button>
                </a-col>
            </a-row>
        </a-space>
    </Panel>
</template>

<style scoped lang="less"></style>
