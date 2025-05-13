<script setup lang="ts">
import {isDefined, useResizeObserver} from "@vueuse/core";

import BaseAttr from "./attrs/baseAttr.vue";
import LayerAttr from "./attrs/layerAttr.vue";
import TextAttr from "./attrs/textAttr.vue";
import HtmlTextAttr from "./attrs/htmlTextAttr.vue";
import CanvasAttr from './attrs/canvasAttr.vue'
import BoxAttr from './attrs/boxAttr.vue'
import FillAttr from "./attrs/fillAttr.vue";
import StrokeAttr from "./attrs/strokeAttr.vue";
import ShadowAttr from "./attrs/shadowAttr.vue";
import VirtualElementAttr from "./attrs/virtualElementAttr.vue";
import QrcodeAttr from "./attrs/qrcodeAttr.vue";
import BarcodeAttr from "./attrs/barcodeAttr.vue";
import GroupAttr from "./attrs/groupAttr.vue";
import PenAttr from "./attrs/penAttr.vue";
import {appInstance, useEditor} from "@/views/Editor/app";
import {typeUtil} from "@/views/Editor/utils/utils";
import {useAppStore} from "@/store";

const {editor} = useEditor()
const {activeTool} = storeToRefs(useAppStore())
const splitRef = ref()
const treeHeight = ref(0)

onMounted(() => {
    // 更新tree组件的高度
    useResizeObserver(splitRef.value as HTMLDivElement, (entries) => {
        const [entry] = entries
        const {height} = entry.contentRect
        treeHeight.value = height - 43
    })
})

const componentList = computed(() => {
    const activeObject = editor.activeObject.value
    return [
        {
            name: 'CanvasAttr',
            component: CanvasAttr,
            visual: typeUtil.isBottomCanvas(activeObject),
        },
        {
            name: 'VirtualElementAttr',
            component: VirtualElementAttr,
            visual: typeUtil.isVirtualElement(activeObject),
        },
        {
            name: 'BaseAttr',
            component: BaseAttr,
            visual: !typeUtil.isVirtualOrBottom(activeObject),
        },
        {
            name: 'LayerAttr',
            component: LayerAttr,
            visual: isDefined(activeObject) && !typeUtil.isVirtualOrBottom(activeObject),
        },
        {
            name: 'BoxAttr',
            component: BoxAttr,
            visual: editor.activeObjectIsType('Box'),
        },
        {
            name: 'TextAttr',
            component: TextAttr,
            visual: isDefined(activeObject) && editor.activeObjectIsType('Text'),
        },
        {
            name: 'HtmlTextAttr',
            component: HtmlTextAttr,
            visual: isDefined(activeObject) && editor.activeObjectIsType('HTMLText'),
        },
        {
            name: 'QrcodeAttr',
            component: QrcodeAttr,
            visual:
                isDefined(activeObject)
                &&!typeUtil.isVirtualOrBottom(activeObject)
                && editor.activeObjectIsType('QrCode')
        },
        {
            name: 'BarcodeAttr',
            component: BarcodeAttr,
            visual:
                isDefined(activeObject)
                &&!typeUtil.isVirtualOrBottom(activeObject)
                && editor.activeObjectIsType('BarCode')
        },
        {
            name: 'FillAttr',
            component: FillAttr,
            visual:
                isDefined(activeObject)
                &&!typeUtil.isVirtualOrBottom(activeObject)
                && !editor.activeObjectIsType('Image','Pen','HTMLText','QrCode','BarCode','Group')
                ,
        },
        {
            name: 'StrokeAttr',
            component: StrokeAttr,
            visual:
                isDefined(activeObject)
                &&!typeUtil.isVirtualOrBottom(activeObject)
                && !editor.activeObjectIsType('Pen','Group')
        },
        {
            name: 'ShadowAttr',
            component: ShadowAttr,
            visual:
                isDefined(activeObject)
                &&!typeUtil.isVirtualOrBottom(activeObject)
                && !editor.activeObjectIsType('Pen','Group')
        },
        {
            name: 'GroupAttr',
            component: GroupAttr,
            visual:
                isDefined(activeObject)
                &&!typeUtil.isVirtualOrBottom(activeObject)
                &&typeUtil.isCollection(activeObject)
                && !editor.activeObjectIsType('Pen')
        },
        {
            name: 'PenAttr',
            component: PenAttr,
            visual: activeTool.value === 'pen',
        },
        // 阴影
        // 模糊
    ]
})

const pluginSolts = appInstance.editor.getPluginSlots('rightPanel')
</script>

<template>
    <div
            ref="splitRef"
            class="ovf">
        <div>
            <template v-for="(com, index) in componentList" :key="com.name">
                <template v-if="com.visual">
                    <a-divider v-if="index !== 0" :margin="0" />
                    <component :is="com.component" />
                </template>
            </template>
            <template v-for="(com, index) in pluginSolts" :key="index">
                <a-divider v-if="index !== com.length - 1" :margin="0" />
                <component :is="com" />
            </template>
        </div>
    </div>
</template>

<style scoped lang="less">
.ovf{
    height: calc(100vh - 95px);
    overflow-y: auto;
    overflow-x: hidden;
}
</style>
