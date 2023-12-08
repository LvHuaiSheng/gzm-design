<script setup lang="ts">
import SvgIcon from '@/components/svgIcon'
import DropdownButton from '@/components/dropdown/dropdownButton.vue'
import {useAppStore} from '@/store'
import type {EditTool} from 'app'
import {useEditor} from '@/views/Editor/app'

const {canvas, undoRedo} = useEditor()

const {activeTool} = storeToRefs(useAppStore())

type EditToolListItem = {
    key: EditTool
    icon: string
    name: string
}

type EditToolList = (EditToolListItem & {
    doption?: EditToolListItem[]
})[]

const editToolList = ref<EditToolList>(<(EditToolListItem & { doption?: EditToolListItem[] })[]>[
    {
        key: 'select',
        icon: 'bxs-pointer',
        name: '选择工具',
        doption: [
            {
                key: 'select',
                icon: 'bxs-pointer',
                name: '选择工具',
            },
            {
                key: 'handMove',
                icon: 'bxs-hand',
                name: '移动视图',
            },
        ],
    },
    {
      key: 'pen',
      icon: 'bx-pen',
      name: '钢笔',
    },
])
// 监听activeTool
watch(activeTool, (newTool, oldTool) => {
    const actArr = getFilteredDataByKey(newTool)
    if (actArr.length>0){
        const value = actArr[0]
        onSelect(value.index,value.data)
    }
})
function getFilteredDataByKey(key: string) {
    const result: { data: EditToolListItem | undefined, index: number }[] = [];

    // 查找editToolList中满足key条件的数据
    editToolList.value.forEach((item, index) => {
        if (item.key === key) {
            result.push({ data: item, index });
        }
        if (item.doption) {
            const subItemIndex = item.doption.findIndex(subItem => subItem.key === key);
            if (subItemIndex !== -1) {
                result.push({ data: item.doption[subItemIndex], index });
            }
        }
    });

    return result;
}
const onSelect = (index,value) => {
    editToolList.value[index] = { ...editToolList.value[index], ...value as EditToolListItem }
    onClick((value as EditToolListItem).key)
}
const onClick = (toolName: EditTool) => {
    activeTool.value = toolName
}
</script>

<template>
    <a-space>
        <DropdownButton
                v-for="(button, index) in editToolList"
                :key="button.key"
                :active="activeTool === button.key"
                @click="onClick(button.key)"
                @select="
        (value) => {
          onSelect(index,value)
        }
      "
        >
            <SvgIcon :name="button.icon"/>
            <template #content v-if="button.doption">
                <a-doption v-for="doption in button.doption" :key="doption.key" :value="doption">
                    <template #icon>
                        <SvgIcon :name="doption.icon"/>
                    </template>
                    {{ doption.name }}
                </a-doption>
            </template>
        </DropdownButton>
    </a-space>
</template>

<style scoped lang="less"></style>
