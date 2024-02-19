<template>
    <div v-if="type === 'alpha'" :class="`${prefixCls}-control-bar-bg`">
        <div
                ref="blockRef"
                :class="[
        `${prefixCls}-control-bar`,
        `${prefixCls}-control-bar-alpha`,
        `${prefixCls}-control-bar-alpha`,
      ]"
                :style="{
        background: `linear-gradient(to right, rgba(0, 0, 0, 0), rgb(${rgb.r}, ${rgb.g}, ${rgb.b}))`,
      }"
                @mousedown="onMouseDown"
        >
            <div
                    ref="handlerRef"
                    :class="`${prefixCls}-handler`"
                    :style="{ left: `${x * 100}%`, color: colorString }"
            />
        </div>
    </div>
    <div v-else ref="blockRef" :class="`${prefixCls}-control-bar ${prefixCls}-control-bar-hue`" @mousedown="onMouseDown">
        <div
                ref="handlerRef"
                :class="`${prefixCls}-handler`"
                :style="{ left: `${x * 100}%`, color: colorString }"
        />
    </div>
</template>

<script setup>
import { computed, ref, toRefs } from 'vue';
import { getPrefixCls } from '../_utils/global-config';
import { useControlBlock } from './hooks/use-control-block';

// Props
const props = defineProps({
    x: {
        type: Number,
        required: true,
    },
    color: {
        type: Object,
        required: true,
    },
    colorString: String,
    type: String,
    onChange: Function,
});

// Extracting refs from props
const { x, color, colorString, type, onChange } = toRefs(props);

const prefixCls = getPrefixCls('color-picker');
const rgb = computed(() => color.value.rgb);

// Using the control block hook
const { blockRef, handlerRef, onMouseDown } = useControlBlock({
    value: [x.value, 0],
    onChange: (pos) => onChange.value?.(pos[0]),
});
</script>

<style scoped>
/* Add your component styling here */
</style>
