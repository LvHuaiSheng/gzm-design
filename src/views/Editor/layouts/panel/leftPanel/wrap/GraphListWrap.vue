<template>
    <div class="wrap">
        <search-header :cateList="cateList" v-model="keyword" @changeCate="changeCate" @search="onSearch"/>
        <div class="other-text-wrap">
            <comp-list-wrap @fetchData="fetchData" :data="page.dataList" :config="config" :noMore="page.noMore" max-height="calc(100vh - 115px)">
                <template #item="{ item, url, index }">
                    <a-card hoverable @click="handleClick(item)" class="cursor-pointer drop-shadow " :body-style="{ padding: '5px' }">
                        <div class="">
<!--                            <LazyImg :url="url" class="img" />-->
                            <a-image
                                height="82"
                                width="100%"
                                :preview="false"
                                fit="contain"
                                :src="url"
                            />
                        </div>
                        <!--                      <div class="p5px">-->
                        <!--                          <span class="name truncated">{{ item.name }}</span>-->
                        <!--                      </div>-->
                    </a-card>
                </template>
            </comp-list-wrap>
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
</script>

<style lang="less" scoped>
.search__wrap {
  padding: 1.4rem 1rem 0.8rem 0rem;
}
.min-h{
    min-height: 300px;
}
</style>
