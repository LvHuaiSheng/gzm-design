<template>
  <div class="color-preview-area">
    <a-space>
      <Hex
        v-if="mode === 'hex'"
        :red="props.red"
        :green="props.green"
        :blue="props.blue"
        :alpha="props.alpha"
        :update-color="props.updateColor"
      />
      <RGB
        v-else-if="mode === 'rgb'"
        :red="props.red"
        :green="props.green"
        :blue="props.blue"
        :alpha="props.alpha"
        :update-color="props.updateColor"
      />

      <a-dropdown :popup-max-height="false">
        <a-button class="px1! icon-btn" size="small"><icon-down /></a-button>
        <template #content>
          <a-doption>HEX</a-doption>
          <a-doption disabled>RGB</a-doption>
        </template>
      </a-dropdown>
    </a-space>
  </div>
</template>

<script lang="ts" setup>
  import Hex from './Hex/index.vue'
  import RGB from './RGB/index.vue'
  import { Mode, UpdateColor } from '@/components/colorPicker/interface'

  const props = defineProps<{
    mode: Mode
    red: number
    green: number
    blue: number
    alpha: number
    updateColor: UpdateColor
  }>()
</script>
