export interface UndoRedoCommand {
  getTimestamp(): number
  getDuration(): number
  label: string
  undo(): void
  redo(): void
}

export class CommandBase implements UndoRedoCommand {
  private _timestamp: number
  private _label = ''

  public constructor() {
    this._timestamp = new Date().getTime()
  }

  public getTimestamp(): number {
    return this._timestamp
  }

  public getDuration(): number {
    return 0
  }

  public get label(): string {
    return this._label
  }

  public set label(value: string) {
    this._label = value
  }

  public undo(): void {
    throw new Error('Not implemented')
  }

  public redo(): void {
    throw new Error('Not implemented')
  }
}
