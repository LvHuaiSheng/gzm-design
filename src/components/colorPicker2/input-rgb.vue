<template>
    <a-input-group :class="`${prefixCls}-input-group`">
        <a-input-number
                v-for="channel in ['r', 'g', 'b']"
                :key="channel"
                size="mini"
                min="0"
                max="255"
                :disabled="disabled"
                :modelValue="color.rgb[channel]"
                hideButton
                @change="(val) => handleChange({ [channel]: val })"
        />
        <InputAlpha
                :disabled="disabledAlpha"
                :value="alpha"
                @change="onAlphaChange"
        />
    </a-input-group>
</template>

<script lang="ts">
import { defineComponent, PropType, toRefs } from 'vue';
import InputAlpha from './input-alpha.vue';
import { getPrefixCls } from '../_utils/global-config';
import { rgbToHsv } from '../_utils/color';
import { Color, HSV, RGB } from './interface';

export default defineComponent({
    name: 'InputRgb',
    components: {
        InputAlpha,
    },
    props: {
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
    },
    setup(props) {
        const prefixCls = getPrefixCls('color-picker');
        const { color, disabled, disabledAlpha, alpha } = toRefs(props);

        const handleChange = (value: Partial<RGB>) => {
            const newRGB = { ...color.value.rgb, ...value };
            const hsv = rgbToHsv(newRGB.r, newRGB.g, newRGB.b);
            props.onHsvChange?.(hsv);
        };

        return {
            prefixCls,
            color,
            disabled,
            disabledAlpha,
            alpha,
            handleChange,
        };
    },
});
</script>

<style scoped>
/* Add your component styling here */
</style>
