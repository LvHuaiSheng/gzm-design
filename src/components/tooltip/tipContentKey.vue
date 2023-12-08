<script setup lang="ts">
  import Key from '@/components/key'

  defineProps<{
    keys?: string[]
    content: string
  }>()
</script>

<template>
  <a-space>
    <div class="flex-shrink-0">{{ content }}</div>
    <template v-if="keys">
      <Key :keys="keys" />
    </template>
  </a-space>
</template>

<style lang="less" scoped>
  :deep(.key) {
    background-color: var(--color-tooltip-bg);
  }
</style>
