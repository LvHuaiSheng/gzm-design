<script setup lang="ts">
import Panel from './panel.vue'
import {useActiveObjectModel} from '@/views/Editor/hooks/useActiveObjectModel'
import type {SelectProps} from '@arco-design/web-vue/es/select'
import {popupMaxHeight} from '@/utils/arco'
import {useEditor} from '@/views/Editor/app'
import TipContentKey from "@/components/tooltip/tipContentKey.vue";
import SwipeNumber from "@/components/swipeNumber/swipeNumber.vue";
import {useFontStore} from "@/store";
import FontFaceObserver from 'fontfaceobserver'
import {Message} from "@arco-design/web-vue";


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

const textStyle = ref()

const {canvas} = useEditor()
const {fontList,skipLoadFonts} = storeToRefs(useFontStore())
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
    textValue.value.onChange(newTextVal.value)
})
const paddingTop = ref()
const paddingRight = ref()
const paddingBottom = ref()
const paddingLeft = ref()
const lineHeightVal = ref()
const letterSpacingVal = ref()
watchEffect(() => {
    if (padding.value.modelValue) {
        paddingTop.value = padding.value.modelValue[0]
        paddingRight.value = padding.value.modelValue[1]
        paddingBottom.value = padding.value.modelValue[2]
        paddingLeft.value = padding.value.modelValue[3]
    }
})

watchEffect(() => {
    lineHeightVal.value = lineHeight.value.modelValue.value
})


watchEffect(() => {
    letterSpacingVal.value = letterSpacing.value.modelValue.value
})

watch([paddingTop, paddingRight, paddingBottom, paddingLeft], (newValue, oldValue) => {
    padding.value.onChange([paddingTop.value, paddingRight.value, paddingBottom.value, paddingLeft.value,])
})


watch(lineHeightVal, (newValue, oldValue) => {
    lineHeight.value.onChange({
        type: lineHeight.value.modelValue.type,
        value: Number(newValue)
    })
})
watch(letterSpacingVal, (newValue, oldValue) => {
    letterSpacing.value.onChange({
        type: lineHeight.value.modelValue.type,
        value: Number(newValue)
    })
})
const changeFontFamily = (record) => {
    const fontFamilyName = record
    if (skipLoadFonts.value.includes(fontFamilyName)){
        return;
    }else {
        // 字体加载
        const loading =  Message.loading({
            content:`正在加载字体 【${fontFamilyName}】`,
            duration:0
        })
        const font = new FontFaceObserver(fontFamilyName);
        font
            .load(null, 150000)
            .then(() => {
                loading.close()
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
</script>

<template>
    <div>
        <Panel title="内容" hidden-add>
            <a-row :wrap="false" :gutter="[4, 4]" align="center">
                <a-col>
                    <a-textarea
                            v-model="newTextVal"
                            placeholder="请输入一些内容"
                            :auto-size="{
                            minRows:4,
                          }"/>
                </a-col>
            </a-row>
        </Panel>
        <Panel title="属性" hidden-add>
            <a-space direction="vertical" size="mini">
                <a-row :gutter="[4, 4]">
                    <a-col>
                        <a-select
                                size="small"
                                placeholder="文字字体"
                                v-bind="{ ...fontFamily,...popupMaxHeight(20)}"
                                :options="fontList"
                                @change="changeFontFamily"
                                allow-search
                                :field-names="{
                                    label: 'name',
                                    value: 'name',
                                }"
                        >
                            <template #prefix>
                                字体
                            </template>
                            <template #option="{ data }">
                                <div class="font-preview-cls" v-if="data.preview"
                                     :style="{backgroundImage:`url(${data.preview})`}"></div>
                                <div class="font-preview-cls" v-else>
                                    <span>{{ (typeof data === 'object' ? data.name : data) }}</span>
                                </div>
                            </template>
                        </a-select>
                    </a-col>
                    <a-col :span="12">
                        <a-select
                                size="small"
                                placeholder=""
                                allow-create
                                v-bind="{...fontWeight}"
                                :options="weightOptions"
                        >
                            <template #prefix>
                                粗细
                            </template>
                        </a-select>
                    </a-col>
                    <a-col :span="12">
                        <SwipeNumber size="small" v-bind="fontSize" :step="1" style="padding: 0 6px"
                                     label-class="text-left" label-width="36px">
                            <template #label>
                                <div>大小</div>
                            </template>
                        </SwipeNumber>
                    </a-col>
                    <a-col :span="12">
                        <SwipeNumber size="small" v-model="lineHeightVal" :step="1" style="padding: 0 6px"
                                     label-class="text-left" label-width="36px">
                            <template #label>
                                <div>行距</div>
                            </template>
                        </SwipeNumber>
                    </a-col>
                    <a-col :span="12">
                        <SwipeNumber size="small" v-model="letterSpacingVal" :step="1" style="padding: 0 6px"
                                     label-class="text-left" label-width="36px">
                            <template #label>
                                <div>字距</div>
                            </template>
                        </SwipeNumber>
                    </a-col>
                    <a-col>
                        <a-select
                                size="small"
                                placeholder="文本换行规则"
                                v-bind="textWrap"
                                :options="textWrapOptions"
                        >
                            <template #prefix>
                                文本换行规则
                            </template>
                        </a-select>
                    </a-col>
                </a-row>
                <a-row :wrap="false" :gutter="[4, 4]" align="center">
                    <a-col flex="none">
                        <a-tooltip mini position="bottom">
                            <a-button class="button" size="small" @click="italic.onChange(!italic.modelValue)">
                                <template #icon>
                                    <icon-italic :class="italic.modelValue?'arco-icon-check':''"/>
                                </template>
                            </a-button>
                            <template #content>
                                <TipContentKey content="斜体"/>
                            </template>
                        </a-tooltip>
                    </a-col>
                    <a-col :span="24">
                        <a-radio-group type="button" size="small" v-bind="textDecoration">
                            <a-tooltip mini position="bottom">
                                <a-radio value="none">
                                    <icon-stop/>
                                </a-radio>
                                <template #content>
                                    <TipContentKey content="无划线"/>
                                </template>
                            </a-tooltip>
                            <a-tooltip mini position="bottom">
                                <a-radio value="under">
                                    <icon-underline/>
                                </a-radio>
                                <template #content>
                                    <TipContentKey content="下划线"/>
                                </template>
                            </a-tooltip>
                            <a-tooltip mini position="bottom">
                                <a-radio value="delete">
                                    <icon-strikethrough/>
                                </a-radio>
                                <template #content>
                                    <TipContentKey content="删除线"/>
                                </template>
                            </a-tooltip>
                        </a-radio-group>
                    </a-col>
                </a-row>
                <a-row :gutter="[4, 4]" align="center">
                    <a-col :span="24">
                        <a-radio-group type="button" size="small" v-bind="textAlign">
                            <a-tooltip mini position="bottom">
                                <a-radio value="left">
                                    <icon-align-left/>
                                </a-radio>
                                <template #content>
                                    <TipContentKey content="左对齐"/>
                                </template>
                            </a-tooltip>
                            <a-tooltip mini position="bottom">
                                <a-radio value="center">
                                    <icon-align-center/>
                                </a-radio>
                                <template #content>
                                    <TipContentKey content="居中对齐"/>
                                </template>
                            </a-tooltip>
                            <a-tooltip mini position="bottom">
                                <a-radio value="right">
                                    <icon-align-right/>
                                </a-radio>
                                <template #content>
                                    <TipContentKey content="右对齐"/>
                                </template>
                            </a-tooltip>
                            <a-tooltip mini position="bottom">
                                <a-radio value="justify">
                                    <icon-menu/>
                                </a-radio>
                                <template #content>
                                    <TipContentKey content="两端对齐"/>
                                </template>
                            </a-tooltip>
                        </a-radio-group>
                    </a-col>
                    <a-col :span="12">
                        <a-radio-group type="button" size="small" v-bind="verticalAlign">
                            <a-tooltip mini position="bottom">
                                <a-radio value="top">
                                    <icon-align-left :rotate="90"/>
                                </a-radio>
                                <template #content>
                                    <TipContentKey content="顶部对齐"/>
                                </template>
                            </a-tooltip>
                            <a-tooltip mini position="bottom">
                                <a-radio value="middle">
                                    <icon-menu :rotate="90"/>
                                </a-radio>
                                <template #content>
                                    <TipContentKey content="垂直居中对齐"/>
                                </template>
                            </a-tooltip>
                            <a-tooltip mini position="bottom">
                                <a-radio value="bottom">
                                    <icon-align-right :rotate="90"/>
                                </a-radio>
                                <template #content>
                                    <TipContentKey content="底部对齐"/>
                                </template>
                            </a-tooltip>
                        </a-radio-group>
                    </a-col>

                </a-row>

                <a-row :wrap="false" :gutter="[4, 4]" align="center">
                    <a-col flex="none">
                        <a-radio-group type="button" size="small" v-model="textOverflowType"
                                       @change="changeTextOverflow">
                            <a-radio value="show">
                                超出显示
                            </a-radio>
                            <a-radio value="hide">
                                超出隐藏
                            </a-radio>
                            <a-radio value="custom">
                                <span>自定义</span>
                                <a-popover title="超出显示" trigger="click" position="lt">
                                    <icon-settings class="color-text-1"/>
                                    <template #content>
                                        <a-input v-model="textOverflowVal" @input="inputTextOverflowVal"></a-input>
                                    </template>
                                </a-popover>
                            </a-radio>
                        </a-radio-group>
                    </a-col>
                </a-row>
            </a-space>
        </Panel>
        <Panel title="文本内边距" hidden-add>
            <a-row :gutter="[4, 4]" align="center">
                <a-col :span="6">
                    <SwipeNumber size="small" v-model="paddingTop">
                        <template #label>
                            <icon-to-top/>
                        </template>
                    </SwipeNumber>
                </a-col>
                <a-col :span="6">
                    <SwipeNumber size="small" label="Y" v-model="paddingRight">
                        <template #label>
                            <icon-to-right/>
                        </template>
                    </SwipeNumber>
                </a-col>
                <a-col :span="6">
                    <SwipeNumber size="small" label="Y" v-model="paddingBottom">
                        <template #label>
                            <icon-to-bottom/>
                        </template>
                    </SwipeNumber>
                </a-col>
                <a-col :span="6">
                    <SwipeNumber size="small" label="Y" v-model="paddingLeft">
                        <template #label>
                            <icon-to-left/>
                        </template>
                    </SwipeNumber>
                </a-col>
            </a-row>
        </Panel>
    </div>
</template>

<style scoped lang="less">
.font-preview-cls {
  //background-color: #000;
  background-size: cover;
  background-position: center center;
  height: 40px;
  width: 200px;
  color: #fff;
  //font-size: 27px;
  text-align: center;
  -webkit-filter: invert(100%);
  filter: invert(100%);
}

</style>
