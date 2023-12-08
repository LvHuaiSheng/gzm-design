<!--
 * @Descripttion: 
 * @version: 
 * @Author: June
 * @Date: 2023-03-19 18:24:48
 * @LastEditors: June
 * @LastEditTime: 2023-05-12 23:01:07
-->
<template>
  <RGBItem
    :value="props.red"
    type="number"
    label="R"
    :on-change="(value) => changeValue('red', value)"
  />
  <RGBItem
    :value="props.green"
    type="number"
    label="G"
    :on-change="(value) => changeValue('green', value)"
  />
  <RGBItem
    :value="props.blue"
    type="number"
    label="B"
    :on-change="(value) => changeValue('blue', value)"
  />
  <RGBItem
    :value="props.alpha * 100"
    type="number"
    label="Alpha"
    :on-change="(value) => changeValue('alpha', value)"
  />
</template>

<script lang="ts" setup>
  import RGBItem from './RGBItem/index.vue'

  interface Iprops {
    red: number
    green: number
    blue: number
    alpha: number
    updateColor: (value: any) => void
  }

  const props = withDefaults(defineProps<Iprops>(), {
    red: 0,
    green: 0,
    blue: 0,
    alpha: 0,
    updateColor: () => false,
  })

  const changeValue = (field: string, value: any) => {
    // if (field === 'alpha') {
    //   props.updateColor({ a: value / 100 })
    //   return
    // }
    // const color = rgbToHsv({
    //   red: props.red,
    //   green: props.green,
    //   blue: props.blue,
    //   [field]: value,
    // })
    // props.updateColor({ ...color, [field]: value })
  }
</script>
