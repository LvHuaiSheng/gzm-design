<template>
    <a-input-number
            class="{{prefixCls}}-input-alpha"
            size="mini"
            v-model="roundedValue"
            :min="0"
            :max="100"
            :disabled="disabled"
            @update:modelValue="handleUpdate"
    >
        <template #suffix>%</template>
    </a-input-number>
</template>

<script setup>
import { computed, defineProps, toRefs } from 'vue';
import { getPrefixCls } from '../_utils/global-config';

// Props
const props = defineProps({
    value: {
        type: Number,
        required: true,
    },
    disabled: Boolean,
    onChange: Function,
});

// Extracting refs from props
const { value, disabled } = toRefs(props);

const prefixCls = getPrefixCls('color-picker');

// Computed property to round the value to nearest integer
const roundedValue = computed({
    get: () => Math.round(value.value * 100),
    set: (val) => props.onChange?.(val / 100),
});

// Method to handle update
const handleUpdate = (val) => {
    props.onChange?.(val / 100);
};
</script>

<style scoped>
/* Add your component styling here */
</style>
