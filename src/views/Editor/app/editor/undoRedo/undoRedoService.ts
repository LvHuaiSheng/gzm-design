import { MLeaferCanvas, IMLeaferCanvas } from '@/views/Editor/core/canvas/mLeaferCanvas'
import { UndoRedoService as UndoRedo } from '@/views/Editor/core/undoRedo/undoRedoService'
import { KeybindingService, IKeybindingService } from '@/views/Editor/core/keybinding/keybindingService'
import { EventbusService, IEventbusService } from '@/views/Editor/core/eventbus/eventbusService'
import { IWorkspacesService, WorkspacesService } from '@/views/Editor/core/workspaces/workspacesService'
import { createDecorator } from '@/views/Editor/core/instantiation/instantiation'
import { Disposable } from '@/views/Editor/utils/lifecycle'
import { runWhenIdle } from '@/views/Editor/utils/async'
import { UndoRedoService2, IUndoRedoService2 } from '@/views/Editor/core/undoRedo/undoRedoService2'
import {PropertyEvent} from "leafer-ui";
import {IUIInputData} from "@leafer-ui/interface";

export const IUndoRedoService = createDecorator<UndoRedoService>('editorUndoRedoService')

export class UndoRedoService extends Disposable {
    declare readonly _serviceBrand: undefined

    private pageId: string

    private undoRedos: Map<
        string,
        {
            instantiation: UndoRedo
            lastState: IUIInputData | undefined
        }
    > = new Map()

    constructor(
        @IMLeaferCanvas private readonly canvas: MLeaferCanvas,
        @IKeybindingService readonly keybinding: KeybindingService,
        @IEventbusService private readonly eventbus: EventbusService,
        @IWorkspacesService private readonly workspacesService: WorkspacesService,
        @IUndoRedoService2 private readonly undoRedo: UndoRedoService2,
    ) {
        super()

        keybinding.bind('mod+z', this.undo.bind(this))
        keybinding.bind(['mod+y', 'mod+shift+z'], this.redo.bind(this))


        // canvas.contentLayer.on(PropertyEvent.CHANGE,arg => {
        //     // TODO setJson会触发这个事件，所以这里有问题导致无法撤销、返回操作
        //     console.log('arg=',arg)
        //     this.saveState()
        // })

        this.pageId = this.workspacesService.getCurrentId()

        this.initWorkspace()
    }

    private getUndoRedo() {
        return this.undoRedos.get(this.pageId)
    }

    public push(state: any) {
        const undoRedo = this.getUndoRedo()
        if (!undoRedo) return

        undoRedo.instantiation.push(state)
        this.eventbus.emit('undoRedoStackChange')
    }

    public redo() {
        const undoRedo = this.getUndoRedo()
        if (!undoRedo) return

        if (!undoRedo.instantiation.canRedo) return

        undoRedo.lastState = undoRedo.instantiation.redo(undoRedo.lastState)
        if (undoRedo.lastState) {
            this.loadJson(undoRedo.lastState)
            this.eventbus.emit('undoRedoStackChange')
        }
        return undoRedo.lastState
    }

    public undo() {
        const undoRedo = this.getUndoRedo()
        if (!undoRedo) return

        if (!undoRedo.instantiation.canUndo) return
        undoRedo.lastState = undoRedo.instantiation.undo(undoRedo.lastState)
        if (undoRedo.lastState) {
            this.loadJson(undoRedo.lastState)
            this.eventbus.emit('undoRedoStackChange')
        }
        return undoRedo.lastState
    }

    public reset() {
        const undoRedo = this.getUndoRedo()
        if (!undoRedo) return

        undoRedo.instantiation.reset()
        this.eventbus.emit('undoRedoStackChange')
    }

    private async loadJson(json: IUIInputData) {
        const undoRedo = this.getUndoRedo()
        if (!undoRedo) return
        const { instantiation } = undoRedo

        try {
            instantiation.pause()
            await this.canvas.importJsonToCurrentPage(json)
        } finally {
            this.canvas.contentLayer.updateLayout()
            instantiation.resume()
        }
    }

    private getJson() {
        return this.canvas.contentLayer.toJSON()
    }

    // todo jsondiffpatch https://github.com/benjamine/jsondiffpatch
    public saveState() {
        const pageId = this.pageId
        runWhenIdle(() => {
            if (pageId !== this.pageId) return
            const undoRedo = this.getUndoRedo()
            if (!undoRedo) return
            if (!undoRedo.instantiation.isTracking) return
            this.push(undoRedo.lastState)
            undoRedo.lastState = this.getJson()
        })
    }

    // 工作区 | 页面管理
    private initWorkspace() {
        const currentId = this.workspacesService.getCurrentId()
        this.workspacesService.all().forEach((workspace) => {
            this.undoRedos.set(workspace.id, {
                instantiation: new UndoRedo(),
                lastState: this.pageId === currentId ? this.getJson() : undefined,
            })
        })
        this.eventbus.on('workspaceAddAfter', ({ newId }) => {
            this.undoRedos.set(newId, {
                instantiation: new UndoRedo(),
                lastState: this.pageId === newId ? this.getJson() : {},
            })
        })
        this.eventbus.on('workspaceRemoveAfter', (id) => {
            this.undoRedos.delete(id)
        })
        this.eventbus.on('workspaceChangeAfter', ({ newId }) => {
            this.pageId = newId
        })
    }

    public dispose(): void {
        super.dispose()
        this.keybinding.unbind(['mod+z', 'mod+y', 'mod+shift+z'])
        // this.canvas.off(this.canvasEvents)
    }
}
