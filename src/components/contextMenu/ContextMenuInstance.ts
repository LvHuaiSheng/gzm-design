import { App, h, render, Slot } from 'vue'
import { ContextMenuInstance, MenuOptions } from './ContextMenuDefine'
import { closeContextMenu } from './ContextMenuMutex'
import { genContainer, transformMenuPosition } from './ContextMenuUtils'
import ContextMenuConstructor from './ContextMenu.vue'
import ContextSubMenuWrapperConstructor from './ContextSubMenuWrapper.vue'
import ContextSubMenuConstructor from './ContextSubMenu.vue'
import ContextMenuItemConstructor from './ContextMenuItem.vue'
import ContextMenuGroupConstructor from './ContextMenuGroup.vue'
import ContextMenuSeparatorConstructor from './ContextMenuSeparator.vue'

function initInstance(
  options: MenuOptions,
  container: HTMLElement,
  isNew: boolean,
  customSlots?: Record<string, Slot>,
) {
  const vnode = h(
    ContextSubMenuWrapperConstructor,
    {
      options: options,
      show: true,
      container: container,
      isFullScreenContainer: !isNew,
      onClose: () => {
        const close = () => {
          render(null, container)
          options.onClose?.()
        }
        // 关闭动画
        if (vnode.el?.parentElement) {
          const menu = (vnode.el.parentElement as HTMLElement).querySelector<HTMLElement>(
            '.mx-context-menu',
          )
          if (menu) {
            menu.addEventListener('transitionend', close, { once: true })
            menu.style.opacity = '0'
            menu.style.pointerEvents = 'none'
            return
          }
        }
        close()
      },
    },
    customSlots,
  )
  render(vnode, container)
  return vnode.component
}

//Show global contextmenu
function $contextmenu(options: MenuOptions, customSlots?: Record<string, Slot>) {
  const container = genContainer(options)
  const component = initInstance(options, container.container, container.isNew, customSlots)
  return (component as unknown as Record<string, unknown>).exposed as ContextMenuInstance
}

export default {
  /**
   * For Vue install
   * @param app
   */
  install(app: App<Element>): void {
    app.config.globalProperties.$contextmenu = $contextmenu
    app.component('ContextMenu', ContextMenuConstructor)
    app.component('ContextMenuItem', ContextMenuItemConstructor)
    app.component('ContextMenuGroup', ContextMenuGroupConstructor)
    app.component('ContextMenuSperator', ContextMenuSeparatorConstructor)
    app.component('ContextMenuSeparator', ContextMenuSeparatorConstructor)
    app.component('ContextSubMenu', ContextSubMenuConstructor)
  },
  /**
   * Show a ContextMenu in page, same as `this.$contextmenu`
   * @param options The options of ContextMenu
   * @param customSlots You can provide some custom slots to customize the rendering style of the menu. These slots are the same as the slots of component ContextMenu.
   * @returns Menu instance
   */
  showContextMenu(options: MenuOptions, customSlots?: Record<string, Slot>): ContextMenuInstance {
    return $contextmenu(options, customSlots)
  },
  //Close the currently open menu
  closeContextMenu,
  //Tools
  transformMenuPosition,
}
