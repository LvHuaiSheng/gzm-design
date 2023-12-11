/**
 * PSD文字属性解析
 */
import {Layer} from "ag-psd";
import {toRGBColorStr} from "@/utils/color";
import {Group, Matrix, Text} from "leafer-ui";
import {getCommonOptions, LayerInfo} from "./common";
import {HTMLText} from "@leafer-in/html";
import {LayerEffectsInfo, ParagraphStyle, TextStyle} from "ag-psd/src/psd";

/**
 * 转换Text元素
 * @param layer 图层信息
 * @param options 额外属性
 */
export function parseText(layer: LayerInfo, options = {}) {
    /**
     * TODO 富文本
     *
     * 文字方向：text.orientation
     * 描边效果：text.style.strokeFlag、text.style.strokeColor
     */
    if (layer.text.styleRuns) {
        // 有它说明是需要多个文字拆分不同效果，这里直接拆成多个文字组件
        const group = new Group({
            zIndex: layer.zIndex,
            draggable: true,
            width: layer.canvas.width,
            height: layer.canvas.height,
            ...options
        })
        let textStr = layer.text.text
        // 去除换行符前面的空格
        textStr = textStr.replace(/([^\S\n]*)\n/g, '\n');
        let startLen = 0
        let svgContent = ''
        for (let i = 0; i < layer.text.styleRuns.length; i++) {
            let item = layer.text.styleRuns[i]
            let endLen = startLen + item.length
            const text = textStr.substring(startLen, endLen)
            startLen = endLen

            let appendStyles = ''
            let fontSize = item.style.fontSize ? item.style.fontSize : layer.text.style.fontSize
            // if (layer.text.transform) {
            //     const [a, b, c, d, e, f] = layer.text.transform
            //     // 直接使用缩放
            //     appendStyles += `transform:matrix(${a},${b},${c},${d},0,0)`
            // }
            svgContent += `<i style="font-size:${fontSize}px;color: ${textUtil.getFill(layer)};">${text}</i>`
        }
        const htmlText = new HTMLText({
            ...getCommonOptions(layer),
            text: svgContent,
            width: textUtil.getWidth(layer),
            height: textUtil.getHeight(layer)
        })
        // setTxtParagraphStyle(layer.text.paragraphStyle, htmlText)
        // setTextLayerProp(layer, htmlText)
        return htmlText
    } else {

        // 去除换行符前面的空格
        let textStr = layer.text.text.replace(/([^\S\n]*)\n/g, '\n');
        const text = new Text({
            ...getCommonOptions(layer),
            fill: textUtil.getFill(layer)
        })
        if (textStr) {
            text.text = textStr
            text.width = textUtil.getWidth(layer)
            text.height = textUtil.getHeight(layer)
            text.fontFamily = textUtil.getFontFamily(layer)
            text.fontSize = textUtil.getFontSize(layer)
        }
        setTextLayerProp(layer, text)
        setTxtStyle(layer.text.style, text)
        setTxtParagraphStyle(layer.text.paragraphStyle, text)
        setTextEff(layer.effects, text)
        return text
    }
}

export const textUtil = {

    getWidth(layer: Layer) {
        return layer.canvas.width + 25
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
            return style.tracking * 0.01
        } else {
            return 0
        }
        // return px;
    },
}

/**
 * 设置文本通用属性
 * @param props
 * @param text
 */
const setTextLayerProp = (props: LayerInfo, text: Text) => {
    // 分解出：x, y, scaleX, scaleY, rotation, skewX, skewY
    const [a, b, c, d, e, f] = props.text.transform
    let matrix = new Matrix(a, b, c, d, e, f)
    console.log('新transform=', props.text.transform)
    console.log('matrix=', matrix)
    // text.setTransform(matrix)
    if (props.text.warp) {
        // text.textWrap = props.text.warp.style
    }
}

/**
 * 设置文本 style(样式) 属性
 * @param style
 * @param text
 */
const setTxtStyle = (style: TextStyle, text: Text) => {
    // 设置文字样式
    // 文字间距
    text.letterSpacing = {
        type: 'px',
        // value: psdText2.getLetterSpacing(styleData) / 26 // TODO 搞不懂为什么要除26才正常，或许除26后也不是正常的
        value: textUtil.getLetterSpacing(style)
    }
    console.log('letterSpacing=', text.letterSpacing)
    if (style.strikethrough) {
        // 删除线
        text.textDecoration = 'delete'
    }
    if (style.underline) {
        // 下划线
        text.textDecoration = 'under'
    }

    // text.referencePoint = style.referencePoint
    if (style.leading) {
        text.lineHeight = {
            type: 'px',
            value: style.leading,
        }
    }
    // TODO 处理水平缩放 props.text.style.horizontalScale
}

/**
 * 设置文本段落 paragraphStyle(样式) 属性
 * @param paragraphStyle
 * @param text
 */
const setTxtParagraphStyle = (paragraphStyle: ParagraphStyle, text: Text) => {
    if (paragraphStyle) {
        text.textAlign = paragraphStyle.justification
        // 默认都是垂直居中对齐
        text.verticalAlign = 'middle'
        text.paraIndent = paragraphStyle.firstLineIndent
        // text.padding = paragraphStyle.wordSpacing
    }

}

/**
 * 设置文本 effects(效果) 属性
 * @param effects
 * @param text
 */
const setTextEff = (effects: LayerEffectsInfo, text: Text) => {
    // 下面开始设置文字效果
    if (effects) {
        // 描边
        if (effects.stroke && effects.stroke.length > 0) {
            let strokeArr: any[] = []
            effects.stroke.map(stroke => {
                if (stroke.enabled) {
                    let type
                    switch (stroke.fillType) {
                        case 'color':
                            type = 'solid'
                            break
                        default:
                            type = 'solid'
                            break
                    }
                    strokeArr.push({
                        type: type,
                        strokeAlign: stroke.position,
                        opacity: stroke.opacity,
                        color: toRGBColorStr(stroke.color)
                    })
                }
            })
            text.stroke = strokeArr
        }
    }
}
