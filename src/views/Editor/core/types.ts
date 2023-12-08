import type { App } from 'vue'
import type { IInstantiationService } from './instantiation/instantiation'
import type { EditorMain } from '@/views/Editor/app/editor'
import type { DefineComponent } from 'vue'

export interface IEditorPluginContext extends EditorPluginContext {
  _id: symbol
}

export type UsableSolts = 'rightPanel' | 'leftPanel'

export interface EditorPluginContext {
  setup?: () => void
  dispose?: () => void
  slots?: { [key in UsableSolts]?: DefineComponent<{}, {}, any>[] }
}

export type EditorPlugin = (editor: Pick<EditorMain, 'service' | 'use'>) => EditorPluginContext

export interface ICore {
  install: (app: App) => void
  service: IInstantiationService
  use: (plugin: EditorPlugin) => ICore
  _p: EditorPlugin[]
  _a: App
}
