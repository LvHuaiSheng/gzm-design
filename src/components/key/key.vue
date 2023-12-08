<script setup lang="ts">
  import KeySingle from './keySingle.vue'

  defineProps<{
    keys: string[]
  }>()
</script>

<template>
  <a-space size="mini">
    <template v-for="(value, index) in keys" :key="index">
      <KeySingle>
        {{ value }}
      </KeySingle>
    </template>
  </a-space>
</template>

<style scoped lang="less"></style>
