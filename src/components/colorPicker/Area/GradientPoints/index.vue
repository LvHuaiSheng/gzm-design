<template>
  <div class="gradient" @mousedown="pointsContainerClick">
    <div class="gradient-points-bg" :style="pointsStyle"></div>
    <div ref="pointsContainerRef" class="gradient-slider-container">
      <GradientPoint
        v-for="(point, index) in props.points"
        :key="index"
        :index="index"
        :point="point"
        :width="containerWidth"
        :remove-point="props.removePoint"
        :active="props.activePointIndex === index"
        @mousedown.stop="changeActivePointIndex($event, index)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { isDefined, usePointerSwipe } from '@vueuse/core'
  import GradientPoint from './GradientPoint/index.vue'
  import { generateGradientStyle } from '@/components/colorPicker/helper'

  const props: any = defineProps({
    points: Array,
    activePointIndex: Number,
    changeActivePointIndex: Function,
    updateGradientLeft: Function,
    addPoint: Function,
    removePoint: Function,
  })

  const pointsContainerRef = ref<HTMLElement>()

  const containerWidth = ref(0)

  const pointsStyle = computed(() => {
    const style = generateGradientStyle(props.points, 'linear')
    return { background: style }
  })

  let pointOffsetLeft = 0

  const pointsContainerClick = (e: MouseEvent) => {
    if (!isDefined(pointsContainerRef)) return
    const rect = pointsContainerRef.value.getBoundingClientRect()
    pointOffsetLeft = e.clientX - rect.x
    const left = (pointOffsetLeft * 100) / containerWidth.value
    props.addPoint(left)
  }

  const changeActivePointIndex = (e: MouseEvent, index: number) => {
    props.changeActivePointIndex(index)
    if (e.target instanceof HTMLDivElement) {
      pointOffsetLeft = e.target.offsetLeft
    }
  }

  onMounted(() => {
    if (isDefined(pointsContainerRef)) {
      containerWidth.value = pointsContainerRef.value.clientWidth // padding
    }
  })

  const { distanceX } = usePointerSwipe(pointsContainerRef, {
    threshold: 0,
    onSwipeStart() {
      props.updateGradientLeft(
        props.points[props.activePointIndex].left,
        props.activePointIndex,
        'onStartChange',
      )
    },
    onSwipe() {
      props.updateGradientLeft(
        ((pointOffsetLeft - distanceX.value) * 100) / containerWidth.value,
        props.activePointIndex,
        'onChange',
      )
    },
    onSwipeEnd() {
      props.updateGradientLeft(
        props.points[props.activePointIndex].left,
        props.activePointIndex,
        'onEndChange',
      )
    },
  })
</script>
