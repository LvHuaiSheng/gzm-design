export interface DialogReturn {
  /**
   * @zh 关闭对话框
   * @en Close Dialog
   */
  close: () => void
}

export interface DialogConfig {
  title: string | (() => VNode | string)
  body: () => VNode | string
  hideClose?: boolean
  onClose?: () => void
  top?: number
  left?: number
  width?: number
  height?: number
}
