import { MLeaferCanvas, IMLeaferCanvas } from '@/views/Editor/core/canvas/mLeaferCanvas'

import { Disposable } from '@/views/Editor/utils/lifecycle'
import {IUI} from "@leafer-ui/interface";
import {Group, MoveEvent, Point, RenderEvent, DragEvent,PointerEvent} from "leafer-ui";
import {typeUtil} from "@/views/Editor/utils/utils";

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
    innerId: T
    value: any
}[]

type ACoordsAppendCenter = NonNullable<IUI['aCoords']> & {
    c: Point
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
    private activeObj: any | undefined
    private ignoreObjTypes: IgnoreObjTypes = []
    private pickObjTypes: IgnoreObjTypes = []
    private dirty = false

    constructor(@IMLeaferCanvas private readonly canvas: MLeaferCanvas) {
        super()

        const mouseUp = () => {
            if (this.horizontalLines.length || this.verticalLines.length) {
                this.clearGuideline()
                this.clearLinesMeta()
            }
        }
        this.canvas.app.on(RenderEvent.BEFORE,arg => {
            this.clearGuideline()
        })
        this.canvas.app.on(RenderEvent.AFTER,arg => {
            this.drawGuideLines(arg)
        })
        this.canvas.app.on(DragEvent.DRAG,arg => {
            this.objectMoving(arg)
        })
        this.canvas.app.on(MoveEvent.UP,arg => {
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

    private objectMoving({ target }) {
        this.clearLinesMeta()

        const transform = this.canvas.app.worldTransform
        if (!transform) return

        this.activeObj = target

        const activeObjects = this.canvas.getActiveObjects()

        const canvasObjects: IUI[] = []
        const add = (group:Group) => {
            console.log('group=',group)
            const objects = group.children?.filter((obj) => {
                if (this.ignoreObjTypes.length) {
                    return !this.ignoreObjTypes.some((item) => obj.innerId === item.value)
                }
                if (this.pickObjTypes.length) {
                    return this.pickObjTypes.some((item) => obj.innerId === item.value)
                }
                if (
                    // 排除 自己 和 激活选区内的元素
                    activeObjects.includes(obj)
                ) {
                    return false
                }
                // 元素为组，把组内元素加入，同时排除组本身
                // if (util.isActiveSelection(obj)) {
                //   add(obj)
                //   return false
                // }
                // 元素为组，把组内元素加入，同时排除组本身
                if (typeUtil.isCollection(obj) && target.group && obj === target.group) {
                    add(obj)
                    return false
                }
                return true
            })
            canvasObjects.push(...objects)
        }

        // if (util.isActiveSelection(target)) {
        //   const needAddParent = new Set<any>()
        //   target.forEachObject((obj) => {
        //     const parent = obj.parent
        //     needAddParent.add(parent)
        //   })
        //   needAddParent.forEach((parent) => {
        //     if (typeUtil.isCollection(parent)) {
        //       canvasObjects.push(parent)
        //     }
        //     add(parent)
        //   })
        // } else {
        const parent = target.parent as Group
        if (typeUtil.isCollection(parent)) {
            canvasObjects.push(parent)
        }
        add(parent)
        // }

        this.traversAllObjects(target, canvasObjects)
    }

    private clearLinesMeta() {
        this.verticalLines.length = this.horizontalLines.length = 0
    }

    private getObjDraggingObjCoords(obj: IUI): ACoordsAppendCenter {
        // 构建包含新坐标信息的对象并返回
        let tl = obj.getWorldPoint({x: obj.boxBounds.x, y:obj.boxBounds.y});
        let tr = obj.getWorldPoint({x: obj.boxBounds.x + obj.boxBounds.width, y:obj.boxBounds.y});
        let br = obj.getWorldPoint({x: obj.boxBounds.x + obj.boxBounds.width, y:obj.boxBounds.y + obj.boxBounds.height});
        let bl = obj.getWorldPoint({x: obj.boxBounds.x, y:obj.boxBounds.y+ obj.boxBounds.height });

        return {
            tl,tr,br,bl,
            // c: activeObject.getCenterPoint(),
            c:  tl,
        };
    }

    private getObjMaxWidthHeightByCoords(coords: ACoordsAppendCenter) {
        const { c, tl, tr } = coords
        const objHeight = Math.max(Math.abs(c.y - tl.y), Math.abs(c.y - tr.y)) * 2
        const objWidth = Math.max(Math.abs(c.x - tl.x), Math.abs(c.x - tr.x)) * 2
        return { objHeight, objWidth }
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
        let bounds = obj.boxBounds;
        // const [tl, tr, br, bl] = obj.getCoords(true)
        // return { tl, tr, br, bl }
        let tl = obj.getWorldPoint({x: obj.boxBounds.x, y:obj.boxBounds.y});
        let tr = obj.getWorldPoint({x: obj.boxBounds.x + obj.boxBounds.width, y:obj.boxBounds.y});
        let br = obj.getWorldPoint({x: obj.boxBounds.x + obj.boxBounds.width, y:obj.boxBounds.y + obj.boxBounds.height});
        let bl = obj.getWorldPoint({x: obj.boxBounds.x, y:obj.boxBounds.y+ obj.boxBounds.height });

        // 返回包含物体四个角点坐标的对象
        return {
            tl,
            tr,
            br,
            bl,
            c:bounds
        };
    }

    /**
     * fabric.Object.getCenterPoint will return the center point of the object calc by mouse moving & dragging distance.
     * calcCenterPointByACoords will return real center point of the object position.
     */
    private calcCenterPointByACoords(coords: NonNullable<IUI['aCoords']>): Point {
        return new Point((coords.tl.x + coords.br.x) / 2, (coords.tl.y + coords.br.y) / 2)
    }

    private traversAllObjects(activeObject: IUI, canvasObjects: IUI[]) {
        // const objCoordsByMovingDistance = this.getObjDraggingObjCoords(activeObject)

        const objCoordsByMovingDistance = this.getCoords(activeObject)
        console.log('objCoordsByMovingDistance=',objCoordsByMovingDistance)
        const snapXPoints: Set<number> = new Set()
        const snapYPoints: Set<number> = new Set()
        // activeObject.worldBoxBounds
        for (let i = canvasObjects.length; i--; ) {
            const objCoords = {
                ...this.getCoords(canvasObjects[i]),
                c: canvasObjects[i].worldBoxBounds,
            } as ACoordsAppendCenter
            const { objHeight, objWidth } = this.getObjMaxWidthHeightByCoords(objCoords)
            Keys(objCoordsByMovingDistance).forEach((activeObjPoint) => {
                const newCoords =
                    canvasObjects[i].angle !== 0 ? this.omitCoords(objCoords, 'horizontal') : objCoords

                function calcHorizontalLineCoords(
                    objPoint: keyof ACoordsAppendCenter,
                    activeObjCoords: ACoordsAppendCenter,
                ) {
                    let x1: number, x2: number
                    if (objPoint === 'c') {
                        x1 = Math.min(objCoords.c.x - objWidth / 2, activeObjCoords[activeObjPoint].x)
                        x2 = Math.max(objCoords.c.x + objWidth / 2, activeObjCoords[activeObjPoint].x)
                    } else {
                        x1 = Math.min(objCoords[objPoint].x, activeObjCoords[activeObjPoint].x)
                        x2 = Math.max(objCoords[objPoint].x, activeObjCoords[activeObjPoint].x)
                    }
                    return { x1, x2 }
                }
                console.log('newCoords=',newCoords)
                console.log('objCoordsByMovingDistance=',objCoordsByMovingDistance)
                Keys(newCoords).forEach((objPoint) => {
                    console.log('activeObjPoint=',activeObjPoint)
                    if (this.isInRange(objCoordsByMovingDistance[activeObjPoint].y, objCoords[objPoint].y)) {
                        const y = objCoords[objPoint].y

                        const offset = objCoordsByMovingDistance[activeObjPoint].y - y
                        snapYPoints.add(objCoordsByMovingDistance.c.y - offset)

                        const aCoords = this.getCoords(activeObject)
                        const { x1, x2 } = calcHorizontalLineCoords(objPoint, {
                            ...aCoords,
                            c: this.calcCenterPointByACoords(aCoords),
                        } as ACoordsAppendCenter)
                        this.horizontalLines.push({ y, x1, x2 })
                    }
                })
            })

            Keys(objCoordsByMovingDistance).forEach((activeObjPoint) => {
                const newCoords =
                    canvasObjects[i].angle !== 0 ? this.omitCoords(objCoords, 'vertical') : objCoords

                function calcVerticalLineCoords(
                    objPoint: keyof ACoordsAppendCenter,
                    activeObjCoords: ACoordsAppendCenter,
                ) {
                    let y1: number, y2: number
                    if (objPoint === 'c') {
                        y1 = Math.min(newCoords.c.y - objHeight / 2, activeObjCoords[activeObjPoint].y)
                        y2 = Math.max(newCoords.c.y + objHeight / 2, activeObjCoords[activeObjPoint].y)
                    } else {
                        y1 = Math.min(objCoords[objPoint].y, activeObjCoords[activeObjPoint].y)
                        y2 = Math.max(objCoords[objPoint].y, activeObjCoords[activeObjPoint].y)
                    }
                    return { y1, y2 }
                }

                Keys(newCoords).forEach((objPoint) => {
                    if (this.isInRange(objCoordsByMovingDistance[activeObjPoint].x, objCoords[objPoint].x)) {
                        const x = objCoords[objPoint].x

                        const offset = objCoordsByMovingDistance[activeObjPoint].x - x
                        snapXPoints.add(objCoordsByMovingDistance.c.x - offset)

                        const aCoords = this.getCoords(activeObject)
                        const { y1, y2 } = calcVerticalLineCoords(objPoint, {
                            ...aCoords,
                            c: this.calcCenterPointByACoords(aCoords),
                        } as ACoordsAppendCenter)
                        this.verticalLines.push({ x, y1, y2 })
                    }
                })
            })
        }

        this.snap({
            activeObject,
            draggingObjCoords: objCoordsByMovingDistance,
            snapXPoints,
            snapYPoints,
        })
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

        // auto snap nearest object, record all the snap points, and then find the nearest one
        activeObject.x = draggingObjCoords.c.x
        activeObject.y = draggingObjCoords.c.y
        // activeObject.setXY(
        //   new Point(
        //     sortPoints(snapXPoints, draggingObjCoords.c.x),
        //     sortPoints(snapYPoints, draggingObjCoords.c.y),
        //   ),
        //   'center',
        //   'center',
        // )
    }

    private drawSign(x: number, y: number) {
        // const ctx = this.canvas.getTopContext()
        const ctx = this.canvas.app.canvas.context

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
        // const ctx = this.canvas.getTopContext()
        const ctx = this.canvas.app.canvas.context
        const center1 = {x: x1, y: y1}
        const point1 = this.canvas.app.getInnerPoint(center1)


        const center2 = {x: x2, y: y2}
        const point2 = this.canvas.app.getInnerPoint(center2)
        // const point1 = util.transformPoint(new Point(x1, y1), this.canvas.app.worldTransform)
        // const point2 = util.transformPoint(new Point(x2, y2), this.canvas.app.worldTransform)

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

    private drawGuideLines(e) {
        if ((!this.verticalLines.length && !this.horizontalLines.length) || !this.activeObj) {
            return
        }

        // const movingCoords = this.getObjDraggingObjCoords(this.activeObj)
        const movingCoords = this.getCoords(this.activeObj)
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
        // this.canvas.clearContext(this.canvas.getTopContext())
    }

    public dispose(): void {
        super.dispose()
        // this.canvas.off(this.canvasEvents)
    }
}
