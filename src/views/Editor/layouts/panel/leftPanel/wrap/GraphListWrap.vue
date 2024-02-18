<template>
    <div class="wrap">
        <search-header :cateList="cateList" v-model="keyword" @changeCate="changeCate" @search="onSearch"/>
        <div class="other-text-wrap">
            <div v-show="!currentCate" class="content__wrap">
                <div v-for="(cate, index) in page.dataList" :key="index + 't'">
                    <div v-if="cate.list.length > 0" class="types__header" @click="selectCate(cate)">
                        <span style="flex: 1">{{ cate.name }}</span>
                        <span class="types__header-more">全部<icon-right /></span>
                    </div>
                    <div v-else class="loading"><i class="el-icon-loading" /> 拼命加载中</div>
                    <div class="list-wrap">
                        <div v-for="(item, i) in cate.list" :key="i + 'sl'" draggable="false" @click="handleClick(item)" >
<!--                            <el-image class="list__img-thumb" :src="item.url" fit="contain"></el-image>-->
                            <a-image v-if="i<3"
                                  class="list__img-thumb"
                                  height="95"
                                  width="95"
                                :preview="false"
                                fit="contain"
                                :src="item.url"
                            />
                        </div>
                    </div>
                </div>
            </div>
<!--            <comp-list-wrap v-show="!currentCate" @fetchData="fetchData" :data="page.dataList" :config="config" :noMore="page.noMore" max-height="calc(100vh - 115px)">-->
<!--                <template #item="{ item, url, index }">-->
<!--                    <a-card hoverable @click="handleClick(item)" class="cursor-pointer drop-shadow " :body-style="{ padding: '5px' }">-->
<!--                        <div class="">-->
<!--&lt;!&ndash;                            <LazyImg :url="url" class="img" />&ndash;&gt;-->
<!--                            <a-image-->
<!--                                height="82"-->
<!--                                width="100%"-->
<!--                                :preview="false"-->
<!--                                fit="contain"-->
<!--                                :src="url"-->
<!--                            />-->
<!--                        </div>-->
<!--&lt;!&ndash;                        <div class="p5px">&ndash;&gt;-->
<!--&lt;!&ndash;                            <span class="name truncated">{{ item.name }}</span>&ndash;&gt;-->
<!--&lt;!&ndash;                        </div>&ndash;&gt;-->
<!--                    </a-card>-->
<!--                </template>-->
<!--            </comp-list-wrap>-->
            <ul v-if="currentCate" class="infinite-list" :infinite-scroll-distance="150" style="overflow: auto">
                <span class="types__header-back" @click="backCate"><icon-left />{{ currentCate.name }}</span>
                <a-space fill wrap :fillRatio="30" direction="horizontal" class="list">
                    <div v-for="(item, i) in list" :key="i + 'i'" class="list__item" draggable="false" @click="handleClick(item)">
<!--                        <el-image class="list__img" :src="item.thumb" fit="contain"></el-image>-->
                        <a-image
                                class="list__img"
                                :preview="false"
                                height="95"
                                width="95"
                                fit="contain"
                                :src="item.url"
                        />
                    </div>
                </a-space>
<!--                <div v-show="loading" class="loading"><i class="el-icon-loading" /> 拼命加载中</div>-->
<!--                <div v-show="loadDone" :style="list.length <= 0 ? 'padding-top: 4rem' : ''" class="loading">全部加载完毕</div>-->
            </ul>
<!--            <comp-list-wrap v-if="currentCate" @fetchData="fetchData" :data="page.dataList" :config="config" :noMore="page.noMore" max-height="calc(100vh - 115px)">-->
<!--                <template #item="{ item, url, index }">-->
<!--                    <a-card hoverable @click="handleClick(item)" class="cursor-pointer drop-shadow " :body-style="{ padding: '5px' }">-->
<!--                        <div class="">-->
<!--&lt;!&ndash;                            <LazyImg :url="url" class="img" />&ndash;&gt;-->
<!--                            <a-image-->
<!--                                height="82"-->
<!--                                width="100%"-->
<!--                                :preview="false"-->
<!--                                fit="contain"-->
<!--                                :src="url"-->
<!--                            />-->
<!--                        </div>-->
<!--                        &lt;!&ndash;                      <div class="p5px">&ndash;&gt;-->
<!--                        &lt;!&ndash;                          <span class="name truncated">{{ item.name }}</span>&ndash;&gt;-->
<!--                        &lt;!&ndash;                      </div>&ndash;&gt;-->
<!--                    </a-card>-->
<!--                </template>-->
<!--            </comp-list-wrap>-->
        </div>
    </div>
</template>

<script lang="ts" setup>
import {LazyImg} from '@/components/vue-waterfall-plugin-next'

import {useEditor} from "@/views/Editor/app";
import {Image} from "leafer-ui";
import {getDefaultName} from "@/views/Editor/utils/utils";
import CompListWrap from "@/views/Editor/layouts/panel/leftPanel/wrap/CompListWrap.vue";
import usePageMixin from "@/views/Editor/layouts/panel/leftPanel/wrap/mixins/pageMixin";
import {queryGraphImageList} from "@/api/editor/materials";
import SearchHeader from "@/components/editorModules/searchHeader.vue";
const {editor} = useEditor()
const config= {
    imgSelector:'thumb',
    gutter: 2,
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
            rowPerView: 3
        }
    },
}
const keyword = ref();
const currentCate = ref(null);
const list = ref([]);
const cateList = reactive([
    {label:'全部',value:'-1'},
    {label:'风景图片',value:'1111'},
    {label:'插画图片',value:'1111'},
]);
const changeCate = (e) => {
    console.log('e=',e)
}
const onSearch = (value,ev) => {
    console.log('value=',value)
    console.log('keyword=',keyword.value)
    console.log('ev=',ev)
}
const { page } = usePageMixin()
page.pageSize = 30
const fetchData = () => {
    queryGraphImageList(page).then(res =>{
        if (res.success) {
            const newDataList = res.data.records
            if (newDataList.length > 0) {
                page.dataList.push(...newDataList)
                page.pageNum += 1
            }
            if (page.dataList.length >= res.data.total) {
                page.noMore = true
            } else {
                page.noMore = false
            }
        }
    })
}
const handleClick = (item) => {
    const image = new Image({
        name:getDefaultName(editor.contentFrame),
        editable: true,
        x:0,
        y:0,
        ...item,
    })
    editor.add(image)
}
const backCate = () => {
    currentCate.value = null
    list.value = []
}
const selectCate = (cate) => {
    currentCate.value = cate
    list.value = cate.list
    // queryGraphImageList(page).then(res =>{
    //     if (res.success) {
    //         const newDataList = res.data.records
    //         if (newDataList.length > 0) {
    //             page.dataList.push(...newDataList)
    //             page.pageNum += 1
    //         }
    //         if (page.dataList.length >= res.data.total) {
    //             page.noMore = true
    //         } else {
    //             page.noMore = false
    //         }
    //     }
    // })
}
fetchData()
</script>

<style lang="less" scoped>
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

.tags {
  padding: 20px 0 0 10px;
  &__item {
    margin: 0 8px 8px 0;
  }
}

.infinite-list {
  height: 100%;
  padding-bottom: 150px;
}
.list {
  width: 100%;
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
.list-wrap {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.8rem;
}

.loading {
  padding-top: 1rem;
  text-align: center;
  font-size: 14px;
  color: #999;
}

.content {
  &__wrap {
    padding: 1rem;
    height: 100%;
    overflow: auto;
    padding-bottom: 100px;
  }
}
</style>
