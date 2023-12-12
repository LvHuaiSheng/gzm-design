<script setup lang="ts">
import Panel from './panel.vue'
import {useActiveObjectModel} from '@/views/Editor/hooks/useActiveObjectModel'
import {useEditor} from '@/views/Editor/app'
import TinyEditor from "@/components/tinymce/tinyEditor.vue";

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
    // TODO 2023-12-11 已反馈给官方富文本不能双向绑定数据的问题，等待修复
    textValue.value.onChange(newTextVal.value)
};
const handleCancel = () => {
    visible.value = false;
}


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
                <tiny-editor v-model="newTextVal" height="600"/>
            </div>
        </a-modal>
    </div>
</template>

<style scoped lang="less"></style>
