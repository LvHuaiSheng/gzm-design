<script setup lang="ts">
import NP from 'number-precision'
import ContextMenu from '@/components/contextMenu'
import type { ButtonInstance } from '@arco-design/web-vue/es/button'
import { Input } from '@arco-design/web-vue'
import { isDefined } from '@vueuse/core'
import { useEditor } from '@/views/Editor/app'
import { isNumber } from 'lodash'
import { zoomItems } from '@/views/Editor/utils/contextMenu'


const { canvas, keybinding } = useEditor()

const { zoom } = canvas.ref


const button = ref<ButtonInstance>()

const inputValue = ref<string>()
watchEffect(() => {
    inputValue.value = NP.times(zoom.value, 100).toFixed(2) + '%'
})
const openMenu = (e: MouseEvent) => {
    let x = e.clientX
    let y = e.clientY
    if (isDefined(button)) {
        const rect = button.value?.$el.getBoundingClientRect()
        x = Math.max(rect.x - 8, 0)
        y = rect.y + rect.height + 4
    }
    ContextMenu.showContextMenu({
        x,
        y,
        preserveIconWidth: false,
        items: [
            {
                customRender: () =>
                    h(
                        'div',
                        {
                            class: 'p2',
                        },
                        h(
                            Input,
                            {
                                size: 'small',
                                modelValue: inputValue.value,
                                'onUpdate:modelValue': (value: string) => {
                                    inputValue.value = value
                                },
                                onChange: (value) => {
                                    const zoom = parseInt(value)
                                    if (!isNumber(zoom) || Number.isNaN(zoom)) return
                                    canvas.zoomToInnerPoint(NP.divide(zoom, 100))
                                },
                            },
                            {},
                        ),
                    ),
            },
            ...zoomItems(),
            {
                label: '50%',
                onClick: () => {
                    canvas.zoomToInnerPoint(0.5)
                },
            },
            {
                label: '100%',
                onClick: () => {
                    keybinding.trigger('mod+0')
                },
                shortcut: `${keybinding.mod} 0`,
            },
            {
                label: '200%',
                onClick: () => {
                    canvas.zoomToInnerPoint(2)
                },
                divided: true,
            },
        ],
    })
}
const handleFitZoom = () => {
    canvas.zoomToFit()
}
// 计算属性，根据 number 的值动态生成格式化后的字符串
const formattedNumber = (val) => {
    if (Number.isInteger(val)) {
        return String(val); // 如果是整数，直接返回字符串形式
    } else {
        return NP.round(val, 2); // 如果有小数，使用 number-precision 的 round 方法保留两位小数
    }
};
</script>

<template>
    <a-tooltip effect="dark" content="自适应画布" mini>
      <a-button ref="button" class="icon-btn px2!" @click="handleFitZoom">
          <icon-fullscreen/>
      </a-button>
    </a-tooltip>
    <a-button ref="button" class="icon-btn px2!" @click="openMenu">
        {{ formattedNumber(NP.times(zoom, 100)) }}%
        <icon-down class="ml1" />
    </a-button>
</template>

<style scoped lang="less"></style>
