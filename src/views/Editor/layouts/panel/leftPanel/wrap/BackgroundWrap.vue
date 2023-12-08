<template>
    <div id="text-list-wrap" style="margin-top: 0.5rem">
        <div class="basic-text-wrap">
            <div class="color__box">
                <div v-for="c in colors" :key="c" :style="{ background: c }" class="color__item" @click="setBGcolor(c)"></div>
            </div>
        </div>
        <div class="other-text-wrap">
            <comp-list-wrap @fetchData="fetchData"
                            :config="config"
                            :data="page.dataList" :noMore="page.noMore" max-height="calc(100vh - 175px)">
                <template #item="{ item, url, index }">
                    <a-card hoverable @click="setBgImage(item)" class="cursor-pointer drop-shadow" :body-style="{ padding: '0px' }">
                        <div class="">
                            <LazyImg :url="url" class="img" />
<!--                            <a-image-->
<!--                                height="99"-->
<!--                                width="100%"-->
<!--                                :preview="false"-->
<!--                                fit="cover"-->
<!--                                :src="url"-->
<!--                            />-->
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

<script setup lang="ts">
import {useEditor} from "@/views/Editor/app";
import CompListWrap from "@/views/Editor/layouts/panel/leftPanel/wrap/CompListWrap.vue";
import {LazyImg} from "@/components/vue-waterfall-plugin-next";
import {queryBgImgMaterialList} from "@/api/editor/materials";
import usePageMixin from "@/views/Editor/layouts/panel/leftPanel/wrap/mixins/pageMixin";

const {canvas} = useEditor()
/**
 * 注意：这里的背景填充是整个画布的背景
 */

const fillArray = ref([])
watchEffect(() => {
    if (canvas.contentFrame.proxyData.fill) {
        fillArray.value = <any>canvas.contentFrame.proxyData.fill
    } else {
        fillArray.value = []
    }
})

const refreshFill = () => {
    canvas.selectObject(null)
    canvas.contentFrame.proxyData.fill = []
    canvas.contentFrame.proxyData.fill = fillArray.value.length <= 0 ? [] : fillArray.value
}

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
const colors =  ['#000000ff', '#999999ff', '#CCCCCCff', '#FFFFFFff', '#E65353ff', '#FFD835ff', '#70BC59ff', '#607AF4ff', '#976BEEff']


const setBGcolor = (color) => {
    fillArray.value.push({
        type: 'solid',
        color: color,
    })
    refreshFill()
}
const setBgImage = (item: any) => {
    fillArray.value.push({
        type: 'image',
        url: item.url,
    })
    refreshFill()
}
const { page } = usePageMixin()
page.pageSize = 30
const fetchData = () => {
    queryBgImgMaterialList(page).then(res => {
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

    // if (current.value <= 5) {
    //     data.push(...imageData.list)
    //     current.value += 1
    // } else {
    //     bottom.value = true
    // }
}
const dragStart = (e: Element, item: any) => {

}
</script>

<style lang="less" scoped>
// Color variables (appears count calculates by raw css)
@color0: #3b74f1; // Appears 2 times
.color {
    &__box {
        padding: 1.2rem 0.7rem;
        display: flex;
        flex-wrap: wrap;
    }
    &__item {
        border: 1px solid rgba(0, 0, 0, 0.08);
        margin: 2.8px;
        width: 43px;
        height: 36px;
        border-radius: 2px;
        cursor: pointer;
    }
}
</style>
