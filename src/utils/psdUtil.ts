/**
 * 参考文档：https://my.oschina.net/u/5359019/blog/8817638
 */
import {Layer, readPsd} from 'ag-psd';
import {toRGBAColor, toRGBAColorStr, toRGBColorStr} from "@/utils/color";

import configMeasurements, {allMeasures} from 'convert-units';
import {Message} from "@arco-design/web-vue";
import {LayerInfo} from "@/utils/psd/parser/common";
// import allMeasures from 'convert-units/definitions/all';
const convert = configMeasurements(allMeasures);

export interface CommonFields {
    draggable: boolean,
    editable: boolean,
    visible: boolean,
    x: number | undefined,
    y: number | undefined,
    opacity: number | undefined,
    name?: string,
    title?: string,
}

export async function parsePsdFile(file: File, onProcess: Function) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const arrayBuffer = reader.result;
            try {
                // @ts-ignore
                const psd = readPsd(arrayBuffer);
                // console.log('psd=', psd)
                // 更新图层列表
                const layers = psd.children;
                // console.log('layers=', layers)
                resolve({psd, layers})
            } catch (e) {
                console.error(e)
                // @ts-ignore
                if (e.message.indexOf('Color mode not supported: CMYK') > -1) {
                    reject({message: '暂不支持CMYK色彩模式的文件，请先使用PS转换为RGB'})
                } else {
                    // @ts-ignore
                    reject({message: e.message})
                }
            }
        };
        reader.readAsArrayBuffer(file);
    })

}

export async function parsePsdFile2(file: File, onProcess: Function) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async () => {
            const arrayBuffer = reader.result;
            // @ts-ignore
            const psd = Psd.parse(arrayBuffer);
            console.log('psd2=', psd)

            // // 更新图层列表
            // const layers = psd.children;
            // console.log('layers=', layers)
            resolve({psd})
        };
        reader.readAsArrayBuffer(file);
    })

}

/**
 * 获取公共字
 */
export function getCommonFields(layer: LayerInfo): any {
    return {
        editable: true,
        name: layer.name,
        visible: !layer.hidden,
        x: layer.left,
        y: layer.top,
        zIndex:layer.zIndex,
        opacity: layer.opacity,
        blendMode: layer.blendMode,
    }
}

/**
 * PSD文字属性解析
 */
export const psdText = {
    getWidth(layer: Layer) {
        // 这里+3也许是因为边框占据了3个像素导致文字换行？
        return layer.canvas.width + 3
    },
    getHeight(layer: Layer) {
        return layer.canvas.height
    },
    /**
     * 获取文字大小
     * @param layer
     */
    getFontSize: (layer: Layer) => {
        if (layer.text) {
            return Number(layer.text.style?.fontSize)
        } else {
            // 默认大小
            return 10
        }
    },
    /**
     * 获取文字字体
     * @param layer
     */
    getFontFamily: (layer: Layer) => {
        let fontFamily = layer.text?.style?.font?.name
        // TODO 本地字体不存在时，加载网络字体文件
        return fontFamily
    },
    /**
     * 获取填充颜色
     * @param layer
     */
    getFill: (layer: Layer) => {
        if ((layer.text?.style?.fillFlag || layer.text?.style?.fillFlag === undefined) && layer.text?.style?.fillColor) {
            return toRGBColorStr(layer.text?.style?.fillColor)
        } else {
            // 默认黑色
            return 'rgb(0,0,0)'
        }
    },
    /**
     * 获取描边
     * @param layer
     */
    getStroke: (layer: Layer) => {
        if (layer.text?.style?.fillFlag) {
            return toRGBColorStr(layer.text?.style?.fillColor)
        }
    },
    /**
     * 获取文字间距
     * @param layer
     */
    getLetterSpacing: (style: any) => {
        /**
         * 在PSD文件中，Tracking（字间距）的单位是千分之一（em）。如果你想将Tracking的单位转换为像素（px），可以使用以下公式：
         * 像素 = 字号大小（pt） * Tracking值 * 0.001
         * 其中，字号大小是以磅（pt）为单位的。通过使用这个公式，你可以将Tracking的单位从千分之一（em）转换为像素（px）值。
         */
        // return style.FontSize * style.Tracking * 0.001
        // let pxUnit =  style.FontSize * style.Tracking * 0.001
        // let px = convert(style.FontSize).from('pt').to('px').valueOf();
        // let px = style.FontSize * (96 / 72)
        // return px * style.Tracking / 1000
        // return style.Tracking * 0.01
        if (style.tracking) {
            let val = style.tracking * 0.01
            return val ? val : 0
        } else {
            return 0
        }
        // return px;
    },
}
