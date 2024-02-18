<template>
    <div
            ref="blockRef"
            :class="`${prefixCls}-palette`"
            :style="{ backgroundColor: hueColor }"
            @mousedown="onMouseDown"
    >
        <div
                ref="handlerRef"
                :class="`${prefixCls}-handler`"
                :style="{
        top: `${(1 - hsv.value.v) * 100}%`,
        left: `${hsv.value.s * 100}%`,
      }"
        />
    </div>
</template>

<script setup lang="ts">
import {computed, PropType, ref, toRefs} from 'vue';
import { getPrefixCls } from '../_utils/global-config';
import { hsvToRgb } from '../_utils/color';
import { Color } from './interface';
import { useControlBlock } from './hooks/use-control-block';

const props = defineProps({
    color: {
        type: Object as PropType<Color>,
        required: true,
    },
    onChange: Function as PropType<(s: number, v: number) => void>,
});

const { color, onChange } = toRefs(props);

const prefixCls = getPrefixCls('color-picker');
const hsv = computed(() => color.value.hsv);

const { blockRef, handlerRef, onMouseDown } = useControlBlock({
    value: [hsv.value.s, 1 - hsv.value.v],
    onChange: (value) => onChange.value?.(value[0], 1 - value[1]),
});

const hueColor = computed(() => {
    const rgb = hsvToRgb(hsv.value.h, 1, 1);
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
});
</script>

<style scoped>
/* Add your component styling here, e.g., for .color-picker-palette and .color-picker-handler */
</style>
