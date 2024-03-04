<script setup lang="ts">
import Tree, {DropEvent, DropPosition, TreeInstance, TreeNodeData, TreeNodeKey,} from '@/components/tree'
import {EditorEvent} from "@leafer-in/editor";
import {useEditor} from '@/views/Editor/app'
import {Fn, isDefined, useMagicKeys, useResizeObserver} from '@vueuse/core'
import type {SplitInstance} from '@arco-design/web-vue'
import ContextMenu from '@/components/contextMenu'
import {layerItems} from '@/views/Editor/utils/contextMenu'
import {LinkedList} from '@/utils/linkedList'
import IFolder from '@/assets/images/folder.svg?raw'
import IBoard from '@/assets/images/board.svg?raw'
import IText from '@/assets/images/text.svg?raw'
import IImage from '@/assets/images/image.svg?raw'
import IPenSvg from '@/assets/images/pen.svg?raw'
import IHtmlTextSvg from '@/assets/images/htmlText.svg?raw'
import {typeUtil} from "@/views/Editor/utils/utils";
import {IUI} from "@leafer-ui/interface";
import {watch} from "vue";

interface ITreeNodeData extends TreeNodeData {
    isCollection: boolean
    visible: boolean
    evented: boolean
    setDirty: Fn
    children?: ITreeNodeData[]
    getSvg: Fn,
}

const {canvas, event, undoRedo} = useEditor()

// 搜索词
const searchKey = ref('')
// 重命名
const renameNodeKey = ref<string | number | undefined>(undefined)
// 展开的节点
const expandedKeys = ref<TreeNodeKey[]>([])

const treeRef = ref<TreeInstance>()

// svg缓存
const svgCacheMap = new Map<string, string>()

const getSvg = (object) => {
    if (canvas.objectIsTypes(object,'Text')) {
        return IText
    } else if (canvas.objectIsTypes(object,'Group','Frame')) {
        return IFolder
    } else if (canvas.objectIsTypes(object,'Rect')) {
        return IBoard
    } else if (canvas.objectIsTypes(object,'Image','Image2')) {
        return IImage
    } else if (canvas.objectIsTypes(object,'Pen')) {
        return IPenSvg
    } else if (canvas.objectIsTypes(object,'HTMLText')) {
        return IHtmlTextSvg
    }else{

    }
}

/**
 * 获得树节点数据
 */
const getTreeData = (
    objects: any,
    searchKey?: string,
    parentVisible = true,
): ITreeNodeData[] => {
    const objs: ITreeNodeData[] = []
    if (!objects) return objs
    for (const object of objects) {
        const isCollection = typeUtil.isCollection(object)
        const proxyData = object.proxyData
        const children = isCollection
            ? getTreeData(object.children, searchKey, parentVisible && proxyData.visible)
            : []
        const nodeData = Object.assign(proxyData,{
            key: object.innerId,
            draggable: renameNodeKey.value !== object.id,
            getSvg: getSvg.bind(this, object),
            children:children
        })
        if (!searchKey || canAddToResult(nodeData, searchKey)) {
            objs.unshift(nodeData)
        }
    }
    return objs
}

const treeData: Ref<ITreeNodeData[]> = ref([])

watchEffect(() => {
    treeData.value = getTreeData(canvas.ref._children.value, searchKey.value)
})

/**
 * 节点搜索
 */
const canAddToResult = (nodeData: ITreeNodeData, searchKey: string): boolean => {
    // 广度优先搜索
    const lowerSearchKey = searchKey.toLowerCase()
    const queue = new LinkedList<ITreeNodeData>()
    queue.push(nodeData)
    let isMatched = false
    while (!queue.isEmpty()) {
        const currentNode = queue.shift()!
        const currentTitle = currentNode.name?.toLowerCase()
        if (currentTitle?.includes(lowerSearchKey)) {
            isMatched = true
        }
        // 压入子元素
        if (currentNode.children) {
            for (const child of currentNode.children) {
                queue.push(child)
            }
        }
        if (isMatched) {
            return true
        }
    }
    return false
}

/**
 * 节点是否允许放置
 */
const allowDrop = ({dropNode}: { dropNode: TreeNodeData }) => {
    return (dropNode as ITreeNodeData).isCollection
}

/**
 * 移动节点
 */
const moveNode = (data: {
    e: DragEvent
    dragObject: IUI
    dropObject: IUI
    dropPosition: DropPosition
    excludeGroupObject: boolean
}) => {
    const {dragObject, dropObject, dropPosition, excludeGroupObject} = data

    // 如果该对象属于的分组也在拖拽列表，则中止操作。
    // if (excludeGroupObject) {
    //     const inGroup = dragObject.getAncestors(true).some((group) => {
    //         return selectedkeys.value.includes((group as Group).id)
    //     })
    //     if (inGroup) {
    //         return
    //     }
    // }

    // 退出激活选区
    // if (util.isActiveSelection(dragObject.group)) {
    //     dragObject.group.remove(dragObject)
    // }

    // 获取对象的组
    const dragGroup = dragObject.parent
    let dropGroup = dropObject.parent
    console.log('dragGroup=',dragGroup)
    console.log('dropGroup=',dropGroup)
    let dropIndex = dropGroup?.children.indexOf(dropObject)

    // 画板不能进组
    if ((dragGroup !== dropGroup || dropPosition === 0) && canvas.objectIsTypes(dragObject,'Leafer')) {
        return false
    }

    // 对象同组
    if (dragGroup === dropGroup) {
        const dragIndex = dragGroup?.children?.indexOf(dragObject)
        if (dragIndex < dropIndex) {
            dropIndex--
        }
    }

    if (dropPosition === -1) {
        dropIndex++
    }
    dragGroup?.remove(dragObject) as any[]

    // dropObject是组，dropPosition 为 0 进入组
    if (typeUtil.isCollection(dropObject) && dropPosition === 0) {
        dropObject.add(dragObject)
    } else {

        dropGroup?.addAt(dragObject,dropIndex)
    }

    // 回到激活选区
    // if (canvas.getActiveObject() === canvas.getActiveSelection()) {
    //     canvas.getActiveSelection().multiSelectAdd(_dragObject)
    // } else {
    //     canvas.setActiveObject(_dragObject)
    // }
}

/**
 * tree节点放置事件
 */
const onDrop = (data: DropEvent) => {
    const {e, dragNode, dropNode, dropPosition} = data as DropEvent<ITreeNodeData>

    if (!dragNode.key || !dropNode.key) return

    // 多个拖拽
    if (selectedkeys.value.includes(dragNode.key)) {
        // 通过key查找对象
        let dragObjects = canvas.findObjectsByIds([dropNode.key, ...selectedkeys.value])
        const dropObject = dragObjects.shift()
        if (!isDefined(dropObject)) return
        // 由于列表是倒序，这里把列表翻转过来
        if (dropPosition === -1) {
            dragObjects = dragObjects.reverse()
        }
        for (let i = dragObjects.length - 1; i >= 0; i--) {
            // 没找到则退出
            const dragObject = dragObjects[i]
            if (!isDefined(dragObject)) return
            moveNode({
                e,
                dragObject,
                dropObject,
                dropPosition,
                excludeGroupObject: true,
            })
        }
    }
    // 单个拖拽
    else {
        // 通过key查找对象
        const [dropObject, dragObject] = canvas.findObjectsByIds([dropNode.key, dragNode.key])
        // 没找到则退出
        if (!isDefined(dropObject) || !isDefined(dragObject)) return
        moveNode({
            e,
            dragObject,
            dropObject,
            dropPosition,
            excludeGroupObject: false,
        })
    }
}

/**
 * 点击图层锁定
 */
const lockClick = (e: Event, node: any) => {
    e.stopPropagation()
    node.locked = !node.locked
}

/**
 * 点击图层可视
 */
const visibleClick = (e: Event, node: any) => {
    e.stopPropagation()
    node.visible = !node.visible
    // node.setDirty()
}

const selectedkeys = ref<(string | number)[]>([])

/**
 * tree节点选择
 */
const onSelect = (_selectedkeys: (string | number)[] = selectedkeys.value) => {
    const objects = canvas.findObjectsByIds(_selectedkeys)
    console.log('objects=',objects)
    if (objects.length) {
        canvas.setActiveObjects(objects)
    } else {
        canvas.discardActiveObject()
    }
    // 控制器不会消失，更新一下画板
    // canvas.requestRenderAll()
}

// 更新tree选中节点
const updateSelectedkeys = async () => {
    const activeObject = canvas.activeObject.value
    const editor = canvas?.app?.editor

    if (!editor || !editor.hasTarget) {
        selectedkeys.value = []
        return
    }

    let needExpandedKeys: Set<string> = new Set()

    if (editor.hasTarget) {
        const tempKeys: any[] = []
        editor.list.forEach(obj => {
            tempKeys.push(obj.innerId)
        })
        selectedkeys.value = tempKeys
    } else {
        selectedkeys.value = [activeObject.innerId]
    }

    if (needExpandedKeys) {
        expandedKeys.value.push(...needExpandedKeys)
        // 等待展开
        await nextTick()
    }
    if (treeRef.value && treeRef.value.virtualListRef){
        const containerRect = treeRef.value?.virtualListRef.containerRef.getBoundingClientRect()
        const nodeRect = document
            .querySelector(`.arco-tree-node[data-key='${selectedkeys.value[0]}']`)
            ?.getBoundingClientRect()
        // TODO 数据太多时经常白屏不展示、无法混动？
        // 判断是否在可视区域外
        if (
            !nodeRect ||
            containerRect.top - nodeRect.top > nodeRect.height ||
            nodeRect.top - containerRect.top > treeHeight.value
        ) {
            treeRef.value?.scrollIntoView({
                key: selectedkeys.value[0],
                align: 'auto',
            })
        }
    }
}
canvas.app.editor.on(EditorEvent.SELECT,(arg)=>{
    updateSelectedkeys()
})

const splitRef = ref<SplitInstance>()
const treeHeight = ref(0)

onMounted(() => {
    // 默认展开第一层节点
    treeData.value.forEach((data) => {
        if (data.children && data.key) {
            expandedKeys.value.push(data.key)
        }
    })

    // 更新tree组件的高度
    useResizeObserver(splitRef.value as HTMLDivElement, (entries) => {
        const [entry] = entries
        const {height} = entry.contentRect
        treeHeight.value = height - 43
    })
})

// 多选
// todo: shift键选择范围
const multiple = ref(false)
const {meta, ctrl,shift} = useMagicKeys()
watchEffect(() => {
    if (meta.value || ctrl.value || shift.value) {
        multiple.value = true
    } else {
        multiple.value = false
    }
})

const showContextMenu = (e: MouseEvent, node: TreeNodeData) => {
    e.preventDefault()
    e.stopImmediatePropagation()

    if (!node.key) return

    if (!selectedkeys.value.includes(node.key)) {
        selectedkeys.value = [node.key]
        onSelect()
    }

    ContextMenu.showContextMenu({
        x: e.clientX,
        y: e.clientY,
        preserveIconWidth: false,
        items: layerItems(),
    })
}

event.on('layerRename', (e) => {
    renameNodeKey.value = e.id
})

const onNodeDbclick = (e: MouseEvent, _node: TreeNodeData) => {
    e.preventDefault()
    if (!_node.key) return
    renameNodeKey.value = _node.key
}

const onInputMounted = (vnode: VNode) => {
    const el = vnode.el as HTMLDivElement | null
    if (!el) return
    const input = el.querySelector('input')
    if (!input) return
    input.focus()
    // input.select()
}

const onInputChange = (value: string, e: Event) => {
    const key = renameNodeKey.value
    const target = e.target as HTMLElement | null
    target?.blur()
    if (!key || !value) return
    const object = canvas.findObjectById(key)
    if (!object) return
    object.proxyData.name = value
    // treeRef.value?.updateTreeView()
    // undoRedo.saveState()
}
</script>

<template>
    <div
            ref="splitRef"
            class="h-[calc(100vh-90px)]">
        <div style="padding:0 10px">
            <a-input-search
                    placeholder="Search..."
                    style="margin-bottom: 8px;"
                    v-model="searchKey"
            />
        </div>
        <Tree
                ref="treeRef"
                size="small"
                blockNode
                draggable
                :selected-keys="selectedkeys"
                v-model:expanded-keys="expandedKeys"
                :animation="false"
                :multiple="multiple"
                :data="treeData"
                :allowDrop="allowDrop"
                :virtualListProps="{
          height: treeHeight,
          fixedSize: true,
          buffer: 30
        }"
                @drop="onDrop"
                @select="onSelect"
                @node-contextmenu="showContextMenu"
                @node-dbclick="onNodeDbclick"
        >
            <template #title="nodeData">
                <div class="flex items-center">
                    <div v-html="nodeData.getSvg()" class="mr2 mt3px"></div>
                    <a-input
                            v-if="isDefined(nodeData.key) && renameNodeKey === nodeData.key"
                            class="bg-transparent! border-none! px0!"
                            size="mini"
                            v-model="nodeData.name"
                            :default-value="nodeData.name"
                            @blur="renameNodeKey = undefined"
                            @vue:mounted="onInputMounted"
                            @press-enter="renameNodeKey = undefined"
                    />
                    <span
                            v-else
                            class="text-truncate"
                            :class="{
                'op-50': !nodeData.visible,
              }"
                    >
              {{ nodeData.name }}
            </span>
                </div>
            </template>
            <template #extra="nodeData">
                <div
                        v-if="renameNodeKey !== nodeData.key"
                        class="extra pr4px"
                        :class="{
              show:  !nodeData.visible || nodeData.locked
            }"
                >
                    <a-button
                            :class="{
                show: !nodeData.locked,
              }"
                            size="mini"
                            class="icon-btn"
                            @click="lockClick($event, nodeData)"
                    >
                        <template #icon>
                            <icon-unlock v-if="!nodeData.locked"/>
                            <icon-lock v-else/>
                        </template>
                    </a-button>
                    <a-button
                            :class="{
                show: nodeData.visible,
              }"
                            size="mini"
                            class="icon-btn"
                            @click="visibleClick($event, nodeData)"
                    >
                        <template #icon>
                            <icon-eye v-if="nodeData.visible"/>
                            <icon-eye-invisible v-else/>
                        </template>
                    </a-button>
                </div>
            </template>
            <template #empty>
                <a-empty>
                    暂无图层
                </a-empty>
            </template>
        </Tree>
    </div>
</template>

<style scoped lang="less">
.extra {
  display: none;

  &.show {
    display: inline-block;

    .arco-btn.show {
      visibility: hidden;
    }
  }
}

.arco-tree-node-hover {
  .extra {
    display: inline-block;

    .arco-btn.show {
      visibility: visible;
    }
  }
}
</style>
