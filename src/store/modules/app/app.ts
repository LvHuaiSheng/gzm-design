import type { EditTool } from 'app'

export const useAppStore = defineStore('app', () => {
  const activeTool = ref<EditTool>('select')

  return {
    /** 当前激活的工具 */
    activeTool,
  }
})
