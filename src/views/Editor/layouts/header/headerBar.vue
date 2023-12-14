<template>
    <div class="header-box">
        <div class="flex items-center h-40px px-2 header-bar">
            <div class="flex-1 flex items-center">
                <div class="text-center px-15px">
                    <div style="width: max-content">
                        <icon-home class="m-r-5px" :size="20"/>
                        <span class="black font-bold">果子米-开源海报设计器</span>
                    </div>
                </div>
                <a-divider direction="vertical"/>
                <file-oper/>
                <a-divider direction="vertical"/>
                <undo/>
                <a-divider direction="vertical"/>
                <a-space size="medium">
                    <a-tooltip effect="dark" content="标尺" mini>
                        <a-button class="icon-btn pd-5px"  @click="changeLineGuides">
                            <icon-paste :size="18" :class="canvas.ref.enabledRuler.value?'arco-icon-check':''"/>
                        </a-button>
                    </a-tooltip>
                </a-space>
                <a-divider direction="vertical"/>
                <operation/>
                <a-divider direction="vertical"/>
                <zoom/>
            </div>
            <div class="truncate">

            </div>
            <div class="flex-1 flex justify-center">
                <div class="truncate">
                    <tool-bar v-if="isDefined(canvas.activeObject) && !typeUtil.isBottomCanvas(canvas.activeObject.value)" />
                </div>
            </div>
            <div class="flex-1 flex justify-end">
                <save-oper/>
            </div>
        </div>
        <!-- 标尺 -->
<!--        <line-guides :show="showLineGuides" />-->
    </div>
</template>

<script setup lang="ts">
import {useEditor} from "@/views/Editor/app";
import {Platform} from "leafer-ui";
import Zoom from './left/zoom.vue'
import Operation from './left/operation.vue'
import Undo from './left/undo.vue'
import FileOper from './left/fileOper.vue'
import SaveOper from './right/saveOper.vue'
import ToolBar from './center/toolBar.vue'
import {isDefined} from '@vueuse/core'
import {typeUtil} from "@/views/Editor/utils/utils";

Platform.image.suffix= ''
const {canvas,keybinding} = useEditor()
// import LineGuides from "@/views/Editor/layouts/canvasEdit/lineGuides.vue";

const changeLineGuides = ()=> {
    keybinding.trigger("shift+r")
}

</script>
<style lang="less">
.down-list {
  padding: 0 !important;
  margin: 0 !important;
  min-width: 200px;

  ul {
    padding: 0;
    margin: 5px 0;
    list-style: none;
  }

  li {

    padding: 0 20px;
    cursor: pointer;
    color: #1b2337;
    display: block;
    font-size: 14px;
    line-height: 40px;
    overflow: hidden;
    position: relative;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  li:hover {
    cursor: pointer;
    background-color: #f1f2f4;
  }
}
</style>
<style scoped lang="less">
@import "../../styles/layouts";
.header-box{
    height: @headerBoxHeight;
}
.header-bar {
  border-bottom: 1px solid var(--color-border);
  border-radius: 2px 2px 0 0;
}

.file-basic {
  padding: 10px;
  width: 200px;
  background-color: var(--color-bg-popup);
  border-radius: 4px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);
}

.border-bottom {
  border-bottom: 1px solid var(--color-border);
  border-radius: 2px 2px 0 0;
}

</style>
