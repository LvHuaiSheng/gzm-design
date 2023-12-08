import { App } from 'vue'
import { ArcoOptions } from '@arco-design/web-vue/es/_utils/types'
import { getComponentPrefix, setGlobalConfig } from '@arco-design/web-vue/es/_utils/global-config'
import _Tree from './tree.vue'
import '@arco-design/web-vue/es/tree/style'

export type {
  TreeNodeData,
  TreeFieldNames,
  DropPosition,
  TreeNodeKey,
  DropEvent,
} from './interface'

const Tree = Object.assign(_Tree, {
  install: (app: App, options?: ArcoOptions) => {
    setGlobalConfig(app, options)
    const componentPrefix = getComponentPrefix(options)

    app.component(componentPrefix + _Tree.name, _Tree)
  },
})

export type TreeInstance = InstanceType<typeof _Tree>

export default Tree
