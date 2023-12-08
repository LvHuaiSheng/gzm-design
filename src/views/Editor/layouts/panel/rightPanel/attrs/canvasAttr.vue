<script setup lang="ts">
import Panel from './panel.vue'
import {useActiveObjectModel} from '@/views/Editor/hooks/useActiveObjectModel'
import {useEditor} from '@/views/Editor/app'
import {useColor} from '@/views/Editor/hooks/useActiveObjectColor'
import {watch} from "vue";
import SwipeNumber from "@/components/swipeNumber/swipeNumber.vue";

const {canvas} = useEditor()

const rotation = useActiveObjectModel('rotation')
const width = useActiveObjectModel('width')
const height = useActiveObjectModel('height')
const fill = useActiveObjectModel('fill')
const overflow = useActiveObjectModel('overflow')

const {formatValue, colorBlock, changeColor, closeColorPicker, openColorPicker, readonly} =
    useColor(
        computed(() => fill.value.modelValue),
        {
            attr: 'fill',
            onChange() {
                fill.value.onChange(fillArray.value)
            },
        },
    )

watch(canvas.activeObject, () => closeColorPicker())


const fillArray = ref([])
watchEffect(() => {
    if (fill.value.modelValue) {
        fillArray.value = <any>fill.value.modelValue
    } else {
        fillArray.value = []
    }
})

const refreshFill = () => {
    fill.value.onChange([])
    fill.value.onChange(fillArray.value.length <= 0 ? [] : fillArray.value)
}
const addFill = () => {
    fill.value.onChange([])
    fillArray.value.push({
        type: 'solid',
        color: 'rgba(151,151,151,1)',
    })
    refreshFill()
}
const removeFill = (index) => {
    fillArray.value.splice(index, 1)
    refreshFill()
}
const overflowCheck = ref(false)

watchEffect(() => {
    if (overflow.value.modelValue === 'hide') {
        overflowCheck.value = true
    } else {
        overflowCheck.value = false
    }
})

watchEffect(() => {
    if (overflowCheck.value) {
        overflow.value.onChange('hide')
    } else {
        overflow.value.onChange('show')
    }
})
</script>

<template>
    <div>
        <div class="p2">
            <a-row :gutter="[4, 4]" align="center">
                <a-col :span="10">
                    <SwipeNumber size="small" :min="0.5" label="宽" v-bind="width"/>
                </a-col>
                <a-col :span="10">
                    <SwipeNumber size="small" :min="0.5" label="高" v-bind="height"/>
                </a-col>
                <a-col :span="16">
                    <a-checkbox v-model="overflowCheck">超出画布隐藏</a-checkbox>
                </a-col>
<!--                <a-col :span="10">-->
<!--                    <SwipeNumber size="small" v-bind="rotation">-->
<!--                        <template #label>-->
<!--                            <SvgIcon name="bx-revision"/>-->
<!--                        </template>-->
<!--                        <template #suffix>-->
<!--                            <div class="absolute top-1 right-1">°</div>-->
<!--                        </template>-->
<!--                    </SwipeNumber>-->
<!--                </a-col>-->
            </a-row>
        </div>
        <Panel
                title="背景"
                @click-add="addFill"
        >
            <a-space direction="vertical">
                <a-row :gutter="[8, 4]" v-for="(item,index) in fillArray" :key="index">
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
                        <a-button size="small" class="icon-btn" v-if="index!==0" @click="removeFill(index)">
                            <template #icon>
                                <icon-minus/>
                            </template>
                        </a-button>
                    </a-col>
                </a-row>
            </a-space>
        </Panel>
    </div>
</template>

<style scoped lang="less"></style>
