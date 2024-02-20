<script setup lang="ts">
import {defineComponent, ref, computed, h, PropType} from 'vue';
import { getPrefixCls } from '../_utils/global-config';
import { hexToRgb, rgbToHsv } from '../_utils/color';
import { Color, HSV } from './interface';
import { useI18n } from '../locale';
import useState from '../_hooks/use-state';
import ControlBar from './control-bar.vue';
import Palette from './palette.vue';
import Select from '../select/Select.vue';
import InputRgb from './input-rgb.vue';
import InputHex from './input-hex.vue';

export default defineComponent({
    props: {
        color: {
            type: Object as PropType<Color>,
            required: true,
        },
        alpha: {
            type: Number,
            required: true,
        },
        colorString: String,
        disabled: Boolean,
        disabledAlpha: Boolean,
        showHistory: Boolean,
        showPreset: Boolean,
        format: String as PropType<'hex' | 'rgb'>,
        historyColors: Array as PropType<string[]>,
        presetColors: Array as PropType<string[]>,
        onAlphaChange: Function as PropType<(alpha: number) => void>,
        onHsvChange: Function as PropType<(hsv: HSV) => void>,
    },
    setup(props) {
        const { t } = useI18n();
        const prefixCls = getPrefixCls('color-picker');
        const hsv = computed(() => props.color.hsv);
        const [format, setFormat] = useState<'hex' | 'rgb'>(props.format || 'hex');

        const selectOptions = [
            { value: 'hex', label: 'Hex' },
            { value: 'rgb', label: 'RGB' },
        ];

        const onChange = (value: any) => {
            setFormat(value);
        };

        const currentInputComponent = computed(() => format.value === 'rgb' ? InputRgb : InputHex);

        return () => {
            const commonProps = {
                color: props.color,
                alpha: props.alpha,
                disabled: props.disabled,
                disabledAlpha: props.disabledAlpha,
                onHsvChange: props.onHsvChange,
                onAlphaChange: props.onAlphaChange,
            };

            return h('div', { class: { [`${prefixCls}-panel`]: true, [`${prefixCls}-panel-disabled`]: props.disabled } }, [
                h(Palette, {
                    color: props.color,
                    onChange: (s, v) => props.onHsvChange?.({ h: hsv.value.h, s, v }),
                }),
                h('div', { class: `${prefixCls}-panel-control` }, [
                    h('div', { class: `${prefixCls}-control-wrapper` }, [
                        h(ControlBar, {
                            type: "hue",
                            x: hsv.value.h,
                            color: props.color,
                            colorString: props.colorString,
                            onChange: (h) => props.onHsvChange?.({ h, s: hsv.value.s, v: hsv.value.v }),
                        }),
                        h(ControlBar, {
                            type: "alpha",
                            x: props.alpha,
                            color: props.color,
                            colorString: props.colorString,
                            onChange: props.onAlphaChange,
                        }),
                        h('div', { class: `${prefixCls}-preview`, style: { backgroundColor: props.colorString } }),
                    ]),
                    h('div', { class: `${prefixCls}-input-wrapper` }, [
                        h(Select, {
                            class: `${prefixCls}-select`,
                            size: "mini",
                            'trigger-props': { class: `${prefixCls}-select-popup` },
                            options: selectOptions,
                            modelValue: format.value,
                            onChange: onChange,
                        }),
                        h('div', { class: `${prefixCls}-group-wrapper` }, [
                            h(currentInputComponent.value, {
                                ...commonProps,
                            }),
                        ]),
                    ]),
                ]),
                // Additional logic needed to render color sections (history and preset)
            ]);
        };
    },
});
</script>
