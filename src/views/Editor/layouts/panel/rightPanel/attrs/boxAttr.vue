<script setup lang="ts">
import Panel from './panel.vue'
import {useActiveObjectModel} from '@/views/Editor/hooks/useActiveObjectModel'
import {useEditor} from '@/views/Editor/app'

const {canvas} = useEditor()

const overflow = useActiveObjectModel('overflow')

const overflowOptions = reactive(
    [
        {
            value: 'show',
            label: '显示',
        },
        {
            value: 'hide',
            label: '隐藏',
        },
    ]
)
</script>

<template>
    <div>
        <Panel title="边界" hidden-add>
            <a-row :gutter="[4, 4]" align="center">
                <a-col :span="16">
                    <a-select
                        size="small"
                        placeholder="元素超出边界"
                        v-bind="overflow"
                        :options="overflowOptions"
                    >
                        <template #prefix>
                            元素超出边界
                        </template>
                    </a-select>
                </a-col>

            </a-row>
        </Panel>
        <Panel title="蒙版（待完善）" disable-add hidden-add>
            <a-space direction="vertical">
                <a-row :gutter="[8, 4]">
                    <a-col :span="20">

                    </a-col>
                </a-row>
            </a-space>
        </Panel>
    </div>
</template>

<style scoped lang="less"></style>
