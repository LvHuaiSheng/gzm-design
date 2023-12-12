/**
 * 图片
 */
import Image2 from "@/views/Editor/core/shapes/Image2";
import {getCommonOptions, LayerInfo} from "./common";
import {IBlendMode} from "@leafer-ui/interface";

/**
 * 转换Image元素
 * @param layer 图层信息
 * @param options 额外属性
 */
export function parseImage(layer: LayerInfo, options = {}) {

    const image = new Image2({
        ...getCommonOptions(layer),
        ...options,
        // 混合模式
        blendMode: <IBlendMode>layer.blendMode,
    })
    if (layer.canvas) {
        const url = layer.canvas.toDataURL("image/png")
        image.url = url
        image.fillOpacity = layer.fillOpacity
        image.width = layer.canvas.width
        image.height = layer.canvas.height
    }
    return image
}

export const imageUtil = {}
