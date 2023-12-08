<script setup lang="ts">
  import type { useEditor } from '@/views/Editor/app'
  import { Trace } from '@/views/Editor/core/instantiation/instantiationService'

  const { canvas } = inject<typeof useEditor>('useEditor')!()

  const printTrace = () => {
    if (Trace.all.size === 0) {
      console.log('Enable via `instantiationService.ts#_enableAllTracing`')
      return
    }

    for (const item of Trace.all) {
      console.log(item)
    }
  }
  const printJson = () => {
    console.log(canvas.activeObject)
  }
</script>

<template>
  <div class="p2">
    <div>测试插件插槽</div>
    <a-space>
        <a-button @click="printTrace" hidden>打印Trace</a-button>
        <a-button @click="printJson">打印JSON</a-button>
    </a-space>
<!--    <template v-for="(value, key) in canvas.activeObject.value?.proxyData" :key="key">-->
<!--      <div>{{ key }}: {{ value }}</div>-->
<!--    </template>-->
  </div>
</template>
