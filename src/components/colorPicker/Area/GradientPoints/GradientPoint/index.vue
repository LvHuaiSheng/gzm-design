<template>
  <div
    class="picker-cursor"
    :class="{
      active,
    }"
    :style="pointStyle"
    @dblclick="() => props.removePoint(index)"
  >
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { ColorPoint } from '@/components/colorPicker/interface'

  const props = defineProps<{
    point: ColorPoint
    active: boolean
    width: number
    index: number
    removePoint: Function
  }>()

  const pointStyle = computed(() => {
    const { red, green, blue, alpha, left } = props.point
    return {
      left: `${left * (props.width / 100)}px`,
      background: `rgba(${red}, ${green}, ${blue}, ${alpha})`,
    }
  })
</script>
