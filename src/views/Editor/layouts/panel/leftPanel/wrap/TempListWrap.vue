<template>
    <div class="wrap">
        <search-header :cateList="cateList" v-model="keyword" @changeCate="changeCate" @search="onSearch"/>
        <div class="temp-wrap">
            <comp-list-wrap @fetchData="fetchData" :data="page.dataList" :config="config" :noMore="page.noMore" max-height="calc(100vh - 115px)">
                <template #item="{ item, url, index }">
                    <a-card hoverable @click="handleClick(item)" class="cursor-pointer drop-shadow" :body-style="{ padding: '0px' }">
                        <div class="">
                            <div class="tags">
                                <div class="tag">免费</div>
<!--                                <div>ag</div>-->
                            </div>
                            <LazyImg :url="url" class="img" />
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
import { LazyImg, Waterfall } from '@/components/vue-waterfall-plugin-next'
import loading from '@/assets/images/loading.png'
import error from '@/assets/images/error.png'
import searchHeader from "@/components/editorModules/searchHeader.vue";
const config= {
    imgSelector:'cover',
}

import {useEditor} from "@/views/Editor/app";
import {Group,Image} from "leafer-ui";
const {editor} = useEditor()
import {getDefaultName} from "@/views/Editor/utils/utils";
import CompListWrap from "@/views/Editor/layouts/panel/leftPanel/wrap/CompListWrap.vue";
import usePageMixin from "@/views/Editor/layouts/panel/leftPanel/wrap/mixins/pageMixin";
import {queryTemplateList} from "@/api/editor/materials";
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
page.pageSize = 20
const fetchData = () => {
    queryTemplateList(page).then(res =>{
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
    editor.importJsonToCurrentPage(item.json,true)
}
</script>

<style lang="less" scoped>
.search__wrap {
    padding: 1.4rem 1rem 0.8rem 0rem;
}
.temp-wrap .tags{
  .tag{
    background-color: rgba(0,0,0,.6);
    //background-color:  rgb(var(--primary-6));
    border-radius: 8px;
    top: 6px;
    box-shadow: 0 1px 4px 0 rgba(0,0,0,.16);
    color: #fff;
    font-size: 12px;
    height: 16px;
    line-height: 16px;
    padding: 0 6px;
    position: absolute;
    left: 6px;
    z-index: 11;
  }
}
</style>
