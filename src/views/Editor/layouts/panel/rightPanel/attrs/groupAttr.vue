<script setup lang="ts">
import Panel from './panel.vue'
import {useActiveObjectModel} from '@/views/Editor/hooks/useActiveObjectModel'
import {useEditor} from '@/views/Editor/app'
import TipContentKey from "@/components/tooltip/tipContentKey.vue";
// import {useFonts} from "@/hooks/useFonts";
// const IconFont = useFonts()
const {canvas} = useEditor()

const overflow = useActiveObjectModel('overflow')
const children = computed(() => {
    const {activeObject} = canvas
    if (!activeObject.value) {
        return []
    } else {
        return activeObject.value.children
    }
})
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
        <Panel hidden-add>
            <template #title>
                <div>
                    组内元素
                    <a-tooltip mini position="bottom">
                        <icon-question-circle class="cursor-pointer" :size="14" style="color: rgb(var(--primary-6))"/>
                        <template #content>
                            <a-divider orientation="left">显隐</a-divider>
                            <p>显示或隐藏此元素</p>
                            <a-divider orientation="left">遮罩</a-divider>
                            <p>元素设为遮罩后，自身不渲染（裁剪类型除外），所在组内的上层元素受此遮罩影响。</p>
                            <a-divider orientation="left">擦除</a-divider>
                            <p>元素设为橡皮擦后，自身不渲染，所在组内的下层元素会被它擦除。</p>
                            <a-divider orientation="left"></a-divider>
                            <p>注意：启用遮罩功能的元素将作为组的基准宽高，如需实现ps的多层蒙版和裁剪效果 请使用多个组嵌套实现</p>
                        </template>
                    </a-tooltip>
                </div>
            </template>
            <a-space direction="vertical" style="width: 100%">
                <a-row :gutter="[8, 4]">
                    <a-col :span="24">
                        <div style="width: 100%; padding: 2px;max-height: 500px; overflow: auto">
                            <a-tree
                                    :data="children"
                            >
                                <template #title="nodeData">
                                    <span>{{ nodeData.name }}</span>
                                </template>
                                <template #extra="nodeData">
                                    <div style="position: absolute; right: 8px; font-size: 12px; color: #3370ff;">
                                        <a-tooltip mini position="bottom" content="显隐">
                                            <a-button size="small" class="icon-btn"
                                                      @click="nodeData.visible = !nodeData.visible">
                                                <template #icon>
                                                    <icon-eye v-if="nodeData.visible === true"/>
                                                    <icon-eye-invisible v-else/>
                                                </template>
                                            </a-button>
                                        </a-tooltip>
                                        <a-tooltip mini position="bottom" content="遮罩">
                                            <a-button size="small" class="icon-btn"
                                                      @click="nodeData.mask = !nodeData.mask">
                                                <template #icon>
                                                    <ali-icon type="icon-zhezhao" :class="{'arco-icon-check':nodeData.mask}"/>
                                                </template>
                                            </a-button>
                                        </a-tooltip>
                                        <a-tooltip mini position="bottom" content="擦除">
                                            <a-button size="small" class="icon-btn"
                                                      @click="nodeData.eraser = !nodeData.eraser">
                                                <template #icon>
                                                    <ali-icon type="icon-cachu" :class="{'arco-icon-check':nodeData.eraser}"/>
                                                </template>
                                            </a-button>
                                        </a-tooltip>
                                    </div>
                                </template>
                            </a-tree>
                        </div>
                    </a-col>
                    <a-col :span="24">

                    </a-col>
                </a-row>
            </a-space>
        </Panel>
    </div>
</template>

<style scoped lang="less">
</style>
