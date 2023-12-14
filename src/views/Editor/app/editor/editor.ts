import {ContextMenu} from '@/views/Editor/app/editor/contextMenu'
import {Layer} from '@/views/Editor/app/editor/layer'
import {SyncDescriptor} from '@/views/Editor/core/instantiation/descriptors'
import {IInstantiationService, ServiceIdentifier} from '@/views/Editor/core/instantiation/instantiation'
import {ServiceCollection} from '@/views/Editor/core/instantiation/serviceCollection'
import {EditorPlugin, IEditorPluginContext, getActiveCore} from '@/views/Editor/core'
import {IKeybindingService, KeybindingService} from '@/views/Editor/core/keybinding/keybindingService'
import {IWorkspacesService, WorkspacesService} from '@/views/Editor/core/workspaces/workspacesService'
import {IEventbusService, EventbusService} from '@/views/Editor/core/eventbus/eventbusService'
import {BaseApp} from '@/views/Editor/app/baseApp'
import {UsableSolts} from '@/views/Editor/core/types'
import {toDisposable} from '@/views/Editor/utils/lifecycle'
import type {DefineComponent} from 'vue'
import {useEditor} from '@/views/Editor/app'
import {runWhenIdle} from '@/views/Editor/utils/async'
import {IMLeaferCanvas, MLeaferCanvas} from "@/views/Editor/core/canvas/mLeaferCanvas";
import {Zoom} from "@/views/Editor/app/editor/zoom";
// import {Ruler} from "@/views/Editor/app/editor/ruler2";
import {Ruler} from "@/views/Editor/app/editor/ruler";
import {ToolBar} from "@/views/Editor/app/editor/toolBar";
import {IUndoRedoService, UndoRedoService} from '@/views/Editor/app/editor/undoRedo/undoRedoService'
import {GuideLines} from "@/views/Editor/app/editor/guideLines";

export class EditorMain extends BaseApp {
    public service!: IInstantiationService

    private readonly pluginInstance = new Map<Symbol, IEditorPluginContext>()

    public contextMenu: ContextMenu | undefined

    constructor(@IInstantiationService private readonly instantiationService: IInstantiationService) {
        super()
    }

    public startup() {
        super.scopeRun(() => {
            this.service = this.initServices()
            this.service.invokeFunction((accessor) => {
                const workspacesService = accessor.get(IWorkspacesService)
                if (workspacesService.size() === 0) {
                    workspacesService.setCurrentId(workspacesService.add('1'))
                }
            })
            const instances = [
                // TODO 标尺使用mm单位
                this.service.createInstance(Ruler),
                this.service.createInstance(Layer),
                this.service.createInstance(ToolBar),
                this.service.createInstance(GuideLines),
                this.service.createInstance(Zoom),
                (this.contextMenu = this.service.createInstance(ContextMenu)),
            ]
            instances.forEach((instance) => {
                this._register(instance)
            })

            // 插件载入
            provide('useEditor', useEditor)
            const core = getActiveCore()
            core._p.forEach((plugin) => {
                this.use(plugin)
            })
        })
    }

    public use(plugin: EditorPlugin) {
        const instance = plugin({
            service: this.service,
            use: this.use,
        }) as IEditorPluginContext
        // 存储实例
        instance._id = Symbol()
        this.pluginInstance.set(instance._id, instance)
        // 生命周期
        runWhenIdle(() => {
            // 插件安装
            instance.setup?.()
            this._register(
                toDisposable(() => {
                    // 插件销毁
                    instance.dispose?.()
                    this.pluginInstance.delete(instance._id)
                }),
            )
        })
    }

    private initServices() {
        const services = new ServiceCollection()

        const define = <T>(id: ServiceIdentifier<T>, ctor: new (...args: any[]) => T) => {
            if (!services.has(id)) {
                services.set(id, new SyncDescriptor(ctor))
            }
        }
        define(IEventbusService, EventbusService)
        define(IWorkspacesService, WorkspacesService)
        define(IMLeaferCanvas, MLeaferCanvas)
        define(IUndoRedoService, UndoRedoService)
        define(IKeybindingService, KeybindingService)

        return this.instantiationService.createChild(services)
    }

    public dispose() {
        try {
            provide('useEditor', undefined)
            super.dispose()
            this.service.invokeFunction((accessor) => {
                accessor.get(IKeybindingService).reset()
                accessor.get(IUndoRedoService).reset()
                accessor.get(IWorkspacesService).dispose()
                accessor.get(IEventbusService).all.clear()
            })
            this.service = undefined!
        } catch (_e) {
            console.error(_e)
        }
    }

    public getPluginSlots(name: UsableSolts) {
        const pluginSlots: DefineComponent<{}, {}, any>[] = []
        this.pluginInstance.forEach((plugin) => {
            if (!plugin.slots) return
            const slots = plugin.slots[name]
            slots && pluginSlots.push(...slots)
        })
        return pluginSlots
    }
}
