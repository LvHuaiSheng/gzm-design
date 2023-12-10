<script setup lang="ts">
import Panel from './panel.vue'
import {useActiveObjectModel} from '@/views/Editor/hooks/useActiveObjectModel'
import {useEditor} from '@/views/Editor/app'
import SwipeNumber from '@/components/swipeNumber'
const {canvas} = useEditor()

const fill = <object> useActiveObjectModel('fill',null,'default')


const paintModeVal = ref()
const rotation = ref()
const scale = ref()


const hasRotation = computed(() =>{
    return ['cover','fit','repeat'].includes(fill.value.modelValue?.mode)
})


const hasScale = computed(() =>{
    return ['clip','repeat'].includes(fill.value.modelValue?.mode)
})

watchEffect(() => {
    paintModeVal.value = fill.value.modelValue.mode
    if (hasRotation){
        rotation.value = fill.value.modelValue.rotation | 0
    }else {
        rotation.value = 0
    }
    if (hasScale){
        scale.value = fill.value.modelValue.scale * 100  | 100
    }else {
        scale.value = 100
    }
})
watchEffect(() => {
    let val = {
        ...fill.value.modelValue, mode: paintModeVal.value }
    if (hasRotation){
        val.rotation = rotation.value
    }else {
        delete val['rotation']
        rotation.value = 0
    }
    if (hasScale){
        val.scale = scale.value / 100
    }else {
        delete val['scale']
        scale.value = 100
    }
    fill.value.onChange(val)

})

const options = reactive([
    {value: 'cover', label: '覆盖'},
    {value: 'fit', label: '适应'},
    {value: 'strench', label: '拉伸'},
    {value: 'clip', label: '裁剪'},
    {value: 'repeat', label: '平铺'},
])
</script>

<template>
    <Panel
        title="属性"
        hidden-add
    >
        <a-row :gutter="[4, 4]">
            <a-col :span="15">
                <a-select v-model="paintModeVal" :options="options" size="small">
                    <template #prefix>
                        填充模式
                    </template>
                </a-select>
            </a-col>
            <a-col :span="14" v-if="hasRotation">
                <SwipeNumber size="small" v-model="rotation" :step="1" style="padding: 0 6px" label-class="text-left" label-width="66px">
                    <template #label>
                        <div>旋转角度</div>
                    </template>
                    <template #suffix>
                        <div class="absolute top-1 right-1">°</div>
                    </template>
                </SwipeNumber>
            </a-col>
            <a-col :span="14" v-if="hasScale">
                <SwipeNumber size="small" v-model="scale" :step="1" style="padding: 0 6px" label-class="text-left" label-width="66px">
                    <template #label>
                        <div>缩放比例</div>
                    </template>
                    <template #suffix>
                        <div>%</div>
                    </template>
                </SwipeNumber>
            </a-col>
        </a-row>
    </Panel>
</template>

<style scoped lang="less"></style>
