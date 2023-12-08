<template>
    <div class="wrap">
        <a-list :max-height="props.maxHeight" @reach-bottom="fetchData" :scrollbar="scrollbar" :bordered="false">
            <template #scroll-loading>
                <div v-if="props.noMore">没有更多了</div>
                <a-spin v-else/>
            </template>
            <Waterfall
                    :list="props.data"
                    :row-key="config.rowKey"
                    :gutter="config.gutter"
                    :has-around-gutter="config.hasAroundGutter"
                    :width="config.width"
                    :breakpoints="config.breakpoints"
                    :img-selector="config.imgSelector"
                    :background-color="config.backgroundColor"
                    :animation-effect="config.animationEffect"
                    :animation-duration="config.animationDuration"
                    :animation-delay="config.animationDelay"
                    :lazyload="config.lazyload"
                    :load-props="config.loadProps"
                    :cross-origin="config.crossOrigin"
                    :delay="config.delay"
            >
                <template #item="{ item, url, index }">
                    <!--                  <a-card hoverable class="cursor-pointer drop-shadow" :body-style="{ padding: '0px' }">-->
                    <!--                      <div class="">-->
                    <!--                          <LazyImg :url="url" class="img" />-->
                    <!--                      </div>-->
                    <!--&lt;!&ndash;                      <div class="p5px">&ndash;&gt;-->
                    <!--&lt;!&ndash;                          <span class="name truncated">{{ item.name }}</span>&ndash;&gt;-->
                    <!--&lt;!&ndash;                      </div>&ndash;&gt;-->
                    <!--                  </a-card>-->
                    <slot name="item" :item="item" :index="index" :url="url"></slot>
                </template>
            </Waterfall>
        </a-list>
    </div>
</template>

<script lang="ts" setup>
import {LazyImg, Waterfall} from '@/components/vue-waterfall-plugin-next'
import loading from '@/assets/images/loading.png'
import error from '@/assets/images/error.png'

const waterfallOptions = {
    // 唯一key值
    rowKey: 'id',
    // 卡片之间的间隙
    gutter: 2,
    // 是否有周围的gutter
    hasAroundGutter: true,
    // 卡片在PC上的宽度
    width: 320,
    // 自定义行显示个数，主要用于对移动端的适配
    breakpoints: {
        1200: {
            // 当屏幕宽度小于等于1200
            rowPerView: 4
        },
        800: {
            // 当屏幕宽度小于等于800
            rowPerView: 3
        },
        500: {
            // 当屏幕宽度小于等于500
            rowPerView: 2
        }
    },
    // 动画效果
    animationEffect: 'animate__fadeInUp',
    // 动画时间
    animationDuration: 1000,
    // 动画延迟
    animationDelay: 0,
    // 布局刷新的防抖时间。！注意：此处设置为0将会出现视图更新问题
    delay: 50,
    // 背景色
    backgroundColor: '#fff',
    // imgSelector
    imgSelector: 'url',
    // 加载配置
    loadProps: {
        loading,
        error
    },
    // 是否懒加载
    lazyload: true
}
import imageData from '@/assets/data/imageData.json'
import {computed} from "vue";

const current = ref(1);
const bottom = ref(false);
const data = reactive([]);
const scrollbar = ref(true);
const props = withDefaults(
    defineProps<{
        data: any,
        config?: object
        maxHeight?: string | number,
        noMore?: boolean,
    }>(),
    {
        config:{},
        maxHeight: 'calc(100vh - 140px)',
        noMore: false
    }
)
const config = computed(() => {
    return Object.assign(waterfallOptions, props.config)
})
const emits = defineEmits(['fetchData'])
const fetchData = () => {
    emits('fetchData')
    console.log('reach bottom!');
}
</script>

<style lang="less" scoped>
@import "../../../../styles/layouts";
.wrap {
  width: 100%;
  height: 100%;
  min-width: @leftPanelWidth;
}

.search__wrap {
  padding: 1.4rem 1rem 0.8rem 0rem;
}

.infinite-list {
  height: 100%;
  padding-bottom: 150px;
}

.list {
  width: 100%;
  // padding: 20px 0 0 10px;
  padding: 3.1rem 0 0 1rem;

  &__item {
    overflow: hidden;
    background: #f8fafc;
  }

  &__img {
    cursor: pointer;
    width: 142px;
    height: 142px;
    padding: 4px;
    border-radius: 4px;
  }

  &__img-thumb {
    cursor: pointer;
    width: 90px;
    height: 90px;
    background: #f8fafc;
    padding: 4px;
    border-radius: 4px;
  }

  &__img:hover,
  &__img-thumb:hover {
    background: rgba(0, 0, 0, 0.05);
  }
}

.loading {
  padding-top: 1rem;
  text-align: center;
  font-size: 14px;
  color: #999;
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

.list-wrap {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.8rem;
}

.content {
  &__wrap {
    padding: 0.5rem 1rem;
    height: 100%;
    overflow: auto;
    padding-bottom: 100px;
  }
}
</style>
<script setup>
</script>
