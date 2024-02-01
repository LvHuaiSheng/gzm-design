import {Pen, PointerEvent} from 'leafer-ui'
import {MLeaferCanvas} from "@/views/Editor/core/canvas/mLeaferCanvas";
import {getDefaultName} from "@/views/Editor/utils/utils";

/**
 * 配置选项接口，用于描述签名插件的各种配置参数
 */
export interface SignaturePluginOptions {
    type: string,
    config: {
        stroke?: string;                     // 画笔颜色
        strokeWidth?: number;                // 画笔粗细
        penOpacity?: number;
    }              // 画笔透明度
    //todo 配置选项
}

export class PenDraw{
    private canvas: MLeaferCanvas;
    private pen?: Pen | null;
    // 是否可以画
    private canDrawing: boolean = false;
    private isDrawing: boolean;
    private config: SignaturePluginOptions;

    constructor(
        canvas: MLeaferCanvas,
    ) {
        this.canvas = canvas
        this.isDrawing = false;
        this.config = {
            type: "pen", config: {
                stroke: 'red',
                //笔颜色 strokeWidth: 2 //粗细 opacity:0.5 //透明度
            }
        }
    }

    /**
     * 开始画
     */
    public start() {
        this.canDrawing = true
        this.startDrawing();
        this.continueDrawing();
        this.stopDrawing();
    }
    /**
     * 开始画
     */
    public stop() {
        this.canDrawing = false
        this.pen = null
    }

    private startDrawing() {
        this.canvas.app.on(PointerEvent.DOWN, (event: PointerEvent) => {
            if (event.left && !event.spaceKey && this.canDrawing){
                if (!this.pen){
                    this.pen = new Pen({
                        name:getDefaultName(this.canvas.contentLayer),
                        // 子元素是否响应交互事件
                        hitChildren: false,
                        editable: true,
                    });
                    this.canvas.contentFrame.add(this.pen);
                    this.canvas.childrenEffect()
                }
                this.isDrawing = true;
                this.pen.setStyle({
                    stroke: this.config.config.stroke ? this.config.config.stroke : 'red',
                    strokeWidth: this.config.config.strokeWidth ? this.config.config.strokeWidth : 2,
                    opacity: this.config.config.penOpacity ? this.config.config.penOpacity : 1,
                });
                const center = {x:event.x,y:event.y}
                const innerPoint = this.canvas.contentFrame.getInnerPoint(center)
                this.pen.moveTo(innerPoint.x, innerPoint.y);
            }
        });
    }

    private continueDrawing() {
        this.canvas.app.on(PointerEvent.MOVE, (event: PointerEvent) => {
            if (event.left && !event.spaceKey && this.pen ) {
                if (this.isDrawing) {
                    const center = {x:event.x,y:event.y}
                    const innerPoint = this.canvas.contentFrame.getInnerPoint(center)
                    this.pen.lineTo(innerPoint.x, innerPoint.y);
                    this.pen.paint();
                }
            }
        });
    }

    private stopDrawing() {
        this.canvas.app.on(PointerEvent.UP, () => {
            if (this.pen) {
                this.isDrawing = false;
                // 每画完一次一个新图层
                this.pen = null
            }
        });
    }

    public clearSignature() {
        this.pen?.clear();
    }
}
