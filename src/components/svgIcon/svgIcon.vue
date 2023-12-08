<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      name: string
      prefix?: string
      size?: number
      fill?: string
    }>(),
    {
      prefix: 'icon',
      size: 18,
      fill: 'currentColor',
    },
  )

  const symbolId = computed(() => `#${props.prefix}-${props.name}`)

  const attrs = useAttrs()

  const style = computed(() => ({
    width: `${props.size}px`,
    height: `${props.size}px`,
  }))
</script>

<template>
  <svg aria-hidden="true" :style="style" v-bind="attrs">
    <use :xlink:href="symbolId" :fill="fill" />
  </svg>
</template>
