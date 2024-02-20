<template>
    <div class="wrap">
        <div class="other-text-wrap">
            <ul class="list">
                <a-list :gridProps="{ gutter: [5, 10], span: 8 }"
                        :bordered="false"
                        :data="props.data"
                        @reach-bottom="fetchData"
                        max-height="calc(100vh - 40px)">
                    <template #item="{ item,index }" >
                        <a-list-item style="padding: 0" @click="handleClick(item)" :key="index">
                            <slot v-bind:item="item">
                                <div class="list__img-thumb">
                                    <a-image
                                            class="list__img"
                                            :preview="false"
                                            :height="95"
                                            width="100%"
                                            fit="contain"
                                            :src="item[props.option.coverKey]"
                                    />
                                </div>
                            </slot>
                        </a-list-item>
                    </template>
                    <template #scroll-loading >
                        <div v-if="props.noMore">没有更多了</div>
                        <a-spin v-else/>
                    </template>
                </a-list>
            </ul>
        </div>
    </div>
</template>

<script lang="ts" setup>

import {computed} from "vue";

const current = ref(1);
const bottom = ref(false);
const data = reactive([]);
const scrollbar = ref(true);

const props = withDefaults(
    defineProps<{
        option?:object,
        data: any,
        config?: object
        maxHeight?: string | number,
        noMore?: boolean,
    }>(),
    {
        option:{
          coverKey:'url'
        },
        data: [],
        config:{},
        maxHeight: 'calc(100vh - 140px)',
        noMore: false
    }
)
const config = computed(() => {
    return Object.assign( props.config)
})
const emits = defineEmits(['fetchData','itemClick'])

const handleClick = (item) => {
    emits('itemClick',item)
}
const fetchData = () => {
    emits('fetchData')
    console.log('reach bottom!');
}
</script>

<style lang="less" scoped>
@import "../../../../styles/layouts";

.search__wrap {
 padding: 1.4rem 1rem 0.8rem 0rem;
}
.min-h{
  min-height: 300px;
}
</style>

<style lang="less" scoped>
.wrap {
  width: 100%;
  height: 100%;
}
.types {
  display: flex;
  flex-wrap: wrap;
  padding: 10px 0 0 6px;
  &__item {
    position: relative;
    width: 64px;
    // height: 44px;
    height: 64px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-weight: 600;
    font-size: 13px;
    border-radius: 4px;
    cursor: pointer;
    margin: 8px 4px 0 4px;
    background-size: cover;
    background-repeat: no-repeat;
    text-shadow: 0 1px 0 rgb(0 0 0 / 25%);
    opacity: 0.5;
  }
  &--select {
    opacity: 1;
  }
  &__header {
    user-select: none;
    cursor: pointer;
    margin-bottom: 12px;
    font-size: 13px;
    color: #333333;
    display: flex;
    align-items: center;
    &-more {
      display: flex;
      align-items: center;
      color: #a0a0a0;
      font-size: 13px;
    }
    &-back {
      cursor: pointer;
      padding: 0 0 0 0.6rem;
      display: flex;
      align-items: center;
      color: #333;
      font-size: 16px;
      height: 2.9rem;
      position: absolute;
      z-index: 2;
      background: #ffffff;
      width: 320px;
      .icon-right {
        transform: rotate(180deg);
      }
    }
  }
}
.header-back{
  cursor: pointer;
}
.list {
  width: 100%;
  :deep(.arco-list-content){
    padding: 10px;
  }
  &__img {
    border-radius: 4px;
  }
  &__img-thumb{
    background: #f8fafc;
    cursor: pointer;
    border-radius: 4px;
  }
  &__img-thumb:hover {
    background: rgba(0, 0, 0, 0.05);
  }
}
.list-wrap {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.8rem;
}

.content {
  &__wrap {
    padding: 1rem;
    height: 100%;
    overflow: auto;
  }
}
</style>

