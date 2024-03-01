import {createDecorator} from '@/views/Editor/core/instantiation/instantiation'
import {InstantiationType, registerSingleton} from '@/views/Editor/core/instantiation/extensions'
import {UndoRedoCommand} from '@/views/Editor/core/undoRedo/commands'

export const IUndoRedoService = createDecorator<UndoRedoService>('undoRedoService')

export class UndoRedoService {
    declare readonly _serviceBrand: undefined
    private _stack: UndoRedoCommand[] = []
    private _stackIndex = -1
    public readonly canUndo = ref(false)
    public readonly canRedo = ref(false)

    constructor() {
        this.updateCanUndoRedo()
        // 使用Proxy对象来创建一个代理，在设置_stackIndex属性时手动触发更新canUndo和canRedo状态。这样就可以确保在_stackIndex改变时，能够更新对应的状态
        return new Proxy(this, {
            set: (target, prop, value) => {
                Reflect.set(target, prop, value)
                if (prop === '_stackIndex') {
                    this.updateCanUndoRedo()
                }
                return true
            }
        })
    }

    private updateCanUndoRedo(): void {
        this.canUndo.value = this._stackIndex > 0
        this.canRedo.value = this._stackIndex < this._stack.length && this._stack.length > 0
    }

    public clear(): void {
        this._stack = []
        this._stackIndex = -1
    }

    public add(cmd: UndoRedoCommand): void {
        if (this.canRedo.value) {
            this._stack.splice(this._stackIndex, this._stack.length)
        }
        this._stack.push(cmd)
        this._stackIndex = this._stack.length
    }

    public undo(): void {
        if (this.canUndo.value) {
            this._stackIndex--
            this._stack[this._stackIndex].undo()
        }
    }

    public redo(): void {
        if (this.canRedo.value) {
            this._stack[this._stackIndex].redo()
            this._stackIndex++
        }
    }
}

registerSingleton(IUndoRedoService, UndoRedoService, InstantiationType.Eager)
