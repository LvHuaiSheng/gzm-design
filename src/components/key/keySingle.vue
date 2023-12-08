<template>
  <div class="key">
    <slot></slot>
  </div>
</template>

<style lang="less" scoped>
  .key {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    font-size: 12px;
    background-color: var(--color-fill-3);
    border: 1px solid var(--color-fill-4);
    border-radius: 3px;
    box-shadow: 0 1px rgba(var(--gray-8), 0.18);
  }
</style>
