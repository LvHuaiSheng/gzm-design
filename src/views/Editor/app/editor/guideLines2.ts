import {MLeaferCanvas, IMLeaferCanvas} from '@/views/Editor/core/canvas/mLeaferCanvas'

import {Disposable} from '@/views/Editor/utils/lifecycle'
import {DragEvent, MoveEvent, RenderEvent, App, Group, Point} from "leafer-ui";
import {IUI} from "@leafer-ui/interface";
import {typeUtil} from "@/views/Editor/utils/utils";
import {Bounds} from "@leafer-ui/core";

export interface XY {
    x: number;
    y: number;
}

type VerticalLineCoords = {
    x: number
    y1: number
    y2: number
}

type HorizontalLineCoords = {
    y: number
    x1: number
    x2: number
}

type IgnoreObjTypes<T = keyof any> = {
    key: T
    value: any
}[]

type ACoordsAppendCenter = {
    tr: any
    tl: any
    br: any
    bl: any
    c: any
}

const Keys = <T extends object>(obj: T): (keyof T)[] => {
    return Object.keys(obj) as (keyof T)[]
}

export class GuideLines extends Disposable {

    private aligningLineMargin = 10
    private aligningLineWidth = 1
    private aligningLineColor = '#F68066'

    private verticalLines: VerticalLineCoords[] = []
    private horizontalLines: HorizontalLineCoords[] = []
    private activeObj: IUI | undefined
    private ignoreObjTypes: IgnoreObjTypes = []
    private pickObjTypes: IgnoreObjTypes = []
    private dirty = false
    private canvasLeafer: App

    constructor(@IMLeaferCanvas private readonly canvas: MLeaferCanvas) {
        super()
        this.canvasLeafer = canvas.app
        const mouseUp = () => {
            // 如果存在水平线或垂直线，则清除辅助线和相关元数据
            if (this.horizontalLines.length || this.verticalLines.length) {
                this.clearGuideline()
                this.clearLinesMeta()
            }
        }

        this.canvas.app.on(RenderEvent.BEFORE, (arg: RenderEvent) => {
            this.clearGuideline()
        })
        this.canvas.app.on(RenderEvent.AFTER, (arg: RenderEvent) => {
            this.drawGuideLines(arg)
        })
        this.canvas.app.on(DragEvent.DRAG, (arg: DragEvent) => {
            console.log('arg=', arg)
            console.log('this.canvas.app.editor=',)
            if (this.canvas.app.editor.single){
                this.objectMoving({target: this.canvas.app.editor.element})
            }else {
                this.objectMoving({target: {innerId:-1,tag:'Group',children:this.canvas.app.editor.list}})
            }

        })
        this.canvas.app.on(DragEvent.DRAG, (arg: DragEvent) => {
            mouseUp()
        })


        // this.canvasEvents = {
        //   'before:render': this.clearGuideline.bind(this),
        //   'after:render': this.drawGuideLines.bind(this),
        //   'object:moving': this.objectMoving.bind(this),
        //   'mouse:up': mouseUp,
        // }

        // canvas.on(this.canvasEvents as any)
    }

    /**
     * 当对象被移动时，处理对象的移动事件
     * @param target 移动对象
     */
    private objectMoving({target}) {
        console.log('target=', target)
        // 清除线条元数据
        this.clearLinesMeta()
        // 获取当前变换信息
        const transform = this.canvasLeafer.worldTransform
        console.log('transform=', transform)
        if (!transform) return
        // 设置当前活动对象为目标对象
        this.activeObj = target

        // 获取当前激活的所有对象
        const activeObjects = this.canvas.getActiveObjects()
        // const activeObjects = this.canvas.children
        console.log('activeObjects=', activeObjects)
        // 定义一个 canvas 对象数组用于存放 canvas 上的所有操作元素
        const canvasObjects: any[] = []

        /**
         * 定义递归函数 add，用于获取当前 group 内的元素并将其加入 canvasObjects 数组
         * @param group 待遍历的 group 对象
         */
        const add = (
            group: any
        ) => {
            // 获取 group 内符合条件的所有元素
            const objects = group.children.filter((obj: IUI) => {
                // 根据 ignoreObjTypes、pickObjTypes、activeObjects 等过滤条件，筛选出符合要求的元素
                if (this.ignoreObjTypes.length) {
                    return !this.ignoreObjTypes.some(
                        (item) => obj.innerId === item.value
                    )
                }
                if (this.pickObjTypes.length) {
                    return this.pickObjTypes.some(
                        (item) => obj.innerId === item.value
                    )
                }
                // debugger
                if (
                    // 排除 自己 和 激活选区内的元素
                    activeObjects.includes(obj)
                ) {
                    return false
                }
                // // 元素为组，把组内元素加入，同时排除组本身
                // if (typeUtil.isActiveSelection(obj)) {
                //     add(obj)
                //     return false
                // }
                // 元素为组，把组内元素加入，同时排除组本身
                if (typeUtil.isCollection(obj) && target.parent && obj !== target.parent) {
                    add(obj)
                    return false
                }
                return true
            })
            console.log('objects=', objects)
            // 将筛选出的元素加入 canvasObjects 数组
            canvasObjects.push(...objects)
        }

        // 如果目标对象是激活选区，逐一获取选区中每个元素和其父对象的所有子元素，并将它们加入 canvasObjects 数组
        if (typeUtil.isVirtualElement(target)) {
            const needAddParent = new Set<any>()
            target.children.forEach((obj:IUI)=>{
                const parent = obj.parent
                needAddParent.add(parent)
            })
            // target.forEachObject((obj) => {
            //     const parent = obj.parent
            //     needAddParent.add(parent)
            // })
            needAddParent.forEach((parent) => {
                // if (typeUtil.isNativeGroup(parent)) {
                    canvasObjects.push(parent)
                // }
                add(parent)
            })
        } else {
            // 如果目标对象不是激活选区，则获取目标对象的父对象，并将其加入 canvasObjects 数组
            const parent = target.parent
            if (!typeUtil.isBottomCanvas(parent)) {
                canvasObjects.push(parent)
            }
            // 继续递归获取父对象的所有子元素，并将它们加入 canvasObjects 数组
            add(parent)
        }

        // 对 canvasObjects 数组中的所有元素进行递归处理，获取它们所有的子元素，并加入 canvasObjects 数组
        this.traversAllObjects(target, canvasObjects)
    }


    /**
     * 清除当前canvas上所有的水平和垂直辅助线
     */
    private clearLinesMeta() {
        // 将垂直线和水平线数组的长度设为0，即清空数组
        this.verticalLines.length = this.horizontalLines.length = 0;
    }


    /**
     * 根据活动对象计算拖动过程中的对象坐标信息
     * @param activeObject 活动对象
     * @returns 包含拖动过程中对象四个角点坐标和中心点坐标的对象
     */
    private getObjDraggingObjCoords(obj: IUI): ACoordsAppendCenter {
        // // 获取活动对象的坐标信息
        // const coords = this.getCoords(obj);
        // console.log('coords=',coords)
        // // 计算中心点位移
        // const centerPoint = this.subtractCoords(this.calcCenterPointByACoords(coords),obj.getInnerPoint(obj.boxBounds))
        // // const centerPoint = this.calcCenterPointByACoords(coords).subtract(
        // //     // activeObject.getCenterPoint(),
        // //     obj.getInnerPoint(obj.boxBounds),
        // // );
        //
        // // 根据中心点位移对坐标进行调整，得到新的坐标信息
        // // const newCoords = Object.keys(coords).map((key) => coords[key].subtract(centerPoint));
        // const newCoords = Object.keys(coords).map((key) => this.subtractCoords(coords[key],centerPoint));

        // // activeObject.localTransform
        // // 构建包含新坐标信息的对象并返回
        // let tl = obj.getWorldPoint({x: obj.boxBounds.x, y:obj.boxBounds.y});
        // let tr = obj.getWorldPoint({x: obj.boxBounds.x + obj.boxBounds.width, y:obj.boxBounds.y});
        // let br = obj.getWorldPoint({x: obj.boxBounds.x + obj.boxBounds.width, y:obj.boxBounds.y + obj.boxBounds.height});
        // let bl = obj.getWorldPoint({x: obj.boxBounds.x, y:obj.boxBounds.y+ obj.boxBounds.height });
        const boundsData = {x: obj.x, y: obj.y, width: obj.width, height: obj.height}
        const bounds = new Bounds(boundsData)
        const [tl, tr, br, bl] = bounds.getPoints()
        var center = this.getCenterXY(obj.x, obj.y, obj.width, obj.height);
        return {
            tl, tr, br, bl,
            // c: activeObject.getCenterPoint(),
            c: center,
        };
        // return newCoords
    }

    /**
     * 获取中心点坐标
     * @param left
     * @param top
     * @param width
     * @param height
     * @param originX
     * @param originY
     * @private
     */
    private getCenterXY(left: number, top: number, width: number, height: number, originX?: string, originY?: string) {
        originX = originX || 'left';
        originY = originY || 'top';

        var centerX = left,
            centerY = top;

        if (originX === 'center') {
            centerX += width / 2;
        } else if (originX === 'right') {
            centerX += width;
        }

        if (originY === 'center') {
            centerY += height / 2;
        } else if (originY === 'bottom') {
            centerY += height;
        }

        return {x: centerX, y: centerY};
    }

    /**
     * 根据物体的坐标计算物体的最大宽度和高度
     * @param coords 包含物体四个角点坐标和中心点坐标的对象
     * @returns 物体的最大宽度和高度
     */
    private getObjMaxWidthHeightByCoords(coords: ACoordsAppendCenter) {
        // 从坐标对象中获取需要用到的点的坐标
        const {c, tl, tr} = coords;
        // 计算物体的高度，取中心点到上左角点的垂直距离和中心点到上右角点的垂直距离的较大值，乘以2
        const objHeight = Math.max(Math.abs(c.y - tl.y), Math.abs(c.y - tr.y)) * 2;

        // 计算物体的宽度，取中心点到上左角点的水平距离和中心点到上右角点的水平距离的较大值，乘以2
        const objWidth = Math.max(Math.abs(c.x - tl.x), Math.abs(c.x - tr.x)) * 2;

        // 返回物体的最大宽度和高度
        return {objHeight, objWidth};
    }


    /**
     * 根据对象的旋转角度忽略一些坐标（当对象被旋转时，需要忽略一些坐标，例如水平辅助线只取最上、下边的坐标（参考 figma））
     * @param objCoords 包含对象四个角点坐标和中心点坐标的对象
     * @param type 忽略坐标的类型，可以是 'vertical' 或 'horizontal'
     * @returns 忽略部分坐标后的新坐标对象
     */
    private omitCoords(objCoords: ACoordsAppendCenter, type: 'vertical' | 'horizontal') {
        // 创建一个新的坐标对象，初始值与传入的坐标对象相同
        const newCoords = objCoords;

        // 根据类型确定要比较的坐标轴是 'x' 还是 'y'
        const axis = type === 'vertical' ? 'x' : 'y';

        // 遍历坐标对象的键
        Object.keys(objCoords).forEach((key) => {
            // 如果该点的坐标在比较轴上小于左上角点的坐标，则将该点的坐标赋值给新坐标对象
            if (objCoords[key][axis] < newCoords.tl[axis]) {
                newCoords[key] = objCoords[key];
            }
            // 如果该点的坐标在比较轴上大于左上角点的坐标，则将该点的坐标赋值给新坐标对象
            if (objCoords[key][axis] > newCoords.tl[axis]) {
                newCoords[key] = objCoords[key];
            }
        });

        // 返回忽略部分坐标后的新坐标对象
        return newCoords;
    }

    /**
     * 检查 value1 和 value2 是否在指定的范围内，用于对齐线的计算
     */
    private isInRange(value1: number, value2: number) {
        return (
            Math.abs(Math.round(value1) - Math.round(value2)) <=
            this.aligningLineMargin / this.canvas.getZoom()
        )
    }

    /**
     * 获取物体的四个角点坐标
     * @param obj Fabric 对象
     * @returns 包含物体四个角点坐标的对象
     */
    private getCoords(obj: IUI) {
        // 使用 obj.getCoords(true) 获取物体四个角点的坐标，存储到数组中
        // const [tl, tr, br, bl] = obj.getCoords(true);
        // const center = obj.getWorldPoint({x: obj.x, y:obj.y})
        // let tl = obj.getWorldPoint({x: obj.boxBounds.x, y:obj.boxBounds.y});
        // let tr = obj.getWorldPoint({x: obj.boxBounds.x + obj.boxBounds.width, y:obj.boxBounds.y});
        // let br = obj.getWorldPoint({x: obj.boxBounds.x + obj.boxBounds.width, y:obj.boxBounds.y + obj.boxBounds.height});
        // let bl = obj.getWorldPoint({x: obj.boxBounds.x, y:obj.boxBounds.y+ obj.boxBounds.height });
        //
        // // 返回包含物体四个角点坐标的对象
        // return {
        //     tl,
        //     tr,
        //     br,
        //     bl,
        //     c:center
        // };
        const boundsData = {x: obj.x, y: obj.y, width: obj.width, height: obj.height}
        const bounds = new Bounds(boundsData)
        const [tl, tr, br, bl] = bounds.getPoints()
        var center = this.getCenterXY(obj.x, obj.y, obj.width, obj.height);
        return {
            tl, tr, br, bl,
            c: center,
        };
    }


    /**
     * 通过物体四个角点坐标计算得到物体实际位置上的中心点坐标
     * @param coords 包含物体四个角点坐标的对象
     * @returns 物体实际位置上的中心点坐标
     */
    private calcCenterPointByACoords(coords: any) {
        // 计算左上角点和右下角点的坐标平均值作为物体实际位置上的中心点坐标
        // new Point((coords.tl.x + coords.br.x) / 2, (coords.tl.y + coords.br.y) / 2)
        const boundsData = {
            x: (coords.tl.x + coords.br.x) / 2,
            y: (coords.tl.y + coords.br.y) / 2,
            width: coords.width,
            height: coords.height
        }
        const bounds = new Bounds(boundsData)
        const [tl, tr, br, bl] = bounds.getPoints()
        var center = this.getCenterXY(tl.x, tl.y, coords.width, coords.height);
        return {
            tl, tr, br, bl,
            c: center,
        };

    }

    private subtractCoords(point: Point, that: XY): Point {
        return new Point(point.x - that.x, point.y - that.y);
    }

    /**
     * 遍历所有物体，并进行相应操作
     * @param activeObject 当前活动物体
     * @param canvasObjects 画布上的所有物体数组
     */
    private traversAllObjects(activeObject: IUI, canvasObjects: IUI[]) {
        // 获取活动物体在拖动位置上的坐标
        const objCoordsByMovingDistance = this.getObjDraggingObjCoords(activeObject);

        // 用于存储水平方向上的吸附点的集合
        const snapXPoints: Set<number> = new Set();
        // 用于存储垂直方向上的吸附点的集合
        const snapYPoints: Set<number> = new Set();

        for (let i = canvasObjects.length; i--;) {
            // 获取物体的坐标和中心点坐标
            const objCoords = {
                ...this.getCoords(canvasObjects[i]),
                // c: canvasObjects[i].getCenterPoint(),
                c: canvasObjects[i].getWorldPoint(canvasObjects[i].boxBounds),
            } as ACoordsAppendCenter;

            // 获取物体在移动距离上的最大宽度和高度
            const {objHeight, objWidth} = this.getObjMaxWidthHeightByCoords(objCoords);

            // 遍历活动物体在拖动位置上的坐标对象的属性
            Keys(objCoordsByMovingDistance).forEach((activeObjPoint) => {
                // 判断是否需要省略水平方向的坐标
                console.log('canvasObjects[i]=', canvasObjects[i])
                const newCoords =
                    canvasObjects[i].rotation !== 0 ? this.omitCoords(objCoords, 'horizontal') : objCoords;

                function calcHorizontalLineCoords(
                    objPoint: keyof ACoordsAppendCenter,
                    activeObjCoords: ACoordsAppendCenter,
                ) {
                    let x1: number, x2: number;
                    if (objPoint === 'c') {
                        // 计算中心点的范围
                        x1 = Math.min(objCoords.c.x - objWidth / 2, activeObjCoords[activeObjPoint].x);
                        x2 = Math.max(objCoords.c.x + objWidth / 2, activeObjCoords[activeObjPoint].x);
                    } else {
                        // 计算其他点的范围
                        x1 = Math.min(objCoords[objPoint].x, activeObjCoords[activeObjPoint].x);
                        x2 = Math.max(objCoords[objPoint].x, activeObjCoords[activeObjPoint].x);
                    }
                    return {x1, x2};
                }

                // 遍历物体的坐标对象的属性
                Keys(newCoords).forEach((objPoint) => {
                    // 判断活动物体在拖动位置上的y坐标是否在当前物体的y坐标范围内
                    if (this.isInRange(objCoordsByMovingDistance[activeObjPoint].y, objCoords[objPoint].y)) {
                        const y = objCoords[objPoint].y;

                        // 计算吸附后的y坐标
                        const offset = objCoordsByMovingDistance[activeObjPoint].y - y;
                        snapYPoints.add(objCoordsByMovingDistance.c.y - offset);

                        // 获取活动物体的坐标和中心点坐标
                        const aCoords = this.getCoords(activeObject);
                        const {x1, x2} = calcHorizontalLineCoords(objPoint, {
                            ...aCoords,
                            c: this.calcCenterPointByACoords(aCoords),
                        } as ACoordsAppendCenter);

                        // 将水平线添加到数组中
                        this.horizontalLines.push({y, x1, x2});
                    }
                });
            });

            // 遍历活动物体在拖动位置上的坐标对象的属性
            Keys(objCoordsByMovingDistance).forEach((activeObjPoint) => {
                // 判断是否需要省略垂直方向的坐标
                const newCoords =
                    canvasObjects[i].rotation !== 0 ? this.omitCoords(objCoords, 'vertical') : objCoords;

                function calcVerticalLineCoords(
                    objPoint: keyof ACoordsAppendCenter,
                    activeObjCoords: ACoordsAppendCenter,
                ) {
                    let y1: number, y2: number;
                    if (objPoint === 'c') {
                        // 计算中心点的范围
                        y1 = Math.min(newCoords.c.y - objHeight / 2, activeObjCoords[activeObjPoint].y);
                        y2 = Math.max(newCoords.c.y + objHeight / 2, activeObjCoords[activeObjPoint].y);
                    } else {
                        // 计算其他点的范围
                        y1 = Math.min(objCoords[objPoint].y, activeObjCoords[activeObjPoint].y);
                        y2 = Math.max(objCoords[objPoint].y, activeObjCoords[activeObjPoint].y);
                    }
                    return {y1, y2};
                }

                // 遍历物体的坐标对象的属性
                Keys(newCoords).forEach((objPoint) => {
                    // 判断活动物体在拖动位置上的x坐标是否在当前物体的x坐标范围内
                    if (this.isInRange(objCoordsByMovingDistance[activeObjPoint].x, objCoords[objPoint].x)) {
                        const x = objCoords[objPoint].x;

                        // 计算吸附后的x坐标
                        const offset = objCoordsByMovingDistance[activeObjPoint].x - x;
                        snapXPoints.add(objCoordsByMovingDistance.c.x - offset);

                        // 获取活动物体的坐标和中心点坐标
                        const aCoords = this.getCoords(activeObject);
                        const {y1, y2} = calcVerticalLineCoords(objPoint, {
                            ...aCoords,
                            c: this.calcCenterPointByACoords(aCoords),
                        } as ACoordsAppendCenter);

                        // 将垂直线添加到数组中
                        this.verticalLines.push({x, y1, y2});
                    }
                });
            });
        }

        // 进行吸附操作
        this.snap({
            activeObject,
            draggingObjCoords: objCoordsByMovingDistance,
            snapXPoints,
            snapYPoints,
        });
    }


    /**
     * 自动吸附对象
     */
    private snap({
                     activeObject,
                     draggingObjCoords,
                     snapXPoints,
                     snapYPoints,
                 }: {
        /** 当前活动对象 */
        activeObject: IUI
        /** 活动对象的坐标 */
        draggingObjCoords: ACoordsAppendCenter
        /** 横向吸附点列表 */
        snapXPoints: Set<number>
        /** 纵向吸附点列表 */
        snapYPoints: Set<number>
    }) {
        if (snapXPoints.size === 0 && snapYPoints.size === 0) return

        // 获得最近的吸附点
        const sortPoints = (list: Set<number>, originPoint: number): number => {
            if (list.size === 0) {
                return originPoint
            }

            const sortedList = [...list].sort(
                (a, b) => Math.abs(originPoint - a) - Math.abs(originPoint - b),
            )

            return sortedList[0]
        }
        activeObject.move(
            sortPoints(snapXPoints, draggingObjCoords.c.x),
            sortPoints(snapYPoints, draggingObjCoords.c.y),
        )
        // auto snap nearest object, record all the snap points, and then find the nearest one
        // activeObject.setXY(
        //   new Point(
        //     sortPoints(snapXPoints, draggingObjCoords.c.x),
        //     sortPoints(snapYPoints, draggingObjCoords.c.y),
        //   ),
        //   'center',
        //   'center',
        // )
    }

    /**
     * 在给定的坐标点绘制对齐标记
     * @param x X坐标值
     * @param y Y坐标值
     */
    private drawSign(x: number, y: number) {
        // 获取顶层渲染上下文
        const ctx = this.canvas.app.canvas.context

        // 设置画笔颜色为对齐线颜色
        ctx.strokeStyle = this.aligningLineColor

        // 开始绘制路径
        ctx.beginPath()

        // 绘制十字形的两条线段
        const size = 3
        ctx.moveTo(x - size, y - size)
        ctx.lineTo(x + size, y + size)
        ctx.moveTo(x + size, y - size)
        ctx.lineTo(x - size, y + size)

        // 绘制完成，使用画笔绘制路径
        ctx.stroke()
    }


    /**
     * 在给定的两个坐标点之间绘制辅助线，并在两个端点处绘制对齐标记
     * @param x1 第一个点的 X 坐标值
     * @param y1 第一个点的 Y 坐标值
     * @param x2 第二个点的 X 坐标值
     * @param y2 第二个点的 Y 坐标值
     */
    private drawLine(x1: number, y1: number, x2: number, y2: number) {
        // 获取顶层渲染上下文
        const ctx = this.canvas.app.canvas.context

        // 将坐标点根据canvas视口变换进行转换得到真实坐标
        // const point1 = util.transformPoint(new Point(x1, y1), this.canvas.viewportTransform)
        // const point2 = util.transformPoint(new Point(x2, y2), this.canvas.viewportTransform)
        const center1 = {x: x1, y: y1}
        const point1 = this.canvas.app.getInnerPoint(center1)


        const center2 = {x: x2, y: y2}
        const point2 = this.canvas.app.getInnerPoint(center2)

        // 使用Canvas的原生API绘制辅助线
        ctx.save()
        ctx.lineWidth = this.aligningLineWidth
        ctx.strokeStyle = this.aligningLineColor
        ctx.beginPath()

        // 绘制辅助线
        ctx.moveTo(point1.x, point1.y)
        ctx.lineTo(point2.x, point2.y)

        // 使用画笔绘制路径
        ctx.stroke()

        // 在两端点处绘制对齐标记
        this.drawSign(point1.x, point1.y)
        this.drawSign(point2.x, point2.y)

        // 恢复画布状态，清空所有之前的绘画样式和属性
        ctx.restore()

        // 将dirty标志位设置为true，表示Canvas已被修改过
        this.dirty = true
    }


    /**
     * 用于绘制垂直线的私有方法
     * @param coords 垂直线位置和起点、终点y坐标信息的对象
     * @param movingCoords 可移动图形位置和大小信息的对象
     */
    private drawVerticalLine(coords: VerticalLineCoords, movingCoords: ACoordsAppendCenter) {
        // 判断可移动图形的任意一个坐标的x值是否与垂直线的x值相差小于0.0001
        if (!Object.values(movingCoords).some((coord) => Math.abs(coord.x - coords.x) < 0.0001)) return
        // 绘制垂直线，起点和终点x坐标都为coords对象的x值，y坐标取起点和终点y坐标的最小值和最大值
        this.drawLine(
            coords.x,
            Math.min(coords.y1, coords.y2),
            coords.x,
            Math.max(coords.y1, coords.y2),
        )
    }


    /**
     * 用于绘制水平线的私有方法
     * @param coords 水平线位置和起点、终点x坐标信息的对象
     * @param movingCoords 可移动图形位置和大小信息的对象
     */
    private drawHorizontalLine(coords: HorizontalLineCoords, movingCoords: ACoordsAppendCenter) {
        // 判断可移动图形的任意一个坐标的y值是否与水平线的y值相差小于0.0001
        if (!Object.values(movingCoords).some((coord) => Math.abs(coord.y - coords.y) < 0.0001)) return
        // 绘制水平线，起点和终点y坐标都为coords对象的y值，x坐标取起点和终点x坐标的最小值和最大值
        this.drawLine(
            Math.min(coords.x1, coords.x2),
            coords.y,
            Math.max(coords.x1, coords.x2),
            coords.y,
        )
    }


    /**
     * 用于绘制辅助线的方法
     * @param e 渲染后的Canvas事件对象
     */
    private drawGuideLines(e) {
        // 检查是否存在渲染上下文，以及是否存在垂直线和水平线，以及是否存在活动对象
        if ((!this.verticalLines.length && !this.horizontalLines.length) || !this.activeObj) {
            return
        }

        // 获取活动对象的位置信息
        const movingCoords = this.getObjDraggingObjCoords(this.activeObj)

        // 遍历垂直线数组，绘制垂直线
        for (let i = this.verticalLines.length; i--;) {
            this.drawVerticalLine(this.verticalLines[i], movingCoords)
        }
        // 遍历水平线数组，绘制水平线
        for (let i = this.horizontalLines.length; i--;) {
            this.drawHorizontalLine(this.horizontalLines[i], movingCoords)
        }

        // 更新偏移量
        // this.canvas.calcOffset()
    }


    /**
     * 清除辅助线的方法
     */
    private clearGuideline() {
        // 如果dirty标志位为false，则表示不需要清除辅助线，直接返回
        if (!this.dirty) return

        // 将dirty标志位设置为false，表示已经清除辅助线
        this.dirty = false

        // 使用canvas的clearContext方法清除画布上的内容
        // 参数为获取顶层渲染上下文的方法
        // this.canvas.clearContext(this.canvas.app.canvas.context)
    }


    public dispose(): void {
        super.dispose()
        // this.canvas.off(this.canvasEvents)
    }
}
