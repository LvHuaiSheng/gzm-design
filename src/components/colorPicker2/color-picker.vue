<template>
    <div v-if="!hideTrigger">
        <Trigger
                :trigger="triggerProps.trigger || 'click'"
                :position="triggerProps.position || 'bl'"
                :animation-name="triggerProps.animationName || 'slide-dynamic-origin'"
                :popup-offset="triggerProps.popupOffset || 4"
                :disabled="disabled"
                @popup-visible-change="onPopupVisibleChange"
                v-bind="triggerProps"
        >
            <template #content>
                <Panel
                        :color="color"
                        :alpha="alpha"
                        :colorString="colorString"
                        :historyColors="historyColors"
                        :presetColors="presetColors"
                        :showHistory="showHistory"
                        :showPreset="showPreset"
                        :disabled="disabled"
                        :disabledAlpha="disabledAlpha"
                        :format="format"
                        @hsvChange="onHsvChange"
                        @alphaChange="onAlphaChange"
                />
            </template>
            <slot v-if="$slots.default"></slot>
            <div v-else class="color-picker-preview" :style="{ backgroundColor: formatValue }">
                <div v-if="showText" class="color-picker-value">{{ formatValue }}</div>
                <input class="color-picker-input" :value="formatValue" :disabled="disabled" />
            </div>
        </Trigger>
    </div>
    <Panel v-else
           :color="color"
           :alpha="alpha"
           :colorString="colorString"
           :historyColors="historyColors"
           :presetColors="presetColors"
           :showHistory="showHistory"
           :showPreset="showPreset"
           :disabled="disabled"
           :disabledAlpha="disabledAlpha"
           :format="format"
           @hsvChange="onHsvChange"
           @alphaChange="onAlphaChange"
    />
</template>

<script setup>
import { computed, watch, reactive } from 'vue';
import Panel from './Panel.vue';
import Trigger from '../Trigger.vue';
import { formatInputToHSVA, hsvToRgb, rgbaToHex, rgbToHex } from '../_utils/color';
import useMergeState from '../_hooks/use-merge-state';
import useState from '../_hooks/use-state';
import { colors } from './colors';

// Props
const props = defineProps({
    modelValue: String,
    defaultValue: String,
    format: String,
    size: { type: String, default: 'medium' },
    showText: { type: Boolean, default: false },
    showHistory: { type: Boolean, default: false },
    showPreset: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    disabledAlpha: { type: Boolean, default: false },
    hideTrigger: Boolean,
    triggerProps: Object,
    historyColors: Array,
    presetColors: { type: Array, default: () => colors },
});

// Emits
const emit = defineEmits(['update:modelValue', 'change', 'popup-visible-change']);

// Setup
const [mergeValue, setMergeValue] = useMergeState(props.defaultValue, reactive({ value: props.modelValue }));
const formatInput = computed(() => formatInputToHSVA(mergeValue.value || ''));
const [alpha, setAlpha] = useState(formatInput.value.a);
const [hsv, setHsv] = useState({ h: formatInput.value.h, s: formatInput.value.s, v: formatInput.value.v });

const color = computed(() => {
    const rgb = hsvToRgb(hsv.value.h, hsv.value.s, hsv.value.v);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    return { hsv: hsv.value, rgb, hex };
});

const colorString = computed(() => `rgba(${color.value.rgb.r}, ${color.value.rgb.g}, ${color.value.rgb.b}, ${alpha.value.toFixed(2)})`);

const formatValue = computed(() => {
    const { r, g, b } = color.value.rgb;
    if (props.format === 'rgb') {
        return alpha.value < 1 ? `rgba(${r}, ${g}, ${b}, ${alpha.value.toFixed(2)})` : `rgb(${r}, ${g}, ${b})`;
    }
    return alpha.value < 1 ? `#${rgbaToHex(r, g, b, alpha.value)}` : `#${rgbToHex(r, g, b)}`;
});

watch(formatValue, (value) => {
    setMergeValue(value);
    emit('update:modelValue', value);
    emit('change', value);
});

const onHsvChange = (value) => {
    if (!props.disabled) setHsv(value);
};

const onAlphaChange = (value) => {
    if (!props.disabled) setAlpha(value);
};

const onPopupVisibleChange = (visible) => {
    emit('popup-visible-change', visible, formatValue.value);
};
</script>

<style>
/* Add your component styling here */
</style>
