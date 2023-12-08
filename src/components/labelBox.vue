<template>
  <div>
<!--      <a-button-group>-->
<!--          <a-button>-->
<!--              <slot v-if="$slots.label" name="label"></slot>-->
<!--              <template v-else>{{ label }}</template>-->
<!--          </a-button>-->
<!--          <slot></slot>-->
<!--      </a-button-group>-->

<!--      <a-button>-->
<!--          <template #icon>-->
<!--              <slot v-if="$slots.label" name="label"></slot>-->
<!--              <template v-else>{{ label }}</template>-->
<!--          </template>-->
<!--          <slot></slot>-->
<!--      </a-button>-->
      <a-input-tag :default-value="['test']" :style="{width:'320px'}" placeholder="Please Enter" readonly>
          <slot></slot>
      </a-input-tag>
      <a-input-number>
          <template #prefix>
              <slot v-if="$slots.label" name="label"></slot>
              <template v-else>{{ label }}</template>
          </template>
          <template #prepend>
              <slot></slot>
          </template>
      </a-input-number>
  </div>
</template>

<script setup lang="ts">
const slots = useSlots()
const props = defineProps<{
    label?: string
}>()

const hasLabel = computed(() => !!props.label || !!slots.label)
</script>

<style scoped>

</style>
