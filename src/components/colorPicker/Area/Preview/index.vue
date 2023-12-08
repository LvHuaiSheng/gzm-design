<template>
  <div class="preview-area">
    <div class="preview-box" :style="style"></div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { generateSolidStyle, generateGradientStyle } from '@/components/colorPicker/helper'

  interface Iprops {
    isGradient: boolean
    red: number
    green: number
    blue: number
    alpha: number
    points: any
    gradientType: string
  }

  const props = withDefaults(defineProps<Iprops>(), {
    isGradient: false,
    red: 255,
    green: 0,
    blue: 0,
    alpha: 1,
    points: () => [
      {
        left: 0,
        red: 0,
        green: 0,
        blue: 0,
        alpha: 1,
      },
      {
        left: 100,
        red: 255,
        green: 0,
        blue: 0,
        alpha: 1,
      },
    ],
    gradientType: '',
  })

  const style = computed(() => {
    let style = ''
    if (['linear', 'radial'].includes(props.gradientType)) {
      style = generateGradientStyle(props.points, props.gradientType)

      return { background: style }
    }
    style = generateSolidStyle(props.red, props.green, props.blue, props.alpha)

    return { backgroundColor: style }
  })
</script>
