<template>
    <a-space>
        <a-button @click="preview()">
            <template #icon>
                <icon-eye />
            </template>
            预览
        </a-button>
        <a-button type="primary" @click="save()">
            <template #icon>
                <icon-save />
            </template>
            保存
        </a-button>
        <a-dropdown-button type="primary" @select="handleSelect" @click="handleSelect">
            <icon-download class="m-r-8px"/>下载作品
            <template #icon>
                <icon-down/>
            </template>
            <template #content>
                <a-doption value="png">另存为PNG</a-doption>
                <a-doption value="jpg">另存为JPG</a-doption>
                <a-doption value="webp">另存为WEBP</a-doption>
                <a-doption value="json">另存为JSON</a-doption>
            </template>
        </a-dropdown-button>
    </a-space>
    <a-image-preview
            :src="previewUrl"
            v-model:visible="visiblePreview"
    />
</template>

<script setup lang="ts">
import {useEditor} from "@/views/Editor/app";

const {editor,keybinding} = useEditor()
import {downFile} from "@/utils/designUtil.js";
import {v4 as uuidv4} from "uuid";

const visiblePreview = ref(false)
const previewUrl = ref('')

const preview = async () => {
    /**
     *  TODO 优化预览功能
     *  1. 优化移动画布后预览图也会根据画布位置移动的问题（改为不跟随画布位置）
     *  ...
     */
    const result = await editor.contentFrame.export('png', {blob: true})
    const url = URL.createObjectURL(result.data);
    previewUrl.value = url
    visiblePreview.value = true
}
const save = () => {
    console.log('Get pages：',editor.getPages())
    let json = editor.contentFrame.toJSON()
    console.log(json)
}
const handleSelect = (v) => {
    let fileName = uuidv4()
    switch (v) {
        case 'png':
            editor.contentFrame.export(fileName + '.png')
            break
        case 'jpg':
            editor.contentFrame.export(fileName + '.jpg')
            break
        case 'webp':
            editor.contentFrame.export(fileName + '.webp')
            break
        case 'json':
            // editor.contentFrame.export(fileName + '.json')
            saveJson()
            break
        default:
            editor.contentFrame.export(fileName + '.png')
            break
    }
};
function saveJson() {
    const dataUrl = editor.contentFrame.toJSON();
    console.log('dataUrl=',dataUrl)
    const fileStr = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(dataUrl, null, '\t')
    )}`;
    downFile(fileStr, `${uuidv4()}.json`);
}
</script>

<style scoped>

</style>
