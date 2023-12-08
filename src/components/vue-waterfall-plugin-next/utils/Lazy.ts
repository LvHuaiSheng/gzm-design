import type { LazyOptions, ValueFormatterObject } from '../types/lazy'
import type { CssStyleObject } from './../types/util.d'
import { assign, hasIntersectionObserver, isObject } from './util'
import { loadImage } from './loader'

enum LifecycleEnum {
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error',
}

const DEFAULT_OBSERVER_OPTIONS = {
  rootMargin: '0px',
  threshold: 0,
}

const DEFAULT_LOADING = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
const DEFAULT_ERROR = ''

export default class Lazy {
  lazyActive = true // 是否开启懒加载
  crossOrigin = true // 开启跨域
  options: LazyOptions = {
    loading: DEFAULT_LOADING,
    error: DEFAULT_ERROR,
    observerOptions: DEFAULT_OBSERVER_OPTIONS,
    log: true,
  }

  _images = new WeakMap()

  constructor(flag = true, options: LazyOptions, crossOrigin = true) {
    this.lazyActive = flag
    this.crossOrigin = crossOrigin
    this.config(options)
  }

  config(options = {}) {
    assign(this.options, options)
  }

  // mount
  mount(el: HTMLImageElement, binding: string | ValueFormatterObject, callback: () => void): void {
    const { src, loading, error } = this._valueFormatter(binding)
    el.setAttribute('lazy', LifecycleEnum.LOADING)
    el.setAttribute('src', loading || DEFAULT_LOADING)
    if (!this.lazyActive) {
      this._setImageSrc(el, src, callback, error)
    }
    else {
      if (!hasIntersectionObserver) {
        this._setImageSrc(el, src, callback, error)
        this._log(() => {
          throw new Error('Not support IntersectionObserver!')
        })
      }
      this._initIntersectionObserver(el, src, callback, error)
    }
  }

  // resize
  resize(el: HTMLImageElement, callback: () => void) {
    const lazy = el.getAttribute('lazy')
    const src = el.getAttribute('src')
    if (lazy && lazy === LifecycleEnum.LOADED && src) {
      loadImage(src, this.crossOrigin).then((image) => {
        const { width, height } = image
        const curHeight = (el.width / width) * height
        el.height = curHeight
        const style = el.style as CssStyleObject
        style.height = `${curHeight}px`
        callback()
      })
    }
  }

  // unmount
  unmount(el: HTMLElement): void {
    const imgItem = this._realObserver(el)
    imgItem && imgItem.unobserve(el)
    this._images.delete(el)
  }

  /**
   * 设置img的src
   * @param {*} el - img
   * @param {*} src - 原图
   * @param {*} error - 错误图片
   * @param {*} callback - 完成的回调函数，通知组件刷新布局
   * @returns
   */
  _setImageSrc(el: HTMLImageElement, src: string, callback: () => void, error?: string): void {
    if (!src)
      return

    const preSrc = el.getAttribute('src')
    if (preSrc === src)
      return

    loadImage(src, this.crossOrigin)
      .then((image) => {
        // 修改容器
        const { width, height } = image
        const ratio = height / width
        const lazyBox = el.parentNode!.parentNode as HTMLElement
        lazyBox.style.paddingBottom = `${ratio * 100}%`

        // 设置图片
        el.setAttribute('lazy', LifecycleEnum.LOADED)
        el.removeAttribute('src')
        el.setAttribute('src', src)

        callback()
      })
      .catch(() => {
        const imgItem = this._realObserver(el)
        imgItem && imgItem.disconnect()
        if (error) {
          el.setAttribute('lazy', LifecycleEnum.ERROR)
          el.setAttribute('src', error)
        }
        this._log(() => {
          throw new Error(`Image failed to load!And failed src was: ${src} `)
        })
        callback()
      })
  }

  _isOpenLazy(): boolean {
    return hasIntersectionObserver && this.lazyActive
  }

  /**
   * 添加img和对应的observer到weakMap中
   * 开启监听
   * 当出现在可视区域后取消监听
   * @param {*} el - img
   * @param {*} src - 图片
   * @param {*} error - 错误图片
   * @param {*} callback - 完成的回调函数，通知组件刷新布局
   */
  _initIntersectionObserver(el: HTMLImageElement, src: string, callback: () => void, error?: string): void {
    const observerOptions = this.options.observerOptions
    this._images.set(
      el,
      new IntersectionObserver((entries) => {
        Array.prototype.forEach.call(entries, (entry) => {
          if (entry.isIntersecting) {
            const imgItem = this._realObserver(el)
            imgItem && imgItem.unobserve(entry.target)
            this._setImageSrc(el, src, callback, error)
          }
        })
      }, observerOptions),
    )

    const imgItem = this._realObserver(el)
    imgItem && imgItem.observe(el)
  }

  // 格式化参数
  _valueFormatter(value: ValueFormatterObject | string): ValueFormatterObject {
    let src = value as string
    let loading = this.options.loading
    let error = this.options.error
    if (isObject(value)) {
      src = (value as ValueFormatterObject).src
      loading = (value as ValueFormatterObject).loading || this.options.loading
      error = (value as ValueFormatterObject).error || this.options.error
    }
    return {
      src,
      loading,
      error,
    }
  }

  // 日志
  _log(callback: () => void): void {
    if (this.options.log)
      callback()
  }

  // 在map中获取对应img的observer事件
  _realObserver(el: HTMLElement): IntersectionObserver | undefined {
    return this._images.get(el)
  }
}
