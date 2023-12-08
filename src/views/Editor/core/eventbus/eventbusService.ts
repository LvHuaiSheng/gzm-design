import {createDecorator} from '@/views/Editor/core/instantiation/instantiation'
import {InstantiationType, registerSingleton} from '@/views/Editor/core/instantiation/extensions'
import {Mitt} from './mitt'
import {PropertyEvent, ResizeEvent} from "leafer-ui";

type WworkspaceParam = {
  oldId: string | undefined
  newId: string
}

export type Events = {
  undoRedoStackChange: undefined
  layerRename: { id: string | number }
  setEdgeMoveStatus: boolean
  workspaceChangeBefore: WworkspaceParam
  workspaceChangeAfter: WworkspaceParam
  workspaceChangeRefresh: WworkspaceParam
  workspaceAddBefore: WworkspaceParam
  workspaceAddAfter: WworkspaceParam
  workspaceRemoveBefore: string
  workspaceRemoveAfter: string
  layoutMoveEvent: PropertyEvent // 基础画布移动事件（组件库的move和手动修改的move都会触发）
  layoutResizeEvent: ResizeEvent // 基础画布resize事件
}

export class EventbusService extends Mitt<Events> {}

export const IEventbusService = createDecorator<EventbusService>('eventbusService')

registerSingleton(IEventbusService, Mitt, InstantiationType.Eager)
