import {MLeaferCanvas, IMLeaferCanvas} from '@/views/Editor/core/canvas/mLeaferCanvas'
import {KeybindingService, IKeybindingService} from '@/views/Editor/core/keybinding/keybindingService'
import {useAppStore} from '@/store'
import {useMagicKeys, useActiveElement, toValue, Fn} from '@vueuse/core'
import {Disposable} from '@/views/Editor/utils/lifecycle'
import {EventbusService, IEventbusService} from '@/views/Editor/core/eventbus/eventbusService'
import {PenDraw} from "@/views/Editor/core/canvas/penDraw";

type ToolOption = {
    defaultCursor: string
    skipTargetFind: boolean
    selection: boolean
}

type ToolType = 'move' | 'handMove' | 'shape'

export class ToolBar extends Disposable {
    private space = useMagicKeys().space
    private penDraw: PenDraw
    private options: Record<ToolType, ToolOption> = {
        move: {
            defaultCursor: 'default',
            skipTargetFind: false,
            selection: true,
        },
        handMove: {
            defaultCursor: 'grab',
            skipTargetFind: true,
            selection: false,
        },
        shape: {
            defaultCursor: 'crosshair',
            skipTargetFind: true,
            selection: false,
        },
    }

    constructor(
        @IMLeaferCanvas private readonly canvas: MLeaferCanvas,
        @IKeybindingService private readonly keybinding: KeybindingService,
        @IEventbusService private readonly eventbus: EventbusService,
    ) {
        super()

        useAppStore().activeTool = 'select'

        // 初始化钢笔
        this.penDraw = new PenDraw(canvas)

        this.initWatch()
        this.initKeybinding()
    }

    private applyOption(tool?: ToolType) {
        tool = tool ?? (storeToRefs(useAppStore()).activeTool.value as ToolType)
        const {defaultCursor, skipTargetFind, selection} = this.options[tool] ?? this.options.shape

    }

    private initWatch() {
        const {activeTool} = storeToRefs(useAppStore())

        // 监听activeTool
        watch(activeTool, (newTool, oldTool) => {
            if (this.toolStop) {
                this.toolStop()
                this.toolStop = undefined
            }
            console.log('change tool：', newTool)

            this.applyOption()

            // 选择工具
            if (newTool === 'select') {
                this.setSelect()
            }

            // 移动工具
            if (newTool === 'handMove') {
                this.setMove()
            }

            // 钢笔
            else if (newTool === 'pen') {
                this.setNoSelect()
                this.switchPen()
            }

            // 矢量
            else if (newTool === 'vector') {
                this.switchVector()
            }
        })
    }

    /**
     * 使用选择工具（编辑器）
     * @private
     */
    private setSelect() {
        this.penDraw.stop()
        // this.canvas.app.config.move!.dragEmpty = false
        // this.canvas.contentLayer.hitChildren = true
        // this.canvas.contentFrame.hitChildren = true
        this.canvas.app.config.move.drag = false
        this.canvas.app.tree.hittable = true
        this.canvas.app.editor.hittable = true
    }

    /**
     * 设置不可选中、不可拖动
     * @private
     */
    private setNoSelect() {
        this.penDraw.stop()
        this.canvas.app.config.move.drag = false
        this.canvas.app.tree.hittable = false
        this.canvas.app.editor.hittable = false
    }

    /**
     * 设置仅拖动
     * @private
     */
    private setMove() {
        this.penDraw.stop()
        // this.canvas.contentLayer.hitChildren = true
        // this.canvas.contentFrame.hitChildren = false
        this.canvas.app.config.move.drag = true
    }

    private toolStop: Fn | undefined

    /**
     * 钢笔
     * @private
     */
    private switchPen() {
        this.penDraw.start()
    }

    /**
     * Vector | Pen | Path
     * L: lineto, absolute
     * M: moveto, absolute
     * C: bezierCurveTo, absolute
     * Q: quadraticCurveTo, absolute
     * Z: closepath
     * getPointOnPath
     */
    private switchVector() {

    }


    private initKeybinding() {
        // 快捷键
        const {activeTool} = storeToRefs(useAppStore())
        this.keybinding.bind({
            s: () => (activeTool.value = 'select'),
            h: () => (activeTool.value = 'handMove'),
            esc: () => {
                if (activeTool.value !== 'select') {
                    activeTool.value = 'select'
                } else {
                    this.canvas.discardActiveObject()
                    // this.canvas.requestRenderAll()
                }
            },
        })
    }
}
