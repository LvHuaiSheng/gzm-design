import {Frame, Group, Leafer} from "leafer-ui";
import {IUI} from "@leafer-ui/interface";
import {BOTTOM_CANVAS_NAME} from "@/views/Editor/utils/constants";

/**
 * 获取图层默认名称
 * @param leafer
 */
export function getDefaultName(leafer: Frame | Leafer) {
    return `图层${leafer.children.length+1}`
}

/**
 * 获取上级
 * @param layer
 */
export function getParentLayer(layer:IUI){
    return typeUtil.isBottomCanvas(layer)?layer:layer.parent
}

/**
 * 类型工具
 */
export const typeUtil = {
    isActiveSelection:(thing:any)=>{
        return thing && thing.children && thing.children.length>0
    },
    /**
     * 是否是最底层应用层
     * @param layer
     */
    isBottomLeafer:(layer:IUI)=>{
        return layer.innerId === 1 && layer.tag === 'Leafer'
    },
    /**
     * 是否是最底层画布层
     * @param layer
     */
    isBottomCanvas:(layer:IUI)=>{
        return layer.name === BOTTOM_CANVAS_NAME
    },
    /**
     * 是否是虚拟元素
     * @param layer
     */
    isVirtualElement:(layer:IUI)=>{
        return !isDefined(layer.app)
    },

    /**
     * 是否虚拟元素活底层画布
     * @param layer
     */
    isVirtualOrBottom:(layer:IUI)=>{
        return typeUtil.isBottomCanvas(layer) || typeUtil.isVirtualElement(layer)
    },

    /**
     * 是否集合（含组）
     * @param thing
     */
    isCollection: (thing?: unknown): thing is Group => {
        // @ts-ignore
        return thing && Array.isArray((thing as Group).children) && thing.tag !=='Pen'
    },

    /**
     * 判断是否为原生组（非虚拟组）
     * @param thing
     * @returns NativeGroup | Group | Board
     */
    isNativeGroup: (thing?: any): thing is Group => {
        return thing.tag === 'Group' && !typeUtil.isVirtualElement(thing)
    },
    /**
     * 是否渐变
     * @param thing
     */
    isGradient: (thing: unknown)=> {
        // @ts-ignore
        return thing && (thing.type==='linear' || thing.type==='radial')
    },
    /**
     * 是否图案填充
     * @param thing
     */
    isPattern: (thing: unknown)=> {
        // @ts-ignore
        return thing && thing.type==='image'
    },
}

/**
 * 查找子元素中最小的x坐标和y坐标（一般用于创建组时使用）
 * @param array
 */
export function findChildrenMinXY(array: any[]): { minX: number, minY: number } {
    let minX = array.reduce((min, p) => p.x < min ? p.x : min, array[0].x);
    let minY = array.reduce((min, p) => p.y < min ? p.y : min, array[0].y);

    return { minX, minY };
}


/**
 * 水平翻转
 * @param obj
 */
export function flipHorizontally(obj:any){
    obj.scaleX = -obj.scaleX;
}

/**
 * 垂直翻转
 * @param obj
 */
export function flipVertically(obj: any){
    obj.scaleY = -obj.scaleY;
}
