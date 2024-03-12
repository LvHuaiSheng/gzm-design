<script setup lang="ts">
import Panel from './panel.vue'
import {useActiveObjectModel} from '@/views/Editor/hooks/useActiveObjectModel'
import {useEditor} from '@/views/Editor/app'
import SwipeNumber from '@/components/swipeNumber'
import type {SelectProps} from '@arco-design/web-vue/es/select'
import {useColor} from '@/views/Editor/hooks/useActiveObjectColor'
import {watch} from "vue";

const {canvas} = useEditor()

const shadow = useActiveObjectModel('shadow')
const innerShadow = useActiveObjectModel('innerShadow')

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


const shadowArray = ref([])
const innerShadowArray = ref([])
watchEffect(() => {
    if (shadow.value.modelValue) {
        shadowArray.value = <any>shadow.value.modelValue
    } else {
        shadowArray.value = []
    }
})
watchEffect(() => {
    if (innerShadow.value.modelValue) {
        innerShadowArray.value = <any>innerShadow.value.modelValue
    } else {
        innerShadowArray.value = []
    }
})

const refreshShadow = () => {
    shadow.value.onChange([])
    shadow.value.onChange(shadowArray.value.length <= 0 ? [] : shadowArray.value)
}

const refreshInnerShadow = () => {
    innerShadow.value.onChange([])
    innerShadow.value.onChange(innerShadowArray.value.length <= 0 ? [] : innerShadowArray.value)
}

const addShadow = () => {
    shadowArray.value.push({
        x: 5,
        y: 5,
        blur: 5,
        spread: 1,
        color: 'rgba(151,151,151,1)',
        box: false,
        visible: true,
    })
    refreshShadow()
}
const removeShadow = (index) => {
    shadowArray.value.splice(index, 1)
    refreshShadow()
}

const addInnerShadow = () => {
    innerShadowArray.value.push({
        x: 5,
        y: 5,
        blur: 5,
        spread: 1,
        color: 'rgba(151,151,151,1)',
        box: false,
        visible: true,
    })
    refreshInnerShadow()
}
const removeInnerShadow = (index) => {
    innerShadowArray.value.splice(index, 1)
    refreshInnerShadow()
}

</script>

<template>
    <div>
        <Panel
                title="外阴影"
                @click-add="addShadow"
        >
            <a-space direction="vertical">
                <a-row v-if="shadowArray.length > 0" :gutter="[4, 4]" v-for="(item,index) in shadowArray" :key="index">
                    <a-col :span="10">
                        <a-switch v-model="item.visible" @change="refreshShadow">
                            <template #checked>显示</template>
                            <template #unchecked>隐藏</template>
                        </a-switch>
                    </a-col>
                    <a-col :span="4" class="mlauto">
                        <a-button size="small" class="icon-btn" @click="removeShadow(index)">
                            <template #icon>
                                <icon-minus/>
                            </template>
                        </a-button>
                    </a-col>
                    <a-col :span="12">
                        <SwipeNumber size="small" v-model="item.x" @swipe="refreshShadow" @change="refreshShadow" style="padding: 0 6px" label-class="text-left" label-width="55px">
                            <template #label>
                                X偏移量
                            </template>
                        </SwipeNumber>
                    </a-col>
                    <a-col :span="12">
                        <SwipeNumber size="small" v-model="item.y" @swipe="refreshShadow" @change="refreshShadow" style="padding: 0 6px" label-class="text-left" label-width="55px">
                            <template #label>
                                Y偏移量
                            </template>
                        </SwipeNumber>
                    </a-col>
                    <a-col :span="12">
                        <SwipeNumber size="small" v-model="item.blur" @swipe="refreshShadow" @change="refreshShadow" style="padding: 0 6px" label-class="text-left" label-width="55px">
                            <template #label>
                                模糊半径
                            </template>
                        </SwipeNumber>
                    </a-col>
                    <a-col :span="12">
                        <SwipeNumber size="small" v-model="item.spread" @swipe="refreshShadow" @change="refreshShadow" style="padding: 0 6px" label-class="text-left" label-width="55px">
                            <template #label>
                                阴影距离
                            </template>
                        </SwipeNumber>
                    </a-col>
                    <a-col :span="20">
                        <a-input
                                size="mini"
                                v-model="item.color"
                        >
                            <template #prefix>
                                阴影颜色
                            </template>
                        </a-input>
                    </a-col>
                    <a-col :span="20">
                        <a-checkbox v-model="item.box" @change="refreshShadow">只显示图形外部的阴影</a-checkbox>
                    </a-col>
                </a-row>
            </a-space>
        </Panel>
        <Panel
                title="内阴影"
                @click-add="addInnerShadow"
        >
            <a-space direction="vertical">
                <a-row v-if="innerShadowArray.length > 0" :gutter="[4, 4]" v-for="(item,index) in innerShadowArray" :key="index">
                    <a-col :span="10">
                        <a-switch v-model="item.visible" @change="refreshInnerShadow">
                            <template #checked>显示</template>
                            <template #unchecked>隐藏</template>
                        </a-switch>
                    </a-col>
                    <a-col :span="4" class="mlauto">
                        <a-button size="small" class="icon-btn" @click="removeInnerShadow(index)">
                            <template #icon>
                                <icon-minus/>
                            </template>
                        </a-button>
                    </a-col>
                    <a-col :span="12">
                        <SwipeNumber size="small" v-model="item.x" @swipe="refreshInnerShadow" @change="refreshInnerShadow" style="padding: 0 6px" label-class="text-left" label-width="55px">
                            <template #label>
                                X偏移量
                            </template>
                        </SwipeNumber>
                    </a-col>
                    <a-col :span="12">
                        <SwipeNumber size="small" v-model="item.y" @swipe="refreshInnerShadow" @change="refreshInnerShadow" style="padding: 0 6px" label-class="text-left" label-width="55px">
                            <template #label>
                                Y偏移量
                            </template>
                        </SwipeNumber>
                    </a-col>
                    <a-col :span="12">
                        <SwipeNumber size="small" v-model="item.blur" @swipe="refreshInnerShadow" @change="refreshInnerShadow" style="padding: 0 6px" label-class="text-left" label-width="55px">
                            <template #label>
                                模糊半径
                            </template>
                        </SwipeNumber>
                    </a-col>
                    <a-col :span="12">
                        <SwipeNumber size="small" v-model="item.spread" @swipe="refreshInnerShadow" @change="refreshInnerShadow" style="padding: 0 6px" label-class="text-left" label-width="55px">
                            <template #label>
                                阴影距离
                            </template>
                        </SwipeNumber>
                    </a-col>
                    <a-col :span="20">
                        <a-input
                                size="mini"
                                v-model="item.color"
                        >
                            <template #prefix>
                                阴影颜色
                            </template>
                        </a-input>
                    </a-col>
                    <a-col :span="20">
                        <a-checkbox v-model="item.box" @change="refreshInnerShadow">只显示图形外部的阴影</a-checkbox>
                    </a-col>
                </a-row>
            </a-space>
        </Panel>
    </div>
</template>

<style scoped lang="less"></style>
