<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      title?: string
      hiddenAdd?: boolean
      disableAdd?: boolean
    }>(),
    {
      hiddenAdd: false,
      disableAdd: false,
    },
  )

  const emit = defineEmits<{
    (e: 'clickAdd', ev: MouseEvent): void
  }>()

  const clickAdd = (ev: MouseEvent) => {
    if (props.disableAdd) return
    emit('clickAdd', ev)
  }
</script>

<template>
  <div class="p2 attr-panel">
    <div
      class="h28px font-bold text-xs flex justify-between items-center"
      :class="[!disableAdd && !hiddenAdd ? 'hover-add' : '',disableAdd ?'disable-add':'mb2px']"
      @click.self="clickAdd"
    >
      <slot name="title">
          <span>{{ title }}</span>
      </slot>
      <div>
        <slot name="actions"></slot>
        <a-button
          v-if="!hiddenAdd"
          :disabled="disableAdd"
          size="small"
          class="icon-btn"
          @click="clickAdd"
        >
          <template #icon>
            <icon-plus />
          </template>
        </a-button>
      </div>
    </div>
<!--    <slot v-if="disableAdd || hiddenAdd"></slot>-->
    <slot></slot>
  </div>
</template>

<style lang="less" scoped>
  .gray {
    color: var(--color-text-3);

    &:hover {
      color: var(--color-text-1);
    }
  }
  .disable-add{
    cursor: no-drop;
    color: var(--color-text-3);
  }
  .hover-add:hover{
    cursor: pointer;
    color: var(--color-text-3);
  }
</style>
