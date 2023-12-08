<script setup lang="ts">
import { usePointerSwipe, useVModel, isDefined, useMagicKeys } from '@vueuse/core'
import { isNumber } from 'lodash'
import { toFixed } from '@/utils/math'

const props = withDefaults(
    defineProps<{
        label?: string
        labelWidth?: string
        labelClass?: string
        modelValue?: number
        modelEvent?: 'change' | 'input'
        step?: number
        max?: number
        min?: number
        disabled ?: boolean
        readonly ?: boolean
    }>(),
    {
        modelEvent: 'change',
        labelWidth: '26px',
        step: 1,
        disabled: false,
        readonly: false,
    },
)

const emit = defineEmits<{
    (e: 'update:modelValue', value: number | undefined): void
    (e: 'change', value: number | undefined, ev: Event): void
    (e: 'swipe', value: number | undefined, ev: Event): void
}>()

const slots = useSlots()

const numberValue = useVModel(props, 'modelValue', emit)

watch(
    numberValue,
    (value) => {
        if (!value) return
        numberValue.value = toFixed(value)
    },
    {
        immediate: true,
    },
)

// TODO a-input-number组件设置值为0不触发change?
const change = (value: number | undefined, ev: Event) => {
    emit('change', value, ev)
}

// Swipe
const { shift, alt } = useMagicKeys()
const labelRef = ref<HTMLElement>()
const startValue = ref<number>()
const { posStart, posEnd,stop } = usePointerSwipe(labelRef, {
    threshold: 0,
    onSwipeStart: () => {
        if (props.disabled || props.readonly) return
        startValue.value = numberValue.value
    },
    onSwipe: (e) => {
        // 检查startValue的值是否是数字，如果不是，退出函数
        if (!isNumber(startValue.value)) return
        // 根据props.step的值调整步长
        let step: number = props.step
        if (shift.value) step *= 10
        if (alt.value) step /= 10
        step = Math.max(step, 0.01)
        // 根据鼠标拖动的距离计算新的数值
        let value = startValue.value + Math.round(posEnd.x - posStart.x) * step
        // 如果props.min或props.max存在，则确保新值在指定范围内
        if (isDefined(props.min) && value < props.min) value = props.min
        if (isDefined(props.max) && value > props.max) value = props.max
        // 四舍五入计算的值，并将其分配给numberValue
        value = toFixed(value)
        numberValue.value = value
        // 调用swipe函数并传递新值和事件对象
        emit('swipe', value, e)
    },
    onSwipeEnd: (e) => {
        emit('change', numberValue.value, e)
        startValue.value = undefined
    },
})

const hasLabel = computed(() => !!props.label || !!slots.label)
</script>

<template>
    <a-input-number
            v-model="numberValue"
            :modelEvent="modelEvent"
            :step="step"
            :max="max"
            :min="min"
            :disabled="disabled"
            :readonly="readonly"
            :hide-button="hasLabel"
            :class="{
      hasLabel,
    }"
            @change="change"
    >
        <template #prefix v-if="hasLabel">
            <div ref="labelRef" class="text-center cursor-ew-resize" :class="labelClass" :style="{width:labelWidth}">
                <slot v-if="$slots.label" name="label"></slot>
                <template v-else>{{ label }}</template>
            </div>
        </template>
        <template v-for="(item, key) in slots" :key="key" #[key]>
            <slot :name="key"></slot>
        </template>
    </a-input-number>
</template>

<style scoped lang="less">
.arco-input-wrapper.hasLabel {
  line-height: 1;
  padding-left: 0;
  padding-right: 4px;

  :deep(.arco-input-prefix) {
    padding-right: 0;
  }
}
</style>
