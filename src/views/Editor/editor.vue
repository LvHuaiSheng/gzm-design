<template>
    <div class="layout-box">
        <a-spin :loading="loading" tip="正在初始化" style="height: 100%;width: 100%">
            <a-layout style="height: 100%">
                <a-layout-header>
                    <headerBar/>
                </a-layout-header>
                <a-layout>
                    <leftPanel/>
                    <a-layout-content >
                        <a-layout class="editor-box">
                            <a-layout-content class="dea-main-container" >
                                <div style="background-color: #fff">
                                    <canvas-edit/>
                                </div>
                            </a-layout-content>
                            <footerBar/>
                        </a-layout>
                    </a-layout-content>
                    <rightPanel/>
                </a-layout>
            </a-layout>
        </a-spin>
    </div>
</template>

<script setup lang="ts">

import HeaderBar from '@/views/Editor/layouts/header/headerBar.vue'
import LeftPanel from '@/views/Editor/layouts/panel/leftPanel'
import RightPanel from '@/views/Editor/layouts/panel/rightPanel'
import FooterBar from '@/views/Editor/layouts/footer/footerBar.vue'
import CanvasEdit from "@/views/Editor/layouts/canvasEdit/canvasEdit.vue";
import {getActiveCore} from '@/views/Editor/core'
import {appInstance} from '@/views/Editor/app'
import {EditorMain} from '@/views/Editor/app/editor'


const position = ref('1')
const loading = ref(true)

onBeforeMount(() => {
    loading.value = false
    const { service } = getActiveCore()
    appInstance.editor = service.createInstance(EditorMain)
    appInstance.editor.startup()
})

onBeforeUnmount(() => {
    appInstance.editor.dispose()
    appInstance.editor = null!
})

</script>
<style>

</style>
<style lang="less" scoped>
@import "./styles/layouts";
.editor-box{
  height: calc(100vh - @contentLayoutPadding*2);
}
.dea-main-container {
    background-color: #f1f2f4;
    max-width: 100%;
    padding: @contentLayoutPadding;
    overflow: hidden;
    height: 100%;
    position: relative;
}
/*马赛克背景样式，和.contentBox一起使用，用起来有点晃眼*/
.dea-main-container-wrap{
    --offsetX: 0px;
    --offsetY: 0px;
    --size: 14px;
    --color: #dedcdc;
    background-image: linear-gradient(45deg,var(--color) 25%,transparent 0,transparent 75%,var(--color) 0),linear-gradient(45deg,var(--color) 25%,transparent 0,transparent 75%,var(--color) 0);
    background-position: var(--offsetX) var(--offsetY),calc(var(--size) + var(--offsetX)) calc(var(--size) + var(--offsetY));
    background-size: calc(var(--size) * 2) calc(var(--size) * 2);
}

.layout-box {
    height: 100vh;
    overflow: hidden;
}
</style>
