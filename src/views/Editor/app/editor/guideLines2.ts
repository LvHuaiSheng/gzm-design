import {IMLeaferCanvas, MLeaferCanvas} from '@/views/Editor/core/canvas/mLeaferCanvas'

import {Disposable} from '@/views/Editor/utils/lifecycle'
import {DragEvent, Point, RenderEvent} from "leafer-ui";
import {typeUtil} from "@/views/Editor/utils/utils";
import {Bounds} from "@leafer-ui/core";
import {ILeafer, IUI} from "@leafer-ui/interface";

class MPoint{
    public x:number
    public y:number

    constructor(x: number, y: number){
        this.x = x
        this.y = y
    }
    public subtract(that:XY){
        return new MPoint(this.x - that.x, this.y - that.y);
    }
}
// type MPoint = {
//     x:number,
//     y:number,
//     subtract:Function
// }
type XY = {
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

type IgnoreObjTypes<T = keyof IUI> = {
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
    private aligningLineColor = 'rgba(22,93,255,0.55)'

    private verticalLines: VerticalLineCoords[] = []
    private horizontalLines: HorizontalLineCoords[] = []
    private activeObj: IUI | undefined
    private ignoreObjTypes: IgnoreObjTypes = []
    private pickObjTypes: IgnoreObjTypes = []
    private dirty = false

    private canvasLeafer: ILeafer

    constructor(@IMLeaferCanvas private readonly canvas: MLeaferCanvas) {
        super()
        this.canvasLeafer = canvas.app.addLeafer()
        const mouseUp = () => {
            if (this.horizontalLines.length || this.verticalLines.length) {
                this.clearGuideline()
                this.clearLinesMeta()
            }
        }

        this.canvas.app.tree.on(RenderEvent.BEFORE, (arg: RenderEvent) => {
            this.clearGuideline()
        })
        this.canvas.app.tree.on(RenderEvent.AFTER, (arg: RenderEvent) => {
            this.drawGuideLines(arg)
        })
        this.canvas.app.editor.on(DragEvent.DRAG, (arg: DragEvent) => {
            if (this.canvas.app.editor.single){
                this.objectMoving(this.canvas.app.editor.element)
            }else {
                this.objectMoving( {innerId:-1,tag:'Group',children:this.canvas.app.editor.list})
            }

        })
        this.canvas.app.tree.on(DragEvent.DRAG, (arg: DragEvent) => {
            mouseUp()
        })
    }

    private objectMoving(target: IUI) {
        this.clearLinesMeta() // 清除线条元数据

        const transform = this.canvas.app.tree.worldTransform // 获取当前变换对象
        if (!transform) return // 如果没有变换对象，则返回

        this.activeObj = target // 设置活动对象为移动的目标对象

        const activeObjects = this.canvas.getActiveObjects() // 获取活动对象数组

        const canvasObjects: IUI[] = [] // 创建一个存储画布对象的数组
        const add = (group: IUI) => { // 定义一个 add 方法，用于添加对象到 canvasObjects 数组中
            const objects = group.children.filter((obj:IUI) => {
                // if (this.ignoreObjTypes.length) { // 如果 ignoreObjTypes 数组不为空
                //     return !this.ignoreObjTypes.some((item) => obj.get(item.key) === item.value) // 筛选掉属性匹配 ignoreObjTypes 中的项
                // }
                // if (this.pickObjTypes.length) { // 如果 pickObjTypes 数组不为空
                //     return this.pickObjTypes.some((item) => obj.get(item.key) === item.value) // 筛选出属性匹配 pickObjTypes 中的项
                // }
                if (
                    // 排除自己和激活选区内的元素
                    activeObjects.includes(obj)
                ) {
                    return false
                }
                // 元素为组，把组内元素加入，同时排除组本身
                if (typeUtil.isActiveSelection(obj)) {
                    add(obj)
                    return false
                }
                // 元素为组，把组内元素加入，同时排除组本身
                // if (typeUtil.isCollection(obj) && target.group && obj === target.group) {
                //     add(obj)
                //     return false
                // }
                return true
            })
            canvasObjects.push(...objects) // 将筛选出来的对象加入到 canvasObjects 数组中
        }

        if (typeUtil.isActiveSelection(target)) { // 如果目标对象是激活选区
            const needAddParent = new Set<IUI>() // 创建一个存储需要添加的父级对象的 Set
            target.forEachObject((obj) => { // 遍历激活选区内的每个对象
                const parent = obj.parent // 获取对象的父级对象
                needAddParent.add(parent) // 将父级对象添加到 needAddParent Set 中
            })
            needAddParent.forEach((parent) => {
                if (!typeUtil.isBottomCanvas(parent)) { // 如果父级对象是原生 Group 类型
                    canvasObjects.push(parent) // 将父级对象添加到 canvasObjects 数组中
                }
                add(parent) // 添加父级对象及其子对象到 canvasObjects 数组中
            })
        } else {
            const parent = target.parent // 获取目标对象的父级对象
            if (!typeUtil.isBottomCanvas(parent)) { // 如果父级对象是原生 Group 类型
                canvasObjects.push(parent) // 将父级对象添加到 canvasObjects 数组中
            }
            add(parent) // 添加父级对象及其子对象到 canvasObjects 数组中
        }

        this.traversAllObjects(target, canvasObjects) // 遍历所有对象，执行特定操作
    }


    private clearLinesMeta() {
        this.verticalLines.length = this.horizontalLines.length = 0
    }

    private getObjDraggingObjCoords(activeObject: IUI): ACoordsAppendCenter {
        const coords = this.getCoords(activeObject) // 获取对象的四个点坐标
        const centerPoint = this.calcCenterPointByACoords(coords).subtract( // 计算中心点，减去对象的中心点坐标
            this.getCenterPointByTLBR(coords.tl,coords.br)
        )
        const newCoords = Keys(coords).map((key) => coords[key].subtract(centerPoint)) // 将对象的四个点坐标减去中心点坐标，得到新的坐标数组
        return {
            tl: newCoords[0], // 左上角坐标
            tr: newCoords[1], // 右上角坐标
            br: newCoords[2], // 右下角坐标
            bl: newCoords[3], // 左下角坐标
            c: this.getCenterPointByTLBR(coords.tl,coords.br), // 中心点坐标
        }
    }

    private getObjMaxWidthHeightByCoords(coords: ACoordsAppendCenter) {
        const { c, tl, tr } = coords // 解构出坐标对象的属性值
        const objHeight = Math.max(Math.abs(c.y - tl.y), Math.abs(c.y - tr.y)) * 2 // 计算对象的高度
        const objWidth = Math.max(Math.abs(c.x - tl.x), Math.abs(c.x - tr.x)) * 2 // 计算对象的宽度
        return { objHeight, objWidth } // 返回包含对象最大宽度和高度的对象
    }


    // 当对象被旋转时，需要忽略一些坐标，例如水平辅助线只取最上、下边的坐标（参考 figma）
    private omitCoords(objCoords: ACoordsAppendCenter, type: 'vertical' | 'horizontal') {
        const newCoords = objCoords
        const axis = type === 'vertical' ? 'x' : 'y'
        Keys(objCoords).forEach((key) => {
            if (objCoords[key][axis] < newCoords.tl[axis]) {
                newCoords[key] = objCoords[key]
            }
            if (objCoords[key][axis] > newCoords.tl[axis]) {
                newCoords[key] = objCoords[key]
            }
        })
        return newCoords
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

    private getCoords(obj: IUI) {
        // const [tl, tr, br, bl] = obj.getCoords(true)
        // return { tl, tr, br, bl }

        const boundsData = {x: obj.x, y: obj.y, width: obj.width, height: obj.height}
        const bounds = new Bounds(boundsData)
        const [tl, tr, br, bl] = bounds.getPoints()

        return {
            tl:new MPoint(tl.x,tl.y),
            tr:new MPoint(tl.x,tl.y),
            br:new MPoint(tl.x,tl.y),
            bl:new MPoint(tl.x,tl.y),
            // tl, tr, br, bl,
        };
    }

    /**
     * 获取由鼠标移动和拖动距离计算得出的对象中心点。
     * calcCenterPointByACoords 将返回对象实际位置的中心点。
     */
    private calcCenterPointByACoords(coords: any): MPoint {
        return new MPoint((coords.tl.x + coords.br.x) / 2, (coords.tl.y + coords.br.y) / 2)
    }

    /**
     * 获取中心点坐标(根据元素)
     * @param obj
     * @private
     */
    private getCenterPoint(obj:IUI):XY{
        const coords = this.getCoords(obj)
        var width = coords.br.x - coords.tl.x;
        var height = coords.br.y - coords.tl.y;
        var centerX = coords.tl.x + width / 2;
        var centerY = coords.tl.y + height / 2;
        return {x: centerX, y: centerY};
    }

    /**
     * 获取中心点坐标(根据坐标点)
     * @param topLeft
     * @param bottomRight
     * @private
     */
    private getCenterPointByTLBR(topLeft:any, bottomRight:any) {
        var width = bottomRight.x - topLeft.x;
        var height = bottomRight.y - topLeft.y;
        var centerX = topLeft.x + width / 2;
        var centerY = topLeft.y + height / 2;
        return {x: centerX, y: centerY};
    }

    /**
     * 遍历所有对象并添加注释
     * @param activeObject 当前活动对象
     * @param canvasObjects 画布上的所有对象
     */
    private traversAllObjects(activeObject: IUI, canvasObjects: IUI[]) {
        // 计算移动距离后的对象坐标
        const objCoordsByMovingDistance = this.getObjDraggingObjCoords(activeObject);

        // 存储水平方向的吸附点
        const snapXPoints: Set<number> = new Set();

        // 存储垂直方向的吸附点
        const snapYPoints: Set<number> = new Set();

        // 遍历画布上的所有对象
        for (let i = canvasObjects.length; i--;) {
            // 获取对象的坐标和中心点
            const objCoords = {
                ...this.getCoords(canvasObjects[i]),
                c: this.getCenterPoint(canvasObjects[i]),
            } as ACoordsAppendCenter;

            // 获取对象在移动距离后的最大宽度和高度
            const { objHeight, objWidth } = this.getObjMaxWidthHeightByCoords(objCoords);

            // 遍历活动对象的坐标移动距离
            Keys(objCoordsByMovingDistance).forEach((activeObjPoint) => {
                // 如果对象有旋转角度，则只计算水平方向
                const newCoords =
                    canvasObjects[i].rotation !== 0 ? this.omitCoords(objCoords, 'horizontal') : objCoords;

                // 计算水平线的坐标
                function calcHorizontalLineCoords(
                    objPoint: keyof ACoordsAppendCenter,
                    activeObjCoords: ACoordsAppendCenter,
                ) {
                    let x1: number, x2: number;
                    if (objPoint === 'c') {
                        x1 = Math.min(objCoords.c.x - objWidth / 2, activeObjCoords[activeObjPoint].x);
                        x2 = Math.max(objCoords.c.x + objWidth / 2, activeObjCoords[activeObjPoint].x);
                    } else {
                        x1 = Math.min(objCoords[objPoint].x, activeObjCoords[activeObjPoint].x);
                        x2 = Math.max(objCoords[objPoint].x, activeObjCoords[activeObjPoint].x);
                    }
                    return { x1, x2 };
                }

                // 遍历新坐标的每个点
                Keys(newCoords).forEach((objPoint) => {
                    // 如果对象在移动距离范围内，则添加水平线和吸附点
                    if (this.isInRange(objCoordsByMovingDistance[activeObjPoint].y, objCoords[objPoint].y)) {
                        const y = objCoords[objPoint].y;

                        const offset = objCoordsByMovingDistance[activeObjPoint].y - y;
                        snapYPoints.add(objCoordsByMovingDistance.c.y - offset);

                        const aCoords = this.getCoords(activeObject);
                        const { x1, x2 } = calcHorizontalLineCoords(objPoint, {
                            ...aCoords,
                            c: this.calcCenterPointByACoords(aCoords),
                        } as ACoordsAppendCenter);
                        this.horizontalLines.push({ y, x1, x2 });
                    }
                });
            });

            // 遍历活动对象的坐标移动距离
            Keys(objCoordsByMovingDistance).forEach((activeObjPoint) => {
                // 如果对象有旋转角度，则只计算垂直方向
                const newCoords =
                    canvasObjects[i].rotation !== 0 ? this.omitCoords(objCoords, 'vertical') : objCoords;

                // 计算垂直线的坐标
                function calcVerticalLineCoords(
                    objPoint: keyof ACoordsAppendCenter,
                    activeObjCoords: ACoordsAppendCenter,
                ) {
                    let y1: number, y2: number;
                    if (objPoint === 'c') {
                        y1 = Math.min(newCoords.c.y - objHeight / 2, activeObjCoords[activeObjPoint].y);
                        y2 = Math.max(newCoords.c.y + objHeight / 2, activeObjCoords[activeObjPoint].y);
                    } else {
                        y1 = Math.min(objCoords[objPoint].y, activeObjCoords[activeObjPoint].y);
                        y2 = Math.max(objCoords[objPoint].y, activeObjCoords[activeObjPoint].y);
                    }
                    return { y1, y2 };
                }

                // 遍历新坐标的每个点
                Keys(newCoords).forEach((objPoint) => {
                    // 如果对象在移动距离范围内，则添加垂直线和吸附点
                    if (this.isInRange(objCoordsByMovingDistance[activeObjPoint].x, objCoords[objPoint].x)) {
                        const x = objCoords[objPoint].x;

                        const offset = objCoordsByMovingDistance[activeObjPoint].x - x;
                        snapXPoints.add(objCoordsByMovingDistance.c.x - offset);

                        const aCoords = this.getCoords(activeObject);
                        const { y1, y2 } = calcVerticalLineCoords(objPoint, {
                            ...aCoords,
                            c: this.calcCenterPointByACoords(aCoords),
                        } as ACoordsAppendCenter);
                        this.verticalLines.push({ x, y1, y2 });
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
        console.log('snapXPoints',snapXPoints)
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

        // auto snap nearest object, record all the snap points, and then find the nearest one
        // activeObject.setXY(
        //     new Point(
        //         sortPoints(snapXPoints, draggingObjCoords.c.x),
        //         sortPoints(snapYPoints, draggingObjCoords.c.y),
        //     ),
        //     'center',
        //     'center',
        // )
        console.log('snapXPoints=',JSON.stringify(snapXPoints))
        console.log('snapYPoints=',JSON.stringify(snapYPoints))
        activeObject.x = sortPoints(snapXPoints, draggingObjCoords.c.x)
        activeObject.y = sortPoints(snapYPoints, draggingObjCoords.c.y)
        // activeObject.move(
        //     sortPoints(snapXPoints, draggingObjCoords.c.x),
        //     sortPoints(snapYPoints, draggingObjCoords.c.y),
        // )
    }

    private drawSign(x: number, y: number) {
        // const ctx = this.canvas.getTopContext()
        const ctx = this.canvasLeafer.canvas.context

        ctx.strokeStyle = this.aligningLineColor
        ctx.beginPath()

        const size = 3
        ctx.moveTo(x - size, y - size)
        ctx.lineTo(x + size, y + size)
        ctx.moveTo(x + size, y - size)
        ctx.lineTo(x - size, y + size)
        ctx.stroke()
    }
    private drawLine(x1: number, y1: number, x2: number, y2: number) {
        const ctx = this.canvasLeafer.canvas.context

        // const point1 = util.transformPoint(new Point(x1, y1), this.canvasLeafer.worldTransform)
        // const point2 = util.transformPoint(new Point(x2, y2), this.canvasLeafer.worldTransform)
        const point1 = new Point(x1, y1)
        const point2 = new Point(x2, y2)

        // use origin canvas api to draw guideline
        ctx.save()
        ctx.lineWidth = this.aligningLineWidth
        ctx.strokeStyle = this.aligningLineColor
        ctx.beginPath()

        ctx.moveTo(point1.x, point1.y)
        ctx.lineTo(point2.x, point2.y)

        ctx.stroke()

        this.drawSign(point1.x, point1.y)
        this.drawSign(point2.x, point2.y)

        ctx.restore()

        this.dirty = true
    }

    private drawVerticalLine(coords: VerticalLineCoords, movingCoords: ACoordsAppendCenter) {
        if (!Object.values(movingCoords).some((coord) => Math.abs(coord.x - coords.x) < 0.0001)) return
        this.drawLine(
            coords.x,
            Math.min(coords.y1, coords.y2),
            coords.x,
            Math.max(coords.y1, coords.y2),
        )
    }

    private drawHorizontalLine(coords: HorizontalLineCoords, movingCoords: ACoordsAppendCenter) {
        if (!Object.values(movingCoords).some((coord) => Math.abs(coord.y - coords.y) < 0.0001)) return
        this.drawLine(
            Math.min(coords.x1, coords.x2),
            coords.y,
            Math.max(coords.x1, coords.x2),
            coords.y,
        )
    }

    private drawGuideLines(e: RenderEvent) {
        if ((!this.verticalLines.length && !this.horizontalLines.length) || !this.activeObj) {
            return
        }
        const movingCoords = this.getObjDraggingObjCoords(this.activeObj)

        for (let i = this.verticalLines.length; i--; ) {
            this.drawVerticalLine(this.verticalLines[i], movingCoords)
        }
        for (let i = this.horizontalLines.length; i--; ) {
            this.drawHorizontalLine(this.horizontalLines[i], movingCoords)
        }
        // this.canvas.calcOffset()
    }

    private clearGuideline() {
        if (!this.dirty) return
        this.dirty = false
        // this.canvasLeafer.destroy()
        // this.canvas.clearContext(this.canvas.getTopContext())
    }

    public dispose(): void {
        super.dispose()
        // this.canvas.off(this.canvasEvents)
    }
}
