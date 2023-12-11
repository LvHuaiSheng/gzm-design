<script setup lang="ts">
import Panel from './panel.vue'
import {useActiveObjectModel} from '@/views/Editor/hooks/useActiveObjectModel'
import type {SelectProps} from '@arco-design/web-vue/es/select'
import {popupMaxHeight} from '@/utils/arco'
import {useEditor} from '@/views/Editor/app'
import TipContentKey from "@/components/tooltip/tipContentKey.vue";
import SwipeNumber from "@/components/swipeNumber/swipeNumber.vue";
import TinyEditor from "@/components/tinymce/tinyEditor.vue";

const fontOptions = reactive([
    {
        value: 'arial',
        label: 'Arial',
    },
    {
        value: 'Times New Roman',
        label: 'Times New Roman',
    },
    {
        value: 'Microsoft Yahei',
        label: '微软雅黑',
    },
])

const weightOptions = reactive([
    {
        value: 'thin',
        label: '极细',
    },
    {
        value: 'extra-light',
        label: '特细',
    },
    {
        value: 'light',
        label: '细',
    },
    {
        value: 'normal',
        label: '正常',
    },
    {
        value: 'medium',
        label: '中等',
    },
    {
        value: 'semi-bold',
        label: '半粗',
    },
    {
        value: 'bold',
        label: '粗',
    },
    {
        value: 'extra-bold',
        label: '特粗',
    },
    {
        value: 'black',
        label: '极粗',
    },
])

const sizeOptions = reactive(
    [8, 9, 10, 11, 12, 14, 16, 18, 21, 24, 36, 48, 60, 72].map((size) => {
        return {
            value: size,
            label: size.toString(),
        }
    }),
)
const textWrapOptions = reactive(
    [
        {
            value: 'normal',
            label: '换行点自动换行',
        },
        {
            value: 'none',
            label: '强制不换行',
        },
        {
            value: 'break',
            label: '可断开word换行',
        },
    ]
)

const fontFamily = useActiveObjectModel<'fontFamily', SelectProps['modelValue']>('fontFamily')
const fontSize = useActiveObjectModel<'fontSize', SelectProps['modelValue']>('fontSize') // 字号
const textWrap = useActiveObjectModel<'textWrap', SelectProps['modelValue']>('textWrap') // 文本换行规则
const lineHeight = useActiveObjectModel('lineHeight') // 行号
const letterSpacing = useActiveObjectModel('letterSpacing') // 字距
const textAlign = useActiveObjectModel('textAlign')
const verticalAlign = useActiveObjectModel('verticalAlign')
const italic = useActiveObjectModel('italic') // 文字是否倾斜
const textDecoration = useActiveObjectModel('textDecoration')
const textOverflow = useActiveObjectModel('textOverflow')
const textValue = useActiveObjectModel('text')
const padding = useActiveObjectModel('padding', [0, 0, 0, 0])
// 文字粗细
const fontWeight = useActiveObjectModel<
    'fontWeight',
    SelectProps['modelValue']
>('fontWeight')

const visible = ref(false)
const textStyle = ref()

const {canvas} = useEditor()

const textOverflowType = ref('show')
const textOverflowVal = ref('')
watchEffect(() => {
    if (['show', 'hide'].includes(<string>textOverflow.value.modelValue)) {
        textOverflowType.value = <string>textOverflow.value.modelValue
    } else if (!textOverflow.value.modelValue) {
        textOverflowType.value = 'show'
    } else {
        textOverflowType.value = 'custom'
    }
    textOverflowVal.value = <string>textOverflow.value.modelValue
})
const changeTextOverflow = (val) => {
    if (['show', 'hide'].includes(val)) {
        textOverflow.value.onChange(val)
    } else {
        if (['show', 'hide'].includes(textOverflowVal.value) || !textOverflowVal.value) {
            textOverflowVal.value = '...'
        }
        textOverflow.value.onChange(textOverflowVal.value)
    }
}
const inputTextOverflowVal = (val) => {
    textOverflow.value.onChange(val)
}
const newTextVal = ref()
watchEffect(() => {
    newTextVal.value = textValue.value.modelValue
})
watchEffect(() => {
    // TODO 2023-12-11 已反馈给官方富文本不能双向绑定数据的问题，等待修复
    textValue.value.onChange(newTextVal.value)
})
const getContent = (v: string) => {
    // newTextVal.value = v
}

</script>

<template>
    <div>
        <Panel title="内容" hidden-add>
            <a-row :wrap="false" :gutter="[4, 4]" align="center">
                <a-col>
                    <a-button @click="visible = true" type="primary">点击编辑</a-button>
                </a-col>
            </a-row>
        </Panel>
        <Panel title="属性" hidden-add>
            <a-row :gutter="[4, 4]" >
                <a-col>
                    <a-select
                            size="small"
                            placeholder="文字字体"
                            v-bind="{ ...fontFamily, ...popupMaxHeight() }"
                            :options="fontOptions"
                    >
                        <template #prefix>
                            字体
                        </template>
                    </a-select>
                </a-col>
            </a-row>
        </Panel>
        <a-modal v-model:visible="visible" title="文本编辑" :footer="false" width="900px">
            <div>
                <tiny-editor v-model="newTextVal" height="600" @getContent="getContent"/>
            </div>
        </a-modal>
    </div>
</template>

<style scoped lang="less"></style>
