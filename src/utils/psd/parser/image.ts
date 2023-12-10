/**
 * 图片
 */
import {Layer} from "ag-psd";
import {toRGBColorStr} from "@/utils/color";
import {Image} from "leafer-ui";
import {getCommonOptions,LayerInfo} from "./common";

/**
 * 转换Image元素
 * @param layer 图层信息
 * @param options 额外属性
 */
export function parseImage(layer: LayerInfo, options = {}) {

    const image = new Image({
        ...getCommonOptions(layer),
        ...options,
    })
    if (layer.canvas) {
        const url = layer.canvas.toDataURL("image/png")
        image.url = url
        image.width = layer.canvas.width
        image.height = layer.canvas.height
    }
    return image
}

export const imageUtil = {}
