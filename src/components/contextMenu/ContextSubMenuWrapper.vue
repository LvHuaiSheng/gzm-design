<script lang="ts">
  import {
    defineComponent,
    h,
    onBeforeUnmount,
    onMounted,
    PropType,
    provide,
    ref,
    renderSlot,
    toRefs,
    VNode,
    watch,
  } from 'vue'
  import { MenuConstOptions, MenuOptions } from './ContextMenuDefine'
  import { addOpenedContextMenu, removeOpenedContextMenu } from './ContextMenuMutex'
  import ContextSubMenuConstructor, {
    SubMenuContext,
    SubMenuParentContext,
  } from './ContextSubMenu.vue'
  import { useThemes } from '@/hooks/useThemes'

  export type GlobalHasSlot = (name: string) => boolean
  export type GlobalRenderSlot = (name: string, params: Record<string, unknown>) => VNode

  /**
   * Context menu component
   */
  export default defineComponent({
    name: 'ContextMenu',
    props: {
      /**
       * Menu options
       */
      options: {
        type: Object as PropType<MenuOptions>,
        default: null,
      },
      /**
       * Show menu?
       */
      show: {
        type: Boolean,
        default: false,
      },
      /**
       * Current container, For calculation only
       */
      container: {
        type: Object,
        default: null,
      },
      /**
       * Make sure is user set the custom container.
       */
      isFullScreenContainer: {
        type: Boolean,
        default: true,
      },
    },
    emits: ['update:show', 'close'],
    setup(props, ctx) {
      const { options, show, container } = toRefs(props)

      onMounted(() => {
        if (show.value) openMenu()
      })
      onBeforeUnmount(() => {
        removeBodyEvents()
      })

      watch(show, (v: boolean) => {
        if (v) {
          openMenu()
        } else {
          removeBodyEvents()
        }
      })

      const instance = { closeMenu }

      function openMenu() {
        installBodyEvents()
        addOpenedContextMenu(instance)
      }
      function closeMenu() {
        ctx.emit('update:show', false)
        ctx.emit('close')

        removeOpenedContextMenu(instance)
      }

      //Expose instance function
      ctx.expose({
        closeMenu: closeMenu,
      })

      function installBodyEvents() {
        document.addEventListener('mousedown', onBodyClick, true)
        document.addEventListener('contextmenu', onBodyClick, true)
        document.addEventListener('wheel', onBodyWhell, true)
        if (options.value.keyboardControl !== false)
          document.addEventListener('keydown', onMenuKeyDown)
      }
      function removeBodyEvents() {
        document.removeEventListener('mousedown', onBodyClick, true)
        document.removeEventListener('contextmenu', onBodyClick, true)
        document.removeEventListener('wheel', onBodyWhell, true)
        if (options.value.keyboardControl !== false)
          document.removeEventListener('keydown', onMenuKeyDown)
      }

      //For keyboard event, remember which submenu is active
      const currentOpenedMenu = ref<SubMenuContext | null>()
      provide(
        'globalSetCurrentSubMenu',
        (menu: SubMenuContext | null) => (currentOpenedMenu.value = menu),
      )

      function onMenuKeyDown(e: KeyboardEvent) {
        let handled = true
        //Handle keyboard event
        switch (e.key) {
          case 'Escape': {
            if (currentOpenedMenu.value?.isTopLevel() === false) {
              currentOpenedMenu.value?.closeCurrentSubMenu()
            } else {
              closeMenu()
            }
            break
          }
          case 'ArrowDown':
            currentOpenedMenu.value?.moveCurrentItemDown()
            break
          case 'ArrowUp':
            currentOpenedMenu.value?.moveCurrentItemUp()
            break
          case 'Home':
            currentOpenedMenu.value?.moveCurrentItemFirst()
            break
          case 'End':
            currentOpenedMenu.value?.moveCurrentItemLast()
            break
          case 'ArrowLeft': {
            currentOpenedMenu.value?.closeSelfAndActiveParent()
            break
          }
          case 'ArrowRight':
            currentOpenedMenu.value?.openCurrentItemSubMenu()
            break
          // case 'Enter': // 取消回车键 避免鼠标在右键菜单上时在输入框中输入文字后按下回车导致的事件误触发
          //   currentOpenedMenu.value?.triggerCurrentItemClick()
          //   break
          default:
            handled = false
            break
        }
        if (handled && currentOpenedMenu.value) {
          e.stopPropagation()
          e.preventDefault()
        }
      }
      function onBodyWhell() {
        //close when mouse scroll
        if (options.value.closeWhenScroll !== false) closeMenu()
      }
      function onBodyClick(e: MouseEvent) {
        checkTargetAndClose(e.target as HTMLElement)
      }
      function checkTargetAndClose(target: HTMLElement) {
        //Loop target , Check whether the currently clicked element belongs to the current menu.
        // If yes, it will not be closed
        while (target) {
          if (target.classList && target.classList.contains('mx-menu-host')) return
          target = target.parentNode as HTMLElement
        }

        //Close menu
        removeBodyEvents()
        closeMenu()
      }

      //provide globalOptions for child use
      provide('globalOptions', options.value)
      provide('globalCloseMenu', closeMenu)
      provide('globalTheme', options.value?.theme || useThemes().trueMode)
      provide('globalIsFullScreenContainer', props.isFullScreenContainer)

      provide('globalIconFontClass', options.value?.iconFontClass || 'iconfont')
      //check slot exists
      provide('globalHasSlot', (name: string) => {
        return ctx.slots[name] !== undefined
      })
      //render slot
      provide('globalRenderSlot', (name: string, params: Record<string, unknown>) => {
        return renderSlot(ctx.slots, name, { ...params })
      })
      //provide menuContext for child use
      provide('menuContext', {
        zIndex: options.value.zIndex || MenuConstOptions.defaultZindex,
        container: container.value as unknown as HTMLElement,
        adjustPadding: options.value.adjustPadding || MenuConstOptions.defaultAdjustPadding,
        getParentAbsY: () => options.value.y,
        getMyPosition: () => {
          return {
            x: options.value.x,
            y: options.value.y,
          }
        },
        getParentWidth: () => 0,
        closeOtherSubMenuWithTimeOut: () => {
          /* Do nothing */
        },
        checkCloseOtherSubMenuTimeOut: () => false,
        addOpenedSubMenu: () => {
          /* Do nothing */
        },
        closeOtherSubMenu: () => {
          /* Do nothing */
        },
        getParentContext: () => null,
        getSubMenuInstanceContext: () => null,
        getElement: () => null,
        addChildMenuItem: () => {
          /* Do nothing */
        },
        removeChildMenuItem: () => {
          /* Do nothing */
        },
        markActiveMenuItem: () => {
          /* Do nothing */
        },
        markThisOpenedByKeyBoard: () => {
          /* Do nothing */
        },
        isOpenedByKeyBoardFlag: () => false,
        isMenuItemDataCollectedFlag: () => false,
      } as SubMenuParentContext)

      return () => {
        //Hidden
        if (!show.value) return []

        //Create SubMenu
        return [
          h(
            'div',
            {
              class: 'mx-menu-ghost-host',
            },
            [
              h(
                ContextSubMenuConstructor,
                {
                  class: 'mx-menu-host',
                  items: options.value?.items,
                  adjustPosition: options.value?.adjustPosition,
                  maxWidth: options.value.maxWidth || MenuConstOptions.defaultMaxWidth,
                  minWidth: options.value.minWidth || MenuConstOptions.defaultMinWidth,
                },
                {
                  default: ctx.slots.default,
                },
              ),
            ],
          ),
        ]
      }
    },
  })
</script>

<style lang="less">
  .mx-menu-ghost-host {
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    top: 0;
    overflow: hidden;
    pointer-events: none;
  }
  .mx-menu-ghost-host.fullscreen {
    position: fixed;
  }
</style>
