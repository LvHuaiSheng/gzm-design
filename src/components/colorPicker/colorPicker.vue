<template>
  <div class="ui-color-picker">
    <Gradient v-bind="props" />
  </div>
</template>

<script lang="ts" setup>
  import Gradient from './Gradient/index.vue'
  import { Props } from '@/components/colorPicker/interface'
  import { noop } from '@vueuse/core'

  const props = withDefaults(defineProps<Props>(), {
    solidColor: false,
    mode: 'hex',
    attr: 'stroke',
    gradient: () => ({
      type: 'color',
      points: [
        {
          left: 0,
          red: 255,
          green: 0,
          blue: 0,
          alpha: 1,
        },
        {
          left: 100,
          red: 255,
          green: 255,
          blue: 255,
          alpha: 0,
        },
      ],
    }),
    onChange: noop,
    onStartChange: noop,
    onEndChange: noop,
  })
</script>

<style lang="less">
  @import './index.less';
</style>
