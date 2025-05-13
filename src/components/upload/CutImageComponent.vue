<script setup lang="ts">
import Panel from '../../rightPanel/attrs/panel.vue'
import {useActiveObjectModel} from '@/views/Editor/hooks/useActiveObjectModel'
import {useEditor} from '@/views/Editor/app'
import SwipeNumber from '@/components/swipeNumber'
import type {SelectProps} from '@arco-design/web-vue/es/select'
import {useColor} from '@/views/Editor/hooks/useActiveObjectColor'
import {nextTick, ref, watch} from "vue";
import MAUpload from "@/components/upload/m-a-upload.vue";
import CutImageComponent from "@/components/upload/CutImageComponent.vue";
import {isDefined} from "@vueuse/core";
import {addViewport} from "@leafer-in/viewport";
const baseUrl = import.meta.env.VITE_UPLOAD_BASE_URL;
const {canvas,editor} = useEditor()
const image=ref('');
const stroke = useActiveObjectModel('stroke')
const strokeWidth = useActiveObjectModel('strokeWidth')
const currentImg = ref('');
const cutImageComponent=ref();
const imageFileInput = ref(null);
const editImg = () =>{
  if(useActiveObjectModel('tag')!=null && useActiveObjectModel('tag').value!=null && useActiveObjectModel('tag').value.modelValue=='Image'){
    cutImageComponent.value.openModal(useActiveObjectModel('url').value.modelValue)
  }else {
    cutImageComponent.value.openModal(useActiveObjectModel('fill').value.modelValue.url)
  }
}
const cutDown = (e) =>{
  adaptiveImage(e.dataURL)
}
const getCurrentImg = () =>{
  console.log(useActiveObjectModel('tag'));
  if(useActiveObjectModel('tag')!=null && useActiveObjectModel('tag').value!=null && useActiveObjectModel('tag').value.modelValue=='Image'){
    currentImg.value=useActiveObjectModel('url').value.modelValue;
  }else {
    currentImg.value=useActiveObjectModel('fill').value.modelValue.url;
  }

}
watchEffect(() => {
  const activeObject = editor.activeObject.value;
  if (isDefined(activeObject) && editor.activeObjectIsType('Image','Image2')) {
    getCurrentImg();
  }
})
getCurrentImg();
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (res) => {
      const base = res.target?.result
      resolve(base)
    }
    reader.onerror = (error) => {
      reject(error)
    }
    reader.readAsDataURL(file)
  })
}
const patternUploadSuccess = (response: any) => {
  console.log(response);
  fileToBase64(response.file).then(res =>{
    adaptiveImage(res);
  })
}
const adaptiveImage = (res) =>{
  let activeObject = editor.activeObject.value;
  let orightWidht=null;
  let orightHeight=null;
  if(activeObject.tag=='Image2'){
    if(activeObject.orightWidht!=null && activeObject.orightHeight!=null){
      orightWidht=activeObject.orightWidht;
      orightHeight=activeObject.orightHeight;
    }else{
      orightWidht=activeObject.width;
      orightHeight=activeObject.height;
    }

  }
  else{
    if(activeObject.orightWidht!=null && activeObject.orightHeight!=null){
      orightWidht=activeObject.orightWidht;
      orightHeight=activeObject.orightHeight;
    }else{
      orightWidht=activeObject.width;
      orightHeight=activeObject.height;
    }
  }
  var img = new Image();
  img.src = res;
  img.onload = function() {
    nextTick(() => {
      let divWidht=orightWidht;
      let divHeight=orightHeight;
      let pImage=img.width/img.height;
      let dImage=divWidht/divHeight;
      let finalWidth=divWidht*pImage
      let finalHeight=divHeight;
      if(dImage<=pImage){
        finalWidth=divWidht;
        finalHeight=divWidht/pImage;
      }
      refreshDraw(res,orightHeight,orightWidht,finalWidth,finalHeight);
    })
  }
}
const refreshDraw = (res,orightHeight,orightWidht,finalWidth,finalHeight) =>{
  stroke.value.onChange({url:res,orightHeight:orightHeight,orightWidht:orightWidht,height:finalHeight,width:finalWidth})
  getCurrentImg();
}
const uploadImageAction = () =>{
  if(imageFileInput.value){
    imageFileInput.value.click();
  }
}
const uploadImage = (event) =>{
  const file = event.target.files[0];
  let value= {
    file:file,
  }
  patternUploadSuccess(value);
}
</script>

<template>
    <Panel
            title="图片预览" hidden-add
    >
        <a-space direction="vertical">
            <a-row :gutter="[4, 4]">
              <a-col :span="24">
                <div class="image-container">
                  <img :src="currentImg">
                </div>
              </a-col>
              <a-col :span="12">
                <a-button  type="primary" @click="uploadImageAction">
                  <template #icon>
                    <icon-upload />
                  </template>
                  替换图片
                </a-button>
                <input type="file" @change="uploadImage" style="display: none" ref="imageFileInput" accept="image/*"/>
              </a-col>
              <a-col :span="12">
                <a-button type="primary" @click="editImg">
                  <template #icon>
                    <icon-image />
                  </template>
                  剪切图片
                </a-button>
              </a-col>
            </a-row>
        </a-space>
    </Panel>
  <CutImageComponent ref="cutImageComponent" @cutDown="cutDown"></CutImageComponent>
</template>

<style scoped lang="less">
.image-container {
  width: 100%; /* 或者你想要的任何宽度 */
  height: 200px; /* 或者你想要的任何高度 */
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* 保持宽高比，完整显示图片 */
  /* 或者使用 cover 来覆盖整个容器，但可能会被裁剪 */
}
</style>
