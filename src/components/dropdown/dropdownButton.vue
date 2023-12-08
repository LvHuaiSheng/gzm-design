<template>
  <a-button
    class="btn-box"
    :class="{ active }"
    :size="size"
    :disabled="disabled"
    v-bind="buttonProps"
    @click="handleClick"
  >
    <template #icon>
      <slot></slot>
      <a-dropdown
        v-if="$slots.content"
        :popup-visible="computedPopupVisible"
        :trigger="trigger"
        :position="position"
        :popup-container="popupContainer"
        :hide-on-select="hideOnSelect"
        @select="handleSelect"
        @popup-visible-change="handlePopupVisibleChange"
      >
        <a-button
          class="more-btn absolute! w12px! h12px! bottom-0 right-0 bg-transparent! transition translate-0"
          :disabled="disabled"
        >
          <template #icon>
            <slot name="icon" :popup-visible="computedPopupVisible">
              <SvgIcon name="dropdown-more" :size="12" />
            </slot>
          </template>
        </a-button>
        <template #content>
          <slot name="content"></slot>
        </template>
      </a-dropdown>
    </template>
  </a-button>
</template>

<script lang="ts">
  import { defineComponent, PropType, toRefs } from 'vue'
  import { ButtonProps, TriggerEvent } from '@arco-design/web-vue'
  import { getPrefixCls } from '@arco-design/web-vue/es/_utils/global-config'
  import { useTrigger } from '@arco-design/web-vue/es/_hooks/use-trigger'
  import SvgIcon from '@/components/svgIcon'

  type DropdownPosition = 'top' | 'tl' | 'tr' | 'bottom' | 'bl' | 'br'

  export default defineComponent({
    name: 'DropdownButton',
    components: {
      SvgIcon,
    },
    props: {
      active: {
        type: Boolean,
        default: false,
      },
      /**
       * @zh 弹出框是否可见
       * @en Whether the popup is visible
       * @vModel
       */
      popupVisible: {
        type: Boolean,
        default: undefined,
      },
      /**
       * @zh 弹出框默认是否可见（非受控模式）
       * @en Whether the popup is visible by default (uncontrolled mode)
       */
      defaultPopupVisible: {
        type: Boolean,
        default: false,
      },
      /**
       * @zh 触发方式
       * @en Trigger method
       * @values 'hover','click','focus','contextMenu'
       */
      trigger: {
        type: [String, Array] as PropType<TriggerEvent | TriggerEvent[]>,
        default: 'click',
      },
      /**
       * @zh 弹出位置
       * @en Popup position
       * @values 'top','tl','tr','bottom','bl','br'
       */
      position: {
        type: String as PropType<DropdownPosition>,
        default: 'br',
      },
      /**
       * @zh 弹出框的挂载容器
       * @en Mount container for popup
       */
      popupContainer: {
        type: [String, Object] as PropType<string | HTMLElement | undefined>,
      },
      /**
       * @zh 是否禁用
       * @en Whether to disable
       */
      disabled: {
        type: Boolean,
        default: false,
      },
      /**
       * @zh 按钮大小
       * @en Button size
       */
      size: {
        type: String as PropType<ButtonProps['size']>,
      },
      /**
       * @zh 按钮属性
       * @en Button props
       */
      buttonProps: {
        type: Object as PropType<ButtonProps>,
      },
      /**
       * @zh 是否在用户选择后隐藏弹出框
       * @en Whether to hide popup when the user selects
       */
      hideOnSelect: {
        type: Boolean,
        default: true,
      },
    },
    emits: {
      'update:popupVisible': (visible: boolean) => true,
      /**
       * @zh 下拉框显示状态发生改变时触发
       * @en Triggered when the display status of the drop-down box changes
       * @param {boolean} visible
       */
      popupVisibleChange: (visible: boolean) => true,
      /**
       * @zh 点击按钮时触发
       * @en Emitted when the button is clicked
       * @param {MouseEvent} ev
       */
      click: (ev: MouseEvent) => true,
      /**
       * @zh 用户选择时触发
       * @en Triggered when the user selects
       * @param {string | number | Record<string, any> | undefined} value
       * @param {Event} ev
       */
      select: (value: string | number | Record<string, any> | undefined, ev: Event) => true,
    },
    /**
     * @zh 内容
     * @en Content
     * @slot content
     */
    /**
     * @zh 按钮图标
     * @en Button icon
     * @slot icon
     * @binding {boolean} popupVisible
     */
    setup(props, { emit }) {
      const { defaultPopupVisible, popupVisible } = toRefs(props)
      const prefixCls = getPrefixCls('dropdown')

      const { computedPopupVisible, handlePopupVisibleChange } = useTrigger({
        defaultPopupVisible,
        popupVisible,
        emit,
      })

      const handleClick = (ev: MouseEvent) => {
        emit('click', ev)
      }

      const handleSelect = (
        value: string | number | Record<string, unknown> | undefined,
        ev: Event,
      ) => {
        emit('select', value, ev)
      }

      return {
        prefixCls,
        computedPopupVisible,
        handleClick,
        handleSelect,
        handlePopupVisibleChange,
      }
    },
  })
</script>

<style lang="less" scoped>
  .btn-box {
    background-color: transparent !important;

    &:hover {
      background-color: var(--color-secondary-hover) !important;
    }

    &:active {
      background-color: var(--color-secondary-active) !important;
    }

    &.active {
      background-color: rgb(var(--primary-6)) !important;
      color: #fff;

      .more-btn {
        color: #fff;
      }
    }

    &:hover {
      .more-btn {
        --un-translate-x: 2px;
        --un-translate-y: 2px;
      }
    }
  }
</style>
