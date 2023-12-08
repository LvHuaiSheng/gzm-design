<!--
 * @Author: ShawnPhang
 * @Date: 2022-01-27 11:05:48
 * @Description:
 * @LastEditors: ShawnPhang <site: book.palxp.com>
 * @LastEditTime: 2023-06-29 16:50:02
-->
<template>
    <div class="search__wrap">
        <a-input-group>
            <a-dropdown v-if="cateList && cateList.length>0" placement="bottom-start">
                <div class="search__type">
                    <icon-menu/>
                </div>
                <template #content>
                    <a-doption v-for="(item,index) in cateList" :key="index"
                               @click.stop="action('changeCate', item, index)">
                        <span :class="['cate__text', { 'cate--select': + currentIndex === index }]">{{
                            item.label
                            }}</span>
                    </a-doption>
                </template>
            </a-dropdown>
            <a-input-search v-model="searchValue" placeholder="输入关键词搜索" @search="onSearch"/>
        </a-input-group>
    </div>
</template>
<script lang="ts">
import {defineComponent, reactive, toRefs, watch} from 'vue'
import {useRoute} from 'vue-router'

export default defineComponent({
    props: ['cateList', 'modelValue'],
    emits: ['update:modelValue', 'search', 'changeCate'],
    setup(props, context) {

        const route = useRoute()
        const state: any = reactive({
            searchValue: '',
            materialCates: [],
            currentIndex: 0,
        })

        if (props.cateList) {
            state.cateList = props.cateList
            //   const { cate } = route.query
            //   cate && (state.currentIndex = cate)
            //   cate && action('change', state.materialCates[Number(cate)], Number(cate))
        }

        watch(
            () => state.searchValue,
            () => {
                context.emit('update:modelValue', state.searchValue)
            },
        )

        function action(fn: string, item: any, currentIndex: number | string) {
            state.currentIndex = currentIndex
            context.emit(fn, item, currentIndex)
        }

        function onSearch(value: string, ev: MouseEvent) {
            context.emit('search', value, ev)
        }

        return {
            ...toRefs(state),
            action,
            onSearch,
        }
    },
})
</script>

<style lang="less" scoped>
:deep(.el-input__suffix) {
  padding-top: 9px;
}

.search__wrap {
  padding: 16px 1rem 0rem 0rem;
  display: flex;
  cursor: pointer;
  justify-content: center;
}

.search {
  &__type {
    border: 1px solid #e8eaec;
    color: #666666;
    width: 44px;
    margin: 0 0.6rem 0 1rem;
    border-radius: 4px;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 14px;

    .iconfont {
      font-size: 20px;
    }
  }

  &__type:hover {
    color: rgb(var(--primary-6));
  }
}

.cate {
  &__text {
    font-weight: bold;
  }

  &--select {
    color: rgb(var(--primary-6));
  }
}
</style>
