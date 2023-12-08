import { ContextMenuInstance } from './ContextMenuDefine'

let currentOpenedContextMenu: ContextMenuInstance | null = null

export function addOpenedContextMenu(inst: ContextMenuInstance): void {
  if (currentOpenedContextMenu) closeContextMenu()
  currentOpenedContextMenu = inst
}
export function removeOpenedContextMenu(inst: ContextMenuInstance): void {
  if (inst === currentOpenedContextMenu) currentOpenedContextMenu = null
}
/**
 * Close the currently open menu
 */
export function closeContextMenu(): void {
  if (currentOpenedContextMenu) {
    currentOpenedContextMenu.closeMenu()
    currentOpenedContextMenu = null
  }
}
