<script setup lang="ts">
import Panel from './panel.vue'
import {useActiveObjectModel} from '@/views/Editor/hooks/useActiveObjectModel'
import {useEditor} from '@/views/Editor/app'
import TinyEditor from "@/components/tinymce/tinyEditor.vue";
import {useFontStore} from "@/store";
import {Message} from "@arco-design/web-vue";
import FontFaceObserver from "fontfaceobserver";
import {addCustomFontBase64, getCustomFontsStyle} from "@/utils/fonts/utils";
const {fontList,skipLoadFonts,} = storeToRefs(useFontStore())
const textValue = useActiveObjectModel('text')

const visible = ref(false)

const {canvas} = useEditor()

const newTextVal = ref()

const showEdit = () => {
    visible.value = true;
    newTextVal.value = textValue.value.modelValue
};
const handleOk = () => {
    visible.value = false;
    textValue.value.onChange(newTextVal.value)
};
const handleCancel = () => {
    visible.value = false;
}

/**
 * TODO 这里切换的的字体在富文本中可以正常，但是添加到canvas中后就没有了，听leafer说是目前富文本只能加载系统字体的原因，临时可以把字体文件放到部署服务器系统字体中，然后可以直接加载系统字体就可以正常使用
 * @param record
 */
const changeFontFamily = async (record) => {
    const fontFamilyName = record
    if (skipLoadFonts.value.includes(fontFamilyName)) {
        return;
    } else {
        // 字体加载
        const loading = Message.loading({
            content: `正在加载字体 【${fontFamilyName}】`,
            duration: 0
        })
        await addCustomFontBase64(record)
        const font = new FontFaceObserver(fontFamilyName);
        font
            .load(null, 150000)
            .then(() => {
                loading.close()
                canvas.getActiveObject()?.refreshFontStyle()
                canvas.activeObject.value?.forceUpdate()
            })
            .catch((err) => {
                console.log(err);
                loading.close()
                Message.error({
                    content: `加载字体【${fontFamilyName}】失败 ${err}`
                })
            });
    }
}
const fontListStr = computed(() => {
    const list = fontList.value
    let join = list.map(item => `${item.name}='${item.name}'`).join(';');
    return join
})
const fontListStyle = computed(() => {
    const style = getCustomFontsStyle()
    return style
})
</script>

<template>
    <div>
        <Panel title="内容" hidden-add>
            <a-row :wrap="false" :gutter="[4, 4]" align="center">
                <a-col>
                    <a-button @click="showEdit()" type="primary">点击编辑</a-button>
                </a-col>
            </a-row>
        </Panel>
        <a-modal v-model:visible="visible" title="文本编辑" @ok="handleOk()" @cancel="handleCancel()" width="900px">
            <div>
                <tiny-editor v-model="newTextVal" height="600" :font_family_formats="fontListStr" @changeFontFamily="changeFontFamily" :contentStyle="fontListStyle"/>
            </div>
        </a-modal>
    </div>
</template>

<style scoped lang="less"></style>
