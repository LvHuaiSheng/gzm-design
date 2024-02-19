<template>
    <div class="wrap">
<!--        <search-header :cateList="cateList" v-model="keyword" @changeCate="changeCate" @search="onSearch"/>-->
        <comp-cate-list-wrap :data="page.dataList" :cate-list="cateList" :current-cate="currentCate" :no-more="page.noMore"
                             @fetch-data="loadList"
                             @back-cate="backCate"
                             @item-click="handleClick"
                             @select-cate="selectCate"
        ></comp-cate-list-wrap>
    </div>
</template>

<script lang="ts" setup>

import {useEditor} from "@/views/Editor/app";
import {Image} from "leafer-ui";
import {getDefaultName} from "@/views/Editor/utils/utils";
import CompCateListWrap from "@/views/Editor/layouts/panel/leftPanel/wrap/CompCateListWrap.vue";
import usePageMixin from "@/views/Editor/layouts/panel/leftPanel/wrap/mixins/pageMixin";
import {queryGraphCategory,queryGraphList} from "@/api/editor/materials";
import SearchHeader from "@/components/editorModules/searchHeader.vue";
const {editor} = useEditor()

const keyword = ref();
const currentCate = ref(null);
const cateList = ref([])

const onSearch = (value,ev) => {
    console.log('value=',value)
    console.log('keyword=',keyword.value)
    console.log('ev=',ev)
}
const { page } = usePageMixin()
page.pageSize = 30
const fetchData = () => {
    queryGraphCategory().then(res =>{
        if (res.success) {
            const list = res.data.records
            cateList.value = list
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
    page.dataList = []
}
const selectCate = (cate) => {
    currentCate.value = cate
    page.query.categoryId = cate.id
    page.pageNum = 1
    page.noMore = false
    // loadList()
}
const loadList = () => {
    page.query.categoryId = currentCate.value.id
    queryGraphList(page).then(res =>{
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
fetchData()
</script>
