/**
 * PSD文字属性解析
 */
import {Layer} from "ag-psd";
import {toRGBColorStr} from "@/utils/color";

const parser = {
    getWidth(layer: Layer){
        return layer.canvas.width + 25
    },
    getHeight(layer: Layer){
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
        if ((layer.text?.style?.fillFlag || layer.text?.style?.fillFlag===undefined ) && layer.text?.style?.fillColor) {
            return toRGBColorStr(layer.text?.style?.fillColor)
        }else{
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
    getLetterSpacing: (style:any) => {
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
        if (style.tracking){
            return style.tracking * 0.01
        }else {
            return 0
        }
        // return px;
    },
}
export default parser
