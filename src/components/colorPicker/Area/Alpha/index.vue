<template>
  <div class="alpha">
    <div class="gradient" :style="style"></div>
    <div class="alpha-area">
      <div ref="alphaMaskRef" class="alpha-mask">
        <div class="picker-cursor" :style="pointerStyle"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted, computed } from 'vue'
  import { clamp, isDefined, usePointerSwipe } from '@vueuse/core'

  const props = defineProps<{
    red: number
    green: number
    blue: number
    alpha: number
    updateColor: Function
  }>()

  const alphaMaskRef = ref<HTMLDivElement>()
  const state = reactive({
    width: 0,
  })

  const offsetLeft = computed(() => {
    return Math.round(props.alpha * state.width) - 8
  })

  const pointerStyle = computed(() => {
    return { left: `${offsetLeft.value}px` }
  })

  const style = computed(() => {
    return {
      background: `linear-gradient(to right, rgba(0, 0, 0, 0), rgb(${props.red}, ${props.green}, ${props.blue}))`,
    }
  })

  onMounted(() => {
    if (isDefined(alphaMaskRef)) {
      state.width = alphaMaskRef.value.clientWidth
    }
  })

  let rect: DOMRect | undefined

  const getAlpha = () => {
    if (!isDefined(rect)) return
    return {
      a: clamp(Number(((posEnd.x - rect.x) / state.width).toFixed(2)), 0, 1),
    }
  }

  const { posEnd } = usePointerSwipe(alphaMaskRef, {
    threshold: 0,
    onSwipeStart() {
      rect = alphaMaskRef.value?.getBoundingClientRect()
      props.updateColor(getAlpha(), 'onStartChange')
    },
    onSwipe() {
      if (!isDefined(rect)) return
      props.updateColor(getAlpha(), 'onChange')
    },
    onSwipeEnd() {
      if (!isDefined(rect)) return
      props.updateColor(getAlpha(), 'onEndChange')
    },
  })
</script>
