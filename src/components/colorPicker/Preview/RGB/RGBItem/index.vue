<!--
 * @Descripttion: 
 * @version: 
 * @Author: June
 * @Date: 2023-03-19 18:41:58
 * @LastEditors: June
 * @LastEditTime: 2023-05-12 23:12:55
-->
<template>
  <div>
    <!-- <Input
      :value="state.inputValue"
      :type="props.type"
      :label="props.label"
      :on-focus="() => (state.inProgress = true)"
      :on-blur="onBlur"
      :in-progress="state.inProgress"
      classes="rgb"
      @input="onChangeHandler"
    /> -->
  </div>
</template>

<script lang="ts" setup>
  import { reactive, watch, getCurrentInstance } from 'vue'
  // import Input from '@/components/colorPicker/Input/index.vue'

  interface Iprops {
    value: number | string
    type: string
    label: string
    onChange: (val?: number) => void
  }

  const instance = getCurrentInstance()
  const props = withDefaults(defineProps<Iprops>(), {
    type: 'text',
    label: '',
    onChange: (val?: number) => false,
  })
  // const props = defineProps({
  //     value: [String, Number],
  //     type: String,
  //     label: String,
  //     onChange: Function,
  // });

  const state = reactive<{
    inputValue: any
    inProgress: boolean
  }>({
    inputValue: props.value || 0,
    inProgress: false,
  })

  const setValue = () => {
    if (props.value !== +state.inputValue && state.inputValue !== '') {
      state.inputValue = props.value
    }
  }

  const onChangeHandler = (event: any) => {
    const value: number = +event.target.value
    if (Number.isNaN(value) || value < 0 || value > 255) {
      state.inputValue = props.value
      instance?.proxy?.$forceUpdate()
      return
    }
    state.inputValue = event.target.value
    props.onChange(value)
  }

  const onBlur = () => {
    if (!state.inputValue) {
      state.inputValue = props.value
    }
    state.inProgress = false
  }

  watch(
    () => props.value,
    () => setValue(),
  )
</script>
