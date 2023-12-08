<template>
    <a-layout-footer class="dea-footer-page">
        <div class="bg-white page-box not-select">
            <a-space>
                <div class="page-view " v-for="(item,index) in workspacesData"
                     @click="onSelect(item)"
                     @contextmenu.stop="openContextMenu($event,item)"
                     :class="{'page-selected':workspaces.getCurrentId() === item.key}"
                     :key="index">
                    <a-avatar class="page-ava" :size="30" shape="square">{{ index + 1 }}</a-avatar>
                </div>

                <div class="page-add page-view" @click="addOnClick">
                    <icon-plus size="20"/>
                </div>
            </a-space>
        </div>
    </a-layout-footer>
</template>
<script setup lang="ts">
import {useEditor} from "@/views/Editor/app";
import ContextMenu from '@/components/contextMenu'

const {canvas, workspaces, event} = useEditor()

const pages = computed(() => {
    return canvas.getPages()
})
const addOnClick = () => {
    workspaces.setCurrentId(workspaces.add(`${(pages.value.size + 1)}`))
    canvas.setZoom(1)
}
const workspacesData = ref([])
const updateWorkspaces = () => {
    workspacesData.value = workspaces.all().map((workspace) => {
        return {
            key: workspace.id,
            title: workspace.name,
            cover: workspace.cover,
        }
    })
}

updateWorkspaces()

event.on('workspaceChangeAfter', updateWorkspaces)
event.on('workspaceAddAfter', updateWorkspaces)
event.on('workspaceRemoveAfter', updateWorkspaces)

onUnmounted(() => {
    event.off('workspaceChangeAfter', updateWorkspaces)
    event.off('workspaceAddAfter', updateWorkspaces)
    event.off('workspaceRemoveAfter', updateWorkspaces)
})

const onSelect = (item) => {
    workspaces.setCurrentId(item.key.toString())
}

const openContextMenu = (e: MouseEvent, node: any) => {
    e.preventDefault()
    ContextMenu.showContextMenu({
        x: e.clientX,
        y: e.clientY,
        preserveIconWidth: false,
        items: [
            {
                label: '复制',
                onClick: async () => {
                    if (!node.key) return
                    const workspace = workspaces.get(node.key.toString())
                    if (!workspace) return
                    const id = workspaces.add(`${(pages.value.size + 1)}`)
                    workspaces.setCurrentId(id)
                    // 循序不能变， getPageJSON必须在setCurrentId之后执行，否则要复制的页面数据可能还未保存
                    const json = canvas.getPageJSON(node.key)
                    canvas.reLoadFromJSON(json)
                },
            },
            {
                label: '删除',
                disabled: workspaces.size() <= 1 || node.key === workspaces.getCurrentId(),
                onClick: () => {
                    if (!node.key) return
                    workspaces.remove(node.key.toString())
                },
                // divided: true,
            },
            // {
            //     label: '重命名',
            //     onClick: () => {
            //
            //     },
            // },
        ],
    })
}
</script>

<style lang="less" scoped>
@import "../../styles/layouts";

.dea-footer-page {
  background-color: #f1f2f4;
  padding: 10px 20px 10px 20px;
  height: @footerBoxHeight;
  overflow: auto;

  .page-box {
    padding: 0 5px;
    height: 100%;
    align-items: center;
    display: flex;
  }

  .page-view {
    cursor: pointer;
    border: 1px solid var(--color-neutral-4);
    border-radius: 5px;
    padding: 5px;
    height: calc(@footerBoxHeight - 30px);
    align-items: center;
    align-content: center;
    display: flex;
  }

  .page-selected {
    border-color: rgb(var(--primary-6));
  }

  .page-add {
    height: calc(@footerBoxHeight - 30px);
    width: calc(@footerBoxHeight - 30px);
    text-align: center;
    align-items: center;
    display: flex;
    align-content: center;
    justify-content: center;
  }

  .page-add:hover {
    color: rgb(var(--primary-6));
    border-color: rgb(var(--primary-6));
    cursor: pointer;
  }

  .page-ava {
    //background-color: #3370ff;
  }
}
</style>
