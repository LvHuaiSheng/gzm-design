/**
 * 分组
 */
import {Group} from "leafer-ui";
import {getCommonOptions, LayerInfo} from "./common";

/**
 * 转换Group元素
 * @param layer 图层信息
 * @param options 额外属性
 */
export function parseGroup(layer: LayerInfo, options = {}) {

    //  打组
    const group = new Group({
        name: layer.name,
        zIndex: layer.zIndex,
        draggable: true,
        ...getCommonOptions(layer)
    })
    if (layer.canvas) {
        group.width = layer.canvas.width
        group.height = layer.canvas.height
    }
    return group
}

export const groupUtil = {}
