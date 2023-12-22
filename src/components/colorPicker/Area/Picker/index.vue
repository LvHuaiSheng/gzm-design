<template>
  <div ref="pickerAreaRef" class="spectrum-map" :style="pickerStyle">
    <div class="spectrum" @click="spectrumClick"></div>
    <div class="picker-cursor" :style="pointerStyle"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from "vue"
import { clamp, isDefined, usePointerSwipe } from "@vueuse/core"
import { Color } from "@/utils/color/color"

const props = defineProps<{
  red: number;
  green: number;
  blue: number;
  alpha: number;
  hue: number;
  saturation: number;
  value: number;
  updateColor: Function;
}>()

const pickerAreaRef = ref<HTMLDivElement>()

const state = reactive({
  width: 0,
  height: 0
})

const offsetLeft = computed(() => {
  return Math.round(props.saturation * state.width - 8)
})

const offsetTop = computed(() =>
  Math.max(Math.round(state.height - props.value * state.height - 14), -6)
)

const pointerStyle = computed(() => {
  return {
    backgroundColor: `rgb(${props.red}, ${props.green}, ${props.blue})`,
    left: `${offsetLeft.value}px`,
    top: `${offsetTop.value}px`
  }
})

const pickerStyle = computed(() => {
  const color = new Color(`hsva(${props.hue},1,1,1)`)
  // const color = new Color(new HSVA(props.hue, 1, 1, 1))
  // const { r, g, b } = color.rgba
  return {
    backgroundColor: color.rgb
  }
})

onMounted(() => {
  if (isDefined(pickerAreaRef)) {
    state.width = pickerAreaRef.value.clientWidth
    state.height = pickerAreaRef.value.clientHeight
    rect = pickerAreaRef.value?.getBoundingClientRect()
  }
})

let rect: DOMRect | undefined

const getColor = () => {
  if (!isDefined(rect)) return
  let x = clamp(posEnd.x - rect.x, 0, state.width)
  let y = clamp(posEnd.y - rect.y, 0, state.height)
  const saturation = x / state.width
  const value = 1 - y / state.height
  const color = new Color(
    `hsva(${props.hue},${saturation},${value},${props.alpha})`
  )
  // const color = new Color(new HSVA(props.hue, saturation, value, props.alpha))
  return {
    ...color.getRgba(),
    saturation,
    value
  }
}

const spectrumClick = (obj: any) => {
  props.updateColor(getColor(), "onChange")
}

const { posEnd } = usePointerSwipe(pickerAreaRef, {
  threshold: 0,
  onSwipeStart() {
    props.updateColor(getColor(), "onStartChange")
  },
  onSwipe() {
    props.updateColor(getColor(), "onChange")
  },
  onSwipeEnd() {
    props.updateColor(getColor(), "onEndChange")
  }
})
</script>
