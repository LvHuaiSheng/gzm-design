import { createDecorator } from '@/views/Editor/core/instantiation/instantiation'
import { registerSingleton, InstantiationType } from '@/views/Editor/core/instantiation/extensions'

export const IUndoRedoService2 = createDecorator<UndoRedoService2>('undoRedoService2')

export interface Command {
  execute(): void | any

  /**
   * Executed when the command is first put on the stack (in that case first = true) or when it must be played
   * forward (in that case first = false);
   */
  redo?(first: boolean): Promise<void> | void

  /**
   * Executed when the command must be played backward.
   */
  undo(): Promise<void> | void

  /**
   * A user presentable label. May be localized.
   */
  label(): string
}

export class UndoRedoService2 {
  declare readonly _serviceBrand: undefined

  private isTracking = true
  private undoStack: Command[] = []
  private redoStack: Command[] = []
  private saved: Command | null = null

  public get canUndo() {
    if (!this.isTracking) return false
    return this.undoStack.length > 0
  }

  public get undoLabel() {
    return this.undoStack[this.undoStack.length - 1].label()
  }

  public async undo() {
    if (!this.isTracking) return
    this.isTracking = false
    const command = this.undoStack[this.undoStack.length - 1]
    this.undoStack = this.undoStack.slice(0, this.undoStack.length - 1)
    this.redoStack.push(command)
    await command.undo()
    this.isTracking = true
  }

  public get canRedo() {
    if (!this.isTracking) return false
    return this.redoStack.length > 0
  }

  public get redoLabel() {
    return this.redoStack[this.redoStack.length - 1].label()
  }

  public get dirty() {
    if (this.saved === null) {
      return this.undoStack.length !== 0
    } else {
      return this.undoStack[this.undoStack.length - 1] !== this.saved
    }
  }

  public async redo() {
    if (!this.isTracking) return
    this.isTracking = false
    const command = this.redoStack[this.redoStack.length - 1]
    this.redoStack = this.redoStack.slice(0, this.redoStack.length - 1)
    this.undoStack.push(command)
    if (!command.redo) {
      command.execute()
      this.isTracking = true
      return
    }
    await command.redo(false)
    this.isTracking = true
  }

  public execute(command: Command): void | any {
    if (!this.isTracking) return
    this.register(command)
    this.isTracking = false
    const res = command.execute()
    this.isTracking = true
    return res
  }

  public register(command: Command): void {
    // command.redo(true)
    this.redoStack = []
    this.undoStack.push(command)
  }

  public markSaved(): void {
    this.saved = this.undoStack[this.undoStack.length - 1]
  }

  public reset(): void {
    this.undoStack = []
    this.redoStack = []
    this.saved = null
  }
}

registerSingleton(IUndoRedoService2, UndoRedoService2, InstantiationType.Eager)
