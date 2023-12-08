<script lang="tsx">
  import { defineComponent, h, PropType, toRefs, VNode } from 'vue'
  import RenderFunction from '@arco-design/web-vue/es/_components/render-function'
  import { IconLoading, IconCaretDown, IconFile } from '@arco-design/web-vue/es/icon'
  import IconHover from '@arco-design/web-vue/es/_components/icon-hover'
  import useTreeContext from './hooks/use-tree-context'
  import usePickSlots from '@arco-design/web-vue/es/_hooks/use-pick-slots'
  import { TreeNodeData } from './interface'

  export default defineComponent({
    name: 'TreeNodeSwitcher',
    components: {
      IconLoading,
      RenderFunction,
    },
    props: {
      prefixCls: String,
      loading: Boolean,
      showLine: Boolean,
      treeNodeData: {
        type: Object as PropType<TreeNodeData>,
      },
      icons: {
        type: Object as PropType<Record<string, () => VNode[]>>,
      },
      nodeStatus: {
        type: Object as PropType<{
          loading?: boolean
          checked?: boolean
          selected?: boolean
          expanded?: boolean
          indeterminate?: boolean
          isLeaf?: boolean
        }>,
      },
    },
    emits: ['click'],
    setup(props, { slots, emit }) {
      const { icons, nodeStatus, treeNodeData } = toRefs(props)
      const treeContext = useTreeContext()

      const nodeSwitcherIcon = usePickSlots(slots, 'switcher-icon')
      const nodeLoadingIcon = usePickSlots(slots, 'loading-icon')

      return {
        getSwitcherIcon: () => {
          const icon = icons?.value?.switcherIcon ?? nodeSwitcherIcon.value
          return icon
            ? icon(nodeStatus.value)
            : treeContext.switcherIcon?.(treeNodeData.value, nodeStatus.value)
        },
        getLoadingIcon: () => {
          const icon = icons?.value?.loadingIcon ?? nodeLoadingIcon.value
          return icon
            ? icon(nodeStatus.value)
            : treeContext.loadingIcon?.(treeNodeData.value, nodeStatus.value)
        },
        onClick(e: Event) {
          emit('click', e)
        },
      }
    },
    render() {
      const {
        prefixCls,
        getSwitcherIcon,
        getLoadingIcon,
        onClick,
        nodeStatus = {},
        loading,
        showLine,
      } = this

      const { expanded, isLeaf } = nodeStatus

      if (loading) {
        return getLoadingIcon() ?? h(IconLoading)
      }

      let icon = null
      let needIconHover = false

      if (!isLeaf) {
        const defaultIcon = showLine
          ? h('span', {
              class: `${prefixCls}-${expanded ? 'minus' : 'plus'}-icon`,
            })
          : h(IconCaretDown)
        icon = getSwitcherIcon() ?? defaultIcon
        needIconHover = !showLine
      } else if (showLine) {
        icon = getSwitcherIcon() ?? h(IconFile)
      }

      if (!icon) return null

      const content = h('span', { class: `${prefixCls}-switcher-icon`, onClick }, icon)
      return needIconHover
        ? h(
            IconHover,
            {
              class: `${prefixCls}-icon-hover`,
            },
            () => content,
          )
        : content
    },
  })
</script>
