<script setup lang="ts">
import Panel from './panel.vue'
import {useActiveObjectModel} from '@/views/Editor/hooks/useActiveObjectModel'
import type {SelectProps} from '@arco-design/web-vue/es/select'
import SwipeNumber from "@/components/swipeNumber/swipeNumber.vue";

const opacity = useActiveObjectModel('opacity')
  const blendMode = useActiveObjectModel<'blendMode', SelectProps['modelValue']>('blendMode')
  const visible = useActiveObjectModel('visible')
  const newOpacity = ref()
  watchEffect(()=>{
      newOpacity.value = opacity.value.modelValue * 100
  })
  watchEffect(()=>{
      opacity.value.onChange(newOpacity.value/100)
  })

  const blendModeOptions = reactive([
    {
        value: 'pass-through',
        label: '穿透',
    },
    {
      value: 'normal',
      label: '正常',
    },
    {
      isGroup: true,
      label: '暗色',
      options: [
        {
          value: 'darken',
          label: '变暗',
        },
        {
          value: 'multiply',
          label: '正片叠底',
        },
        {
          value: 'color-burn',
          label: '颜色加深',
        },
      ],
    },
    {
      isGroup: true,
      label: '亮色',
      options: [
        {
          value: 'lighten',
          label: '变亮',
        },
        {
          value: 'screen',
          label: '滤色',
        },
        {
          value: 'color-dodge',
          label: '颜色减淡',
        },
        // {
        //   value: 'lighter',
        //   label: '提亮',
        // },
      ],
    },
    {
      isGroup: true,
      label: '对比',
      options: [
        {
          value: 'overlay',
          label: '叠加',
        },
        {
          value: 'soft-light',
          label: '柔光',
        },
        {
          value: 'hard-light',
          label: '强光',
        },
      ],
    },
    {
      isGroup: true,
      label: '比较',
      options: [
        {
          value: 'difference',
          label: '差集',
        },
        {
          value: 'exclusion',
          label: '排除',
        },
      ],
    },
    {
      isGroup: true,
      label: '颜色',
      options: [
        {
          value: 'hue',
          label: '色相',
        },
        {
          value: 'saturation',
          label: '饱和度',
        },
        {
          value: 'color',
          label: '颜色',
        },
        {
          value: 'luminosity',
          label: '明度',
        },
      ],
    },
  ])
  const formatter = (value) => {
      return `${Math.round((value) * 100)}%`
  };
  const marks = {
      0: '透明',
      1: '正常',
  };

</script>

<template>
  <Panel title="图层" hidden-add>
    <a-row :gutter="[8, 4]" align="center">
      <a-col :span="12">
        <a-select
          size="small"
          v-bind="blendMode"
          :options="blendModeOptions"
        >
            <template #prefix>
                <icon-layers />
            </template>
        </a-select>
      </a-col>
      <a-col :span="9">
          <SwipeNumber size="small" v-model="newOpacity" :min="0" :max="100" :step="1">
              <template #label>
                  <icon-mosaic />
              </template>
              <template #suffix>
                  <div>%</div>
              </template>
          </SwipeNumber>
      </a-col>
      <a-col :span="3" class="mlauto">
        <a-button size="small" class="icon-btn" @click="visible.onChange(!visible.modelValue)">
          <template #icon>
            <icon-eye v-if="visible.modelValue === true" />
            <icon-eye-invisible v-else />
          </template>
        </a-button>
      </a-col>
    </a-row>
  </Panel>
</template>

<style scoped lang="less"></style>
