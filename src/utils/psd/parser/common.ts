import {Layer} from "ag-psd";

type CommonFields = {
    editable: boolean,
    visible: boolean,
    x: number | undefined,
    y: number | undefined,
    opacity: number | undefined,
    name?: string,
    title?: string,
    zIndex?: number,
}

export interface LayerInfo extends Layer {
    zIndex?:number
}

/**
 * 获取公共属性
 */
export function getCommonOptions(layer: LayerInfo): CommonFields {
    return {
        editable: true,
        title: layer.name,
        name: layer.name,
        visible: !layer.hidden,
        x: layer.left,
        y: layer.top,
        opacity: layer.opacity,
        zIndex:layer.zIndex
    }
}
