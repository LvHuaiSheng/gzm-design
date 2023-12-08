import {IMLeaferCanvas, MLeaferCanvas} from '@/views/Editor/core/canvas/mLeaferCanvas'
import {Disposable} from '@/views/Editor/utils/lifecycle'
import {useThemes} from '@/hooks/useThemes'
import {IKeybindingService, KeybindingService} from '@/views/Editor/core/keybinding/keybindingService'
import {LeaferEvent, ZoomEvent} from "leafer-ui";
/**
 * guides文档地址：https://daybrush.com/guides/release/latest/doc/
 */
import Guides from '@scena/guides'
import '../../styles/ruler.less'
import {EventbusService, IEventbusService} from "@/views/Editor/core/eventbus/eventbusService";

/**
 * 配置
 */
export interface RulerOptions {
    /**
     * 标尺宽高
     * @default 20
     */
    ruleSize?: number

    /**
     * 字体大小
     * @default 10
     */
    fontSize?: number

    /**
     * 是否开启标尺
     * @default false
     */
    enabled?: boolean

    /**
     * 背景颜色
     */
    backgroundColor?: string

    /**
     * 文字颜色
     */
    textColor?: string

    /**
     * ruler's line color
     */
    lineColor?: string

    /**
     * 高亮颜色
     */
    highlightColor?: string
}

/**
 * TODO 处理多页面的独立辅助线条
 */
export class Ruler extends Disposable {
    public store = reactive({dZoom: 1})
    public container = 'page-design' // page-design
    public el?: HTMLElement = undefined // page-design
    public guidesTop: any = null
    public guidesLeft: any = null

    /**
     * 配置
     */
    // @ts-ignore
    public options: Required<RulerOptions>

    constructor(
        @IMLeaferCanvas private readonly canvas: MLeaferCanvas,
        @IKeybindingService readonly keybinding: KeybindingService,
        @IEventbusService private readonly eventbus: EventbusService,
    ) {
        super()
        canvas.contentLayer.on(LeaferEvent.AFTER_READY, arg => {
            this.render()
        })
        canvas.contentLayer.on(ZoomEvent.ZOOM, arg => {
            // TODO 处理缩放后辅助线不对齐偏移的问题
            if (this.guidesTop && this.guidesLeft){
                const zoom = <number> canvas.contentLayer.scale
                this.guidesTop.zoom = zoom
                this.guidesLeft.zoom = zoom
                if (zoom < 0.9) {
                    this.guidesTop.unit = Math.floor(1 / zoom) * 50
                    this.guidesLeft.unit = Math.floor(1 / zoom) * 50
                }else {
                    this.guidesTop.unit = 50
                    this.guidesLeft.unit = 50
                }
            }
        })
        eventbus.on("layoutResizeEvent",arg => {
            if (this.guidesTop && this.guidesLeft){
                this.guidesTop.resize()
                this.guidesLeft.resize()
            }
        })
        eventbus.on("layoutMoveEvent",arg => {
            if (this.guidesTop && this.guidesLeft){
                if (arg.attrName === 'x'){
                   let moveX = (<number>arg.newValue ||  0)- (<number> arg.oldValue || 0)
                   scrollX -= moveX
                   this.guidesTop.scroll(scrollX);
                   this.guidesLeft.scrollGuides(scrollX);
               }
               if (arg.attrName === 'y'){
                   let moveY =  (<number>arg.newValue ||  0)- (<number> arg.oldValue || 0)
                   scrollY -= moveY
                   this.guidesTop.scrollGuides(scrollY);
                   this.guidesLeft.scroll(scrollY);
               }
            }
        })

        const {isDark} = useThemes()

        watchEffect(() => {
            this.options = {
                ...this.options,
                ...(isDark.value
                    ? {
                        backgroundColor: '#242424',
                        lineColor: '#555',
                        highlightColor: '#165dff3b',
                        textColor: '#ddd',
                    }
                    : {
                        backgroundColor: '#fff',
                        lineColor: '#ccc',
                        highlightColor: '#165dff3b',
                        textColor: '#444',
                    }),
            }

        })

        this.keybinding.bind('shift+r', () => {
            this.enabled = !this.enabled
        })

        this.enabled = canvas.enabledRuler
    }

    public get enabled() {
        return this.canvas.enabledRuler
    }

    public set enabled(value) {
        this.canvas.enabledRuler = value
        if (this.guidesTop && this.guidesLeft){
            if (value) {
                this.guidesTop.setState({className:'my-horizontal ruler-show'})
                this.guidesLeft.setState({className:'my-vertical ruler-show'})
                this.setElPadding()
            } else {
                this.guidesTop.setState({className:'my-horizontal ruler-hide'})
                this.guidesLeft.setState({className:'my-vertical ruler-hide'})
                this.removeElPadding()
            }
        }
    }

    private render() {
        const sameParams: any = {
            backgroundColor: this.options.backgroundColor,
            lineColor: this.options.lineColor,
            textColor: this.options.textColor,
            // direction: 'start',
            // height: 30,
            /**
             * 单位
             * 1px (Default) zoom: 1, unit: 50 (every 50px)
             * 1cm = 37.7952px zoom: 37.7952 unit: 1 (every 1cm)
             * 1in = 96px = 2.54cm zoom: 9 unit: 1 (every 1in)
             */
            // unit:1,
            displayDragPos: true,
            dragPosFormat: (v: any) => v + 'px',
        }
        this.el = <HTMLElement> document.getElementById(this.container)

        const divBox = document.createElement("div")
        divBox.innerText = 'px'
        divBox.classList.add('ruler-divBox','not-select')
        divBox.style.background = this.options.backgroundColor
        divBox.style.boxShadow = `0 0px 1px 0 ${this.options.lineColor}`
        divBox.style.color = this.options.textColor
        this.el?.appendChild(divBox)

        this.setElPadding()
        this.guidesTop = new Guides(this.el, {
            ...sameParams,
            type: 'horizontal',
            className: `my-horizontal ${this.enabled?'ruler-show':'ruler-hide'}`,
        }).on('changeGuides', (e) => {
            console.log(e, e.guides)
            // const el = document.getElementById('out-page')
            // const top = 20 + (el?.offsetTop || 0)
            // store.commit('updateGuidelines', { horizontalGuidelines: e.guides.map((x) => x + top) })
        }).on("dragStart",e => {
            // 临时禁用边界自动平移视图 https://www.leaferjs.com/ui/guide/app/config.html#move
            this.canvas.app.config.move!.dragOut = false
        }).on("dragEnd",e => {
            this.canvas.app.config.move!.dragOut = true
        })

        this.guidesLeft = new Guides(<HTMLElement> document.getElementById(this.container), {
            ...sameParams,
            type: 'vertical',
            className: `my-vertical ${this.enabled?'ruler-show':'ruler-hide'}`,
        }).on('changeGuides', (e) => {

            console.log(e, e.guides)
            // store.commit('updateGuidelines', { verticalGuidelines: e.guides })
        }).on("dragStart",e => {
            // 临时禁用边界自动平移视图 https://www.leaferjs.com/ui/guide/app/config.html#move
            this.canvas.app.config.move!.dragOut = false
        }).on("dragEnd",e => {
            this.canvas.app.config.move!.dragOut = false
        })
    }


    public dispose(): void {
        super.dispose()
        this.enabled = false
    }
    public setElPadding(){
        this.el?.classList.add("ruler-pd")
    }
    public removeElPadding(){
        this.el?.classList.remove("ruler-pd")
    }
}
