import { LinkedList } from '@/utils/linkedList'

class UndoQueue {
  private inner_ = new LinkedList<any>()
  private size_ = 50

  pop() {
    return this.inner_.pop()
  }

  push(e: any) {
    this.inner_.push(e)
    while (this.length > this.size_) {
      this.inner_.shift()
    }
  }

  get length(): number {
    return this.inner_.size
  }
}

export class UndoRedoBase {
  declare readonly _serviceBrand: undefined

  private undoStates: UndoQueue = new UndoQueue()
  private redoStates: UndoQueue = new UndoQueue()
  private isUndoing = false
  public isTracking = true

  constructor() {
    this.push = this.push.bind(this)
  }

  pause() {
    this.isTracking = false
  }

  resume() {
    this.isTracking = true
  }

  push(state: any) {
    if (!this.isTracking) return
    this.undoStates.push(state)
    this.redoStates = new UndoQueue()
  }

  undo(redoState: any) {
    if (this.isUndoing) return
    if (!this.canUndo) throw new Error('Nothing to undo')
    this.isUndoing = true
    const state = this.undoStates.pop()
    this.redoStates.push(redoState)
    this.isUndoing = false
    return state
  }

  redo(undoState: any) {
    if (this.isUndoing) return
    if (!this.canRedo) throw new Error('Nothing to redo')
    this.isUndoing = true
    const state = this.redoStates.pop()
    this.undoStates.push(undoState)
    this.isUndoing = false
    return state
  }

  reset() {
    this.undoStates = new UndoQueue()
    this.redoStates = new UndoQueue()
    this.isUndoing = false
  }

  get canUndo(): boolean {
    return !!this.undoStates.length
  }

  get canRedo(): boolean {
    return !!this.redoStates.length
  }
}
