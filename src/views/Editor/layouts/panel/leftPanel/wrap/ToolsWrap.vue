<template>
    <div class="wrap">
        <div class="header">工具</div>
        <div class="item" @click="addQrcode">
            <div class="icon">
                <icon-qrcode :size="32"/>
            </div>
            <div class="text"><span>二维码</span><span class="desc">可自定义二维码内容，随意生成</span></div>
        </div>
        <div class="item" @click="addBarcode">
            <div class="icon">
                <icon-align-center :size="32" :rotate="-90"/>
            </div>
            <div class="text"><span>条形码</span><span class="desc">自定义一维码内容</span></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import QrCode from "@/views/Editor/core/shapes/QrCode";
import BarCode from "@/views/Editor/core/shapes/BarCode";
import {useEditor} from "@/views/Editor/app";
import {getDefaultName} from "@/views/Editor/utils/utils";


const {editor} = useEditor()
const addQrcode = async () => {
    const code = new QrCode({
        name:getDefaultName(editor.contentFrame),
        editable: true,
        x:0,
        y:0,
        text: 'http://guozimi.cn',
        size:100,
    })
    editor.add(code)
}
const addBarcode = async () => {
    const code = new BarCode({
        name:getDefaultName(editor.contentFrame),
        editable: true,
        x:0,
        y:0,
        height:100,
        width:200,
        text: '123456789012',
        codeHeight:100,
    })
    editor.add(code)
}
</script>

<style lang="less" scoped>
.wrap {
  width: 100%;
  height: 100%;
}
.header {
  padding: 17px 1rem;
  height: 56px;
  display: flex;
  position: relative;
  font-size: 16px;
  color: #333333;
  font-weight: bold;
  display: flex;
  align-items: center;
  user-select: none;
}
.item {
  opacity: 0.85;
  position: relative;
  border-radius: 4px;
  font-size: 15px;
  height: 72px;
  color: #33383e;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin: 0 1rem 16px;
  user-select: none;
  background-color: #f6f7f9;
}
.item:hover {
  opacity: 1;
}
.item-disabled{
  cursor: no-drop;
}
.item-disabled:hover{
  opacity: 0.85;

}
.icon {
  margin: 1rem;
  font-size: 32px;
}
.text {
  display: flex;
  flex-direction: column;
}
.desc {
  padding-top: 0.5rem;
  color: #7f8792;
  font-size: 12px;
}
</style>
