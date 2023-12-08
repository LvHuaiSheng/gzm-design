<script setup lang="ts">
import SwipeNumber from '@/components/swipeNumber'
import SvgIcon from '@/components/svgIcon'
import {useActiveObjectModel} from "@/views/Editor/hooks/useActiveObjectModel";
import TipContentKey from '@/components/tooltip/tipContentKey.vue'
import {useEditor} from "@/views/Editor/app";
import {isDefined} from '@vueuse/core'

const { keybinding, editor, undoRedo } = useEditor()
const data = editor.getActiveObject()
const x = useActiveObjectModel('x')
const y = useActiveObjectModel('y')
const rotation = useActiveObjectModel('rotation')
const width = useActiveObjectModel('width')
const height = useActiveObjectModel('height')
const rx = useActiveObjectModel('skewX')
const ry = useActiveObjectModel('skewY')

</script>

<template>
    <div class="p2">
        <a-row :gutter="[4, 4]" align="center">
            <a-col :span="10">
                <SwipeNumber size="small" label="X" v-bind="x"></SwipeNumber>
            </a-col>
            <a-col :span="10">
                <SwipeNumber size="small" label="Y" v-bind="y" />
            </a-col>
            <a-col :span="10" v-if="!editor.activeObjectIsType('Group','Pen')">
                <SwipeNumber size="small" :min="0.5" label="宽" v-bind="width" />
            </a-col>
            <a-col :span="10" v-if="!editor.activeObjectIsType('Group','Pen')">
                <SwipeNumber size="small" :min="0.5" label="高" v-bind="height" />
            </a-col>
            <a-col :span="10">
                <SwipeNumber size="small" v-bind="rotation">
                    <template #label>
                        <SvgIcon name="bx-revision" />
                    </template>
                    <template #suffix>
                        <div class="absolute top-1 right-1">°</div>
                    </template>
                </SwipeNumber>
            </a-col>
            <a-col :span="8">
                <a-space size="mini">
                    <a-tooltip mini position="bottom">
                        <a-button
                                size="small"
                                v-if="!editor.activeObjectIsType('Pen')"
                                :disabled="!isDefined(editor.activeObject)"
                                @click="keybinding.trigger('shift+h')"
                        >
                            <template #icon>
                                <SvgIcon name="bx-reflect-vertical" />
                            </template>
                        </a-button>
                        <template #content>
                            <TipContentKey content="水平翻转" :keys="['Shift', 'H']" />
                        </template>
                    </a-tooltip>
                    <a-tooltip mini position="bottom">
                        <a-button
                                size="small"
                                v-if="!editor.activeObjectIsType('Pen')"
                                :disabled="!isDefined(editor.activeObject)"
                                @click="keybinding.trigger('shift+v')"
                        >
                            <template #icon>
                                <SvgIcon name="bx-reflect-horizontal" />
                            </template>
                        </a-button>
                        <template #content>
                            <TipContentKey content="垂直翻转" :keys="['Shift', 'V']" />
                        </template>
                    </a-tooltip>
                </a-space>
            </a-col>
<!--            <a-col-->
<!--                    :span="10"-->
<!--                    v-if="-->
<!--          isDefined(canvas.activeObject) &&-->
<!--          'rx' in canvas.activeObject.value.ref &&-->
<!--          'ry' in canvas.activeObject.value.ref-->
<!--        "-->
<!--            >-->
<!--                <SwipeNumber-->
<!--                        size="small"-->
<!--                        :min="0"-->
<!--                        :max="Math.min(canvas.activeObject.value.width, canvas.activeObject.value.height) / 2"-->
<!--                        v-model="rx.modelValue"-->
<!--                        @swipe="-->
<!--            (value) => {-->
<!--              rx.onSwipe(value)-->
<!--              ry.onSwipe(value)-->
<!--            }-->
<!--          "-->
<!--                        @change="-->
<!--            (value) => {-->
<!--              rx.onSwipe(value)-->
<!--              ry.onSwipe(value)-->
<!--              undoRedo.saveState()-->
<!--            }-->
<!--          "-->
<!--                >-->
<!--                    <template #label>-->
<!--                        <SvgIcon name="round" />-->
<!--                    </template>-->
<!--                </SwipeNumber>-->
<!--            </a-col>-->
        </a-row>
    </div>
</template>

<style scoped lang="less">
.arco-input-prefix {
  svg {
    display: inline-block;
    vertical-align: -3.5px;
  }
}
</style>
