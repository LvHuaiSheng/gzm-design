import { createDecorator } from '@/views/Editor/core/instantiation/instantiation'
import { EventbusService, IEventbusService } from '@/views/Editor/core/eventbus/eventbusService'
import { Disposable } from '@/views/Editor/utils/lifecycle'
import {v4 as uuidv4 } from 'uuid'

export const IWorkspacesService = createDecorator<WorkspacesService>('workspacesService')

export type IWorkspace = { id: string; name: string,cover?:string }

export class WorkspacesService extends Disposable {
  declare readonly _serviceBrand: undefined

  private workspaces: IWorkspace[] = []

  private currentId = ''

  constructor(@IEventbusService private readonly eventbus: EventbusService) {
    super()
  }

  public getCurrentId(): string {
    return this.currentId
  }

  public reloadJSON(): void {
    const param = {
      oldId: this.currentId,
      newId: this.currentId,
    }
    this.eventbus.emit('workspaceChangeRefresh', param)
  }

  public setCurrentId(workspaceId: string): void {
    if (!this.get(workspaceId) || this.currentId === workspaceId) return
    const param = {
      oldId: this.currentId,
      newId: workspaceId,
    }
    this.eventbus.emit('workspaceChangeBefore', param)
    this.currentId = workspaceId
    this.eventbus.emit('workspaceChangeAfter', param)
  }

  public all(): IWorkspace[] {
    return this.workspaces
  }

  public set(workspaceId: string, name: string) {
    const workspace = this.get(workspaceId)
    if (!workspace || workspace.name === name) return
    workspace.name = name
  }

  public get(workspaceId: string) {
    return this.workspaces.find((workspace) => workspace.id === workspaceId)
  }

  public add(name: string, id?: string): string {
    if (!id) {
      id = uuidv4()
    }
    let param = {
      oldId: this.currentId,
      newId: id,
    }
    this.eventbus.emit('workspaceAddBefore', param)
    this.workspaces.push({ id, name })
    this.eventbus.emit('workspaceAddAfter', param)
    return id
  }

  public remove(workspaceId: string) {
    if (!this.get(workspaceId)) return
    this.eventbus.emit('workspaceRemoveBefore', workspaceId)
    const index = this.workspaces.findIndex((workspace) => workspace.id === workspaceId)
    this.workspaces.splice(index, 1)
    this.eventbus.emit('workspaceRemoveAfter', workspaceId)
    if (workspaceId === this.currentId) {
      if (this.workspaces[index]) {
        this.setCurrentId(this.workspaces[index].id)
      } else if (this.workspaces[index - 1]) {
        this.setCurrentId(this.workspaces[index - 1].id)
      }
    }
  }
  public removeAll() {
    this.all().forEach(value => {
      this.eventbus.emit('workspaceRemoveBefore', value.id)
      const index = this.workspaces.findIndex((workspace) => workspace.id === value.id)
      this.workspaces.splice(index, 1)
      this.eventbus.emit('workspaceRemoveAfter', value.id)
    })
  }

  public size(): number {
    return this.workspaces.length
  }

  public clear() {
    // this.workspaces.forEach(({ id }) => {
    //   this.eventbus.emit('workspaceRemoveBefore', id)
    //   this.eventbus.emit('workspaceRemoveAfter', id)
    // })
    this.workspaces = []
    this.currentId = ''
  }

  public dispose() {
    super.dispose()
    this.clear()
  }
}
