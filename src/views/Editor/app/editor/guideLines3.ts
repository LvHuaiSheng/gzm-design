import {IMLeaferCanvas, MLeaferCanvas} from '@/views/Editor/core/canvas/mLeaferCanvas'

import {Disposable} from '@/views/Editor/utils/lifecycle'
import {DragEvent, Point, PointerEvent, RenderEvent, UI} from "leafer-ui";
import {ILeaf, ILeafer, IUI} from "@leafer-ui/interface";
import {typeUtil} from "@/views/Editor/utils/utils";
import {Bounds, LeafHelper} from "@leafer-ui/core";

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
    innerId: number
    value: any
}[]

type ACoordsAppendCenter = {
    tr: any
    tl: any
    br: any
    bl: any
    c: any
}
//
// type ACoordsAppendCenter = NonNullable<FabricObject['aCoords']> & {
//     c: Point
// }

const Keys = <T extends object>(obj: T): (keyof T)[] => {
    return Object.keys(obj) as (keyof T)[]
}
type XY = {
    x: number;
    y: number;
}
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
export class GuideLines extends Disposable {

    private aligningLineMargin = 10
    private aligningLineWidth = 1
    private aligningLineColor = '#165DE1'

    private verticalLines: VerticalLineCoords[] = []
    private horizontalLines: HorizontalLineCoords[] = []
    private activeObj: IUI | undefined | ILeaf
    private ignoreObjTypes: IgnoreObjTypes = []
    private pickObjTypes: IgnoreObjTypes = []
    private dirty = false
    private canvasLeafer: ILeafer
    private moveX: number = 0
    private moveY: number = 0
    private moveing: boolean = false

    constructor(@IMLeaferCanvas private readonly canvas: MLeaferCanvas) {
        super()
        this.canvasLeafer = canvas.app.addLeafer()
        // 设置画布的矩阵信息（默认会带上屏幕像素比），用于解决屏幕像素比的问题
        this.canvasLeafer.canvas.setWorld({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })


        this.canvas.app.tree.on(RenderEvent.BEFORE, this.clearGuideline.bind(this))
        this.canvas.app.tree.on(RenderEvent.END, arg => {
            this.drawGuideLines(arg)
        })

        // this.canvas.app.editor.on(DragEvent.DRAG, this.objectMoving.bind(this))
        this.canvas.app.editor.on(DragEvent.DRAG, (arg: DragEvent) => {
            if (arg.moveX <= this.aligningLineMargin + 1){
                this.moveX += arg.moveX
            }else {
                this.moveX = 0
            }
            if (arg.moveY <= this.aligningLineMargin + 1){
                this.moveY += arg.moveY
            }else {
                this.moveY = 0
            }
            // if (!this.moveing){
                if (this.canvas.app.editor.list.length>1){
                    this.objectMoving(this.canvas.app.editor.element)
                }else {
                    this.objectMoving( this.canvas.activeObject.value)
                }
            //     this.moveing = true
            // }else {
            //     setTimeout(()=>{
            //         this.moveing = false
            //     },1000)
            // }

        })
        // this.canvas.app.editor.on(DragEvent.START, (arg: DragEvent) => {
        //     // 脱离吸附，将坐标增加或减少10
        // })
        this.canvas.app.editor.on(DragEvent.END, (arg: DragEvent) => {
            // 手动触发RenderEvent.END事件，来清除吸附线
            this.canvas.app.tree.emit(RenderEvent.END, { renderBounds: this.canvas.app.tree.canvas.bounds })
            this.moveX = 0
            this.moveY = 0
            mouseUp()
        })

        const mouseUp = () => {
            if (this.horizontalLines.length || this.verticalLines.length) {
                this.clearGuideline()
                this.clearLinesMeta()
            }
        }
    }

    private objectMoving(target: IUI) {
        console.log('objectMoving',new Date().getTime())
        this.clearLinesMeta()

        this.activeObj = target
        const activeObjects = this.canvas.getActiveObjects()

        const canvasObjects: ILeaf[] = []
        const add = (group: IUI|ILeaf) => {
            const objects = group.children.filter((obj) => {
                if (this.ignoreObjTypes.length) {
                    return !this.ignoreObjTypes.some((item) => obj.innerId === item.innerId)
                }
                if (this.pickObjTypes.length) {
                    return this.pickObjTypes.some((item) => obj.innerId === item.innerId)
                }
                if (
                    // 排除 自己 和 激活选区内的元素
                    // activeObjects.includes(obj)
                    this.activeObj.innerId == obj.innerId
                ) {
                    return false
                }

                // 元素为组，把组内元素加入，同时排除组本身
                if (typeUtil.isActiveSelection(obj)) {
                    add(obj)
                    return false
                }
                // 元素为组，把组内元素加入，同时排除组本身
                // if (typeUtil.) {
                //     add(obj)
                //     return false
                // }
                return true
            })
            canvasObjects.push(...objects)
        }
        if (typeUtil.isActiveSelection(target)) { // 如果目标对象是激活选区
            const needAddParent = new Set<ILeaf>() // 创建一个存储需要添加的父级对象的 Set
            target.children.forEach(obj => { // 遍历激活选区内的每个对象
                const parent = obj.parent // 获取对象的父级对象
                needAddParent.add(parent) // 将父级对象添加到 needAddParent Set 中
            })

            needAddParent.forEach((parent:ILeaf) => {
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

        // if (util.isActiveSelection(target)) {
        //     const needAddParent = new Set<Group | Canvas | StaticCanvas>()
        //     target.forEachObject((obj) => {
        //         const parent = obj.getParent()
        //         needAddParent.add(parent)
        //     })
        //     needAddParent.forEach((parent) => {
        //         if (util.isNativeGroup(parent)) {
        //             canvasObjects.push(parent)
        //         }
        //         add(parent)
        //     })
        // } else {
        //     const parent = target.getParent() as Group
        //     if (util.isNativeGroup(parent)) {
        //         canvasObjects.push(parent)
        //     }
        //     add(parent)
        // }
        //
        // this.traversAllObjects(target, canvasObjects)
    }

    private clearLinesMeta() {
        this.verticalLines.length = this.horizontalLines.length = 0
    }

    private getObjDraggingObjCoords(activeObject: IUI|ILeaf): ACoordsAppendCenter {
        const coords = this.getCoords(activeObject,true)
        const centerPoint = this.calcCenterPointByACoords(coords).subtract(
            this.getCenterPoint(activeObject,true),
        )
        const newCoords = Keys(coords).map((key) => coords[key].subtract(centerPoint))
        return {
            tl: newCoords[0],
            tr: newCoords[1],
            br: newCoords[2],
            bl: newCoords[3],
            c: this.getCenterPoint(activeObject,true),
        }
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

    private getCoords(obj: IUI|ILeaf,moveObj:boolean = false) {
        const [tl, tr, br, bl] = obj.getLayoutPoints('box',obj.leafer)
        if (moveObj){
            tl.x += this.moveX
            tl.y += this.moveY
            tr.x += this.moveX
            tr.y += this.moveY
            br.x += this.moveX
            br.y += this.moveY
            bl.x += this.moveX
            bl.y += this.moveY
        }
        // obj.getLayoutBounds("box",obj.parent)
        const tlW = this.canvasLeafer.getWorldPoint( new Point(tl.x,tl.y))
        const trW = this.canvasLeafer.getWorldPoint( new Point(tr.x,tr.y))
        const brW = this.canvasLeafer.getWorldPoint( new Point(br.x,br.y))
        const blW = this.canvasLeafer.getWorldPoint( new Point(bl.x,bl.y))
        return {
            tl:new MPoint(tlW.x,tlW.y),
            tr:new MPoint(trW.x,trW.y),
            br:new MPoint(brW.x,brW.y),
            bl:new MPoint(blW.x,blW.y),
            // tl, tr, br, bl,
        };
    }

    /**
     * fabric.Object.getCenterPoint will return the center point of the object calc by mouse moving & dragging distance.
     * calcCenterPointByACoords will return real center point of the object position.
     */
    private calcCenterPointByACoords(coords: any): MPoint {
        return new MPoint((coords.tl.x + coords.br.x) / 2, (coords.tl.y + coords.br.y) / 2)
    }

    private traversAllObjects(activeObject: IUI|ILeaf, canvasObjects: ILeaf[]) {
        const objCoordsByMovingDistance = this.getObjDraggingObjCoords(activeObject)
        const snapXPoints: Set<number> = new Set()
        const snapYPoints: Set<number> = new Set()

        for (let i = canvasObjects.length; i--; ) {
            const objCoords = {
                ...this.getCoords(canvasObjects[i]),
                c: this.getCenterPoint(canvasObjects[i]),
            } as ACoordsAppendCenter
            const { objHeight, objWidth } = this.getObjMaxWidthHeightByCoords(objCoords)
            Keys(objCoordsByMovingDistance).forEach((activeObjPoint) => {
                const newCoords =
                    canvasObjects[i].rotation !== 0 ? this.omitCoords(objCoords, 'horizontal') : objCoords

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

                Keys(newCoords).forEach((objPoint) => {
                    if (this.isInRange(objCoordsByMovingDistance[activeObjPoint].y, objCoords[objPoint].y)) {
                        const y = objCoords[objPoint].y
                        const offset = objCoordsByMovingDistance[activeObjPoint].y - y

                        snapYPoints.add(objCoordsByMovingDistance.tl.y - offset)


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
                    canvasObjects[i].rotation !== 0 ? this.omitCoords(objCoords, 'vertical') : objCoords

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
                    console.log('objCoordsByMovingDistance=',objCoordsByMovingDistance)
                    console.log('objCoords=',objCoords)
                    if (this.isInRange(objCoordsByMovingDistance[activeObjPoint].x, objCoords[objPoint].x)) {
                        const x = objCoords[objPoint].x
                        const offset = objCoordsByMovingDistance[activeObjPoint].x- x
                        // TODO 这里有个问题，x一直会被恢复到移动前的问题
                        snapXPoints.add(objCoordsByMovingDistance.tl.x - offset)

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
     * 获取中心点坐标(根据元素)
     * @param obj
     * @private
     */
    private getCenterPoint(obj:IUI|ILeaf,moveObj:boolean = false):XY{
        const coords = this.getCoords(obj,moveObj)
        var width = coords.br.x - coords.tl.x;
        var height = coords.br.y - coords.tl.y;
        var centerX = coords.tl.x + width / 2;
        var centerY = coords.tl.y + height / 2;
        return {x: centerX, y: centerY};
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
        activeObject: IUI|ILeaf
        /** 活动对象的坐标 */
        draggingObjCoords: ACoordsAppendCenter
        /** 横向吸附点列表 */
        snapXPoints: Set<number>
        /** 纵向吸附点列表 */
        snapYPoints: Set<number>
    }) {
        if (snapXPoints.size === 0 && snapYPoints.size === 0){
            return
        }

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
        const point = this.canvasLeafer.getWorldPoint(new Point(activeObject.x,activeObject.y),activeObject.parent)
        const x = sortPoints(snapXPoints, draggingObjCoords.tl.x) - point.x
        const y = sortPoints(snapYPoints, draggingObjCoords.tl.y) - point.y

        // const point2 = activeObject.getBounds('box',activeObject.parent)
        this.canvas.app.editor.move(x, y)
        this.moveX = 0
        this.moveY = 0


        // const point = this.canvasLeafer.getWorldPoint(new Point(activeObject.x,activeObject.y))
        // const coords = this.getCenterPoint(activeObject)
        // let x = sortPoints(snapXPoints, draggingObjCoords.c.x)
        // let y = sortPoints(snapYPoints, draggingObjCoords.c.y)
        // x = x - (activeObject.width / 2)
        // y = y - (activeObject.height / 2)
        // activeObject.x = x
        // activeObject.y = y

        // x = x - (activeObject.width / 2) - point.x
        // y = y - (activeObject.height / 2) - point.y
    }

    private drawSign(x: number, y: number) {
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
        // const point1 = util.transformPoint(new Point(x1, y1), this.canvas.viewportTransform)
        // const point2 = util.transformPoint(new Point(x2, y2), this.canvas.viewportTransform)
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
        if (!e || (!this.verticalLines.length && !this.horizontalLines.length) || !this.activeObj) {
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
        this.canvasLeafer.canvas.clear()
        // this.canvas.clearContext(this.canvas.getTopContext())
    }

    public dispose(): void {
        super.dispose()
    }
}
