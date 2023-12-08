import {Layer, readPsd} from "ag-psd";
import commonParser from './parser/common'
import textParser from './parser/text'
import imageParser from './parser/image'
import maskParser from './parser/mask'
import {IUI} from "@leafer-ui/interface";

interface LayerInfo extends Layer {
    zIndex?:number
}
/**
 * 解析psd文件
 * @param file
 * @param onProcess
 */
export async function parsePsdFile(file: File, onProcess: Function) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const arrayBuffer = reader.result;
            // @ts-ignore
            const psd = readPsd(arrayBuffer);
            // console.log('psd=', psd)
            // 更新图层列表
            const layers = psd.children;
            // console.log('layers=', layers)
            resolve({psd, layers})
        };
        reader.readAsArrayBuffer(file);
    })
}

/**
 * 解析每个图层
 * @param layers
 * @param parent 上级
 */
const parseLayers = async (layers : Layer[], parent: IUI) => {
    layers.reverse()
    let group = []
    for (let i = 0; i < layers.length; i++) {
        let layer = <LayerInfo> layers[i]
        console.log(layer.name + ':', layer)
        // 层级：数值越大越靠前，与ps的层级相反
        let index = layers.length - i
        layer.zIndex = index
        if (layer.children) {
            // 组
            const parent2 = addGroup(layer, parent)
            await parseLayers(layer.children, parent2)
            continue
        }

        if (layer.clipping) {
            // 剪切蒙版
            group.push(layer)
        } else {
            if (group.length > 0) {
                group.push(layer)
                // 打组，创建蒙版数据
                await maskParser.addMask(index, group, parent)
                group = []
                // addObj(index,layer)
            } else {
                addObj(layer, parent)
            }
        }
    }
}
