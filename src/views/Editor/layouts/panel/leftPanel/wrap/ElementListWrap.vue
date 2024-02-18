<template>
    <div class="wrap">
<!--        <search-header v-model="keyword" @changeCate="changeCate" @search="onSearch"/>-->
        <a-scrollbar style="height:calc(100vh - 2.5rem);overflow: auto;">
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
                                         :src="item.thumb"
                                />
                            </div>
                        </div>
                    </div>
                </div>
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
                                    :src="item.thumb"
                            />
                        </div>
                    </a-space>
                </ul>
            </div>
        </a-scrollbar>
    </div>
</template>

<script lang="ts" setup>

import {useEditor} from "@/views/Editor/app";
import {Image} from "leafer-ui";
import {getDefaultName} from "@/views/Editor/utils/utils";
import usePageMixin from "@/views/Editor/layouts/panel/leftPanel/wrap/mixins/pageMixin";
import {queryGraphImageList} from "@/api/editor/materials";
const {editor} = useEditor()
const keyword = ref();
const currentCate = ref(null);
const list = ref([]);

const { page } = usePageMixin()
page.dataList = [
    {
        name: "箭头",
        list: [
            {
                title: "矢量箭头贴纸",
                thumb: "https://res.palxp.cn/static/material/gd-33923124/202009110528-cbd6.svg",
                url: "https://res.palxp.cn/static/material/gd-33923124/202009110528-cbd6.svg",
            },
        ],
    },
    {
        name: "矩形",
        list: [
            {
                title: "制圆",
                thumb: "https://res.palxp.cn/static/material/gd-33923124/202009110528-cbd6.svg",
                json: "",
            },
        ],
    },
    {
        name: "圆环",
        list: [
            {
                title: "制圆",
                thumb: "https://res.palxp.cn/static/material/gd-33923124/202009110528-cbd6.svg",
                json: "",
            },
        ],
    },
    {
        name: "线条",
        list: [
            {
                title: "制圆",
                thumb: "https://res.palxp.cn/static/material/gd-33923124/202009110528-cbd6.svg",
                json: "",
            },
        ],
    },
    {
        name: "多边形",
        list: [
            {
                title: "制圆",
                thumb: "https://res.palxp.cn/static/material/gd-33923124/202009110528-cbd6.svg",
                json: "",
            },
        ],
    },
    {
        name: "星标",
        list: [
            {
                title: "制圆",
                thumb: "https://res.palxp.cn/static/material/gd-33923124/202009110528-cbd6.svg",
                json: "",
            },
        ],
    },
]
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
}
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
  }
}
</style>
