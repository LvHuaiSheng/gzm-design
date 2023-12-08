<template>
  <div class="picker-area-color">
    <div class="px10px py8px" v-if="['linear', 'radial'].includes(type)">
      <GradientPoints
        v-if="isGradient"
        :type="type"
        :points="points"
        :active-point-index="activePointIndex"
        :change-active-point-index="changeActivePointIndex"
        :update-gradient-left="updateGradientLeft"
        :add-point="addPoint"
        :remove-point="removePoint"
      />
    </div>

    <Picker
      :red="red"
      :green="green"
      :blue="blue"
      :hue="hue"
      :alpha="alpha"
      :saturation="saturation"
      :value="value"
      :update-color="updateColor"
    />

    <div class="preview">
      <Preview
        :red="red"
        :green="green"
        :blue="blue"
        :alpha="alpha"
        :is-gradient="isGradient"
        :points="points"
        :gradient-type="type"
      />

      <div class="color-hue-alpha">
        <Hue :hue="hue" :saturation="saturation" :value="value" :update-color="updateColor" />
        <Alpha :alpha="alpha" :red="red" :green="green" :blue="blue" :update-color="updateColor" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import Picker from './Picker/index.vue'
  import Preview from './Preview/index.vue'
  import Hue from './Hue/index.vue'
  import Alpha from './Alpha/index.vue'
  import GradientPoints from './GradientPoints/index.vue'
  import { ColorPoint } from '@/components/colorPicker/interface'

  defineProps<{
    isGradient: boolean
    red: number
    green: number
    blue: number
    alpha: number
    hue: number
    saturation: number
    value: number
    updateColor: Function
    points: ColorPoint[]
    type: string
    activePointIndex: number
    changeGradientControl: Function
    changeActivePointIndex: Function
    updateGradientLeft: Function
    addPoint: Function
    removePoint: Function
  }>()
</script>
