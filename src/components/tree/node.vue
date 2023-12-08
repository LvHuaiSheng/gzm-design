<template>
    <div>
        <base-tree-node v-bind="props" :key="key">
            <!-- 插槽内容 -->
            <slot></slot>
        </base-tree-node>
        <transition-node-list :key="key" :nodeKey="key" />
    </div>
</template>

<script>
import { defineComponent } from 'vue'
import BaseTreeNode from './base-node.vue'
import useNodeKey from './hooks/use-node-key'
import TransitionNodeList from './transition-node-list.vue'

export default defineComponent({
    name: 'TreeNode',
    components: {TransitionNodeList, BaseTreeNode},
    inheritAttrs: false,
    props: {
        ...BaseTreeNode.props,
    },
    setup(props) {
        const key = useNodeKey()

        return {
            props,
            key
        }
    },
})
</script>

<style>
/* 样式内容 */
</style>
