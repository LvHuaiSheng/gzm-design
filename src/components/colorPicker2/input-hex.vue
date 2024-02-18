<template>
    <a-input-group :class="`${prefixCls}-input-group`">
        <a-input
                :class="`${prefixCls}-input-hex`"
                v-slot:prefix="'#'"
                size="mini"
                maxLength="6"
                :disabled="disabled"
                v-model="hex"
                @input="setHex"
                @change="onInputChange"
                @blur="handlerChange"
                @pressEnter="handlerChange"
                @paste="onPaste"
        />
        <InputAlpha
                :disabled="disabledAlpha"
                :value="alpha"
                @change="onAlphaChange"
        />
    </a-input-group>
</template>

<script setup lang="ts">
import {ref, watch, toRefs, PropType} from 'vue';
import InputAlpha from './input-alpha.vue';
import { getPrefixCls } from '../_utils/global-config';
import { hexToRgb, rgbToHsv } from '../_utils/color';
import { Color, HSV } from './interface';

// Props
const props = defineProps({
    color: {
        type: Object as PropType<Color>,
        required: true,
    },
    alpha: {
        type: Number,
        required: true,
    },
    disabled: Boolean,
    disabledAlpha: Boolean,
    onHsvChange: Function as PropType<(value: HSV) => void>,
    onAlphaChange: Function as PropType<(value: number) => void>,
});

const { color, disabled, disabledAlpha, alpha } = toRefs(props);

// Prefix class
const prefixCls = getPrefixCls('color-picker');

// State
const hex = ref(color.value.hex);

// Handlers
const handlerChange = (value: string = hex.value) => {
    const _rgb = hexToRgb(value) || { r: 255, g: 0, b: 0 };
    const hsv = rgbToHsv(_rgb.r, _rgb.g, _rgb.b);
    props.onHsvChange?.(hsv);
};

const onInputChange = (value: string) => {
    const matchValue = value.match(/[a-fA-F0-9]*/g)?.join('') ?? '';
    if (matchValue !== color.value.hex) {
        handlerChange(matchValue.toUpperCase());
    }
};

const onPaste = (ev: ClipboardEvent) => {
    if (!ev.clipboardData) return;
    let text = ev.clipboardData.getData('Text');
    if (text.startsWith('#')) {
        text = text.slice(1);
    }
    onInputChange(text);
    ev.preventDefault();
};

// Watchers
watch(color, () => {
    if (color.value.hex !== hex.value) {
        hex.value = color.value.hex;
    }
});

// Expose setHex for template
const setHex = (value: string) => {
    hex.value = value;
};
</script>

<style scoped>
/* Add your component styling here */
</style>
