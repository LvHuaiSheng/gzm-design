/**
 * PSD文字属性解析
 */
import { Justification, Layer } from "ag-psd";
import { toRGBColorStr } from "@/utils/color/g-color";
import { Group, Matrix, Text } from "leafer-ui";
import { getCommonOptions, LayerInfo } from "./common";
import HTMLText from "@/views/Editor/core/shapes/HTMLText2";
import { LayerEffectsInfo, ParagraphStyle, TextStyle } from "ag-psd/src/psd";
import { ITextAlign } from "@leafer-ui/interface";

/**
 * 转换Text元素
 * @param layer 图层信息
 * @param options 额外属性
 */
export function parseText(layer: LayerInfo, options = {}) {
    if (layer.text.styleRuns) {
        /**
         * TODO 富文本的文字方向、描边效果
         * 文字方向：text.orientation
         * 描边效果：text.style.strokeFlag、text.style.strokeColor
         */
        return parseStyledText(layer, options);
    } else {
        return parseSimpleText(layer, options);
    }
}

function parseStyledText(layer: LayerInfo, options = {}) {
    const scale = textUtil.getAverageScale(layer.text.transform);
    const group = new Group({
        zIndex: layer.zIndex,
        draggable: true,
        width: textUtil.getWidth(layer),
        height: textUtil.getHeight(layer),
        ...options
    });

    let textStr = layer.text.text.replace(/([^\S\n]*)\n/g, '<br/>');
    let startLen = 0
    const svgContent = layer.text.styleRuns.reduce((acc, item, index) => {
        const endLen = startLen + item.length;
        const fontSize = (item.style.fontSize || layer.text.style.fontSize) * scale;
        const text = textStr.substring(startLen, endLen);
        startLen = endLen;
        return acc + `<span style="font-size:${fontSize}px;color: ${textUtil.getFill(layer)};">${text}</span>`;
    }, '');

    const htmlText = new HTMLText({
        ...getCommonOptions(layer),
        text: svgContent,
        width: textUtil.getWidth(layer),
        height: textUtil.getHeight(layer)
    });

    return htmlText;
}

function parseSimpleText(layer: LayerInfo, options = {}) {
    // 去除换行符前面的空格
    let textStr = layer.text.text.replace(/([^\S\n]*)\n/g, '\n');
    const text = new Text({
        ...getCommonOptions(layer),
        fill: textUtil.getFill(layer),
        text: textStr,
        width: textUtil.getWidth(layer),
        height: textUtil.getHeight(layer),
        fontFamily: textUtil.getFontFamily(layer),
        fontSize: textUtil.getFontSize(layer)
    });

    setTxtStyle(layer, text);
    setTxtParagraphStyle(layer.text.paragraphStyle, text);
    setTextEff(layer.effects, text);

    return text;
}

export const textUtil = {
    getWidth(layer: Layer) {
        return layer.canvas ? layer.canvas.width + 25 : 0;
    },
    getHeight(layer: Layer) {
        return layer.canvas ? layer.canvas.height : 0;
    },

    /**
     * 获取文字大小
     * @param layer
     */
    getFontSize(layer: Layer) {
        if (layer.text) {
            const transform = layer.text.transform;
            const scale = textUtil.getAverageScale(transform);
            return Number(layer.text.style?.fontSize)  * scale;
        }
        return 10;
    },

    /**
     * 获取文字字体
     * @param layer
     */
    getFontFamily(layer: Layer) {
        // TODO 根据这里获取到的字体名称，在稍后需要判断是否需要加载网络字体文件，如不加载或字体不存在，则会出现文字样式偏差
        return layer.text?.style?.font?.name || 'Arial';
    },

    /**
     * 获取填充颜色
     * @param layer
     */
    getFill(layer: Layer) {
        if ((layer.text?.style?.fillFlag || layer.text?.style?.fillFlag === undefined) && layer.text?.style?.fillColor) {
            return toRGBColorStr(layer.text?.style?.fillColor)
        } else {
            // 默认黑色
            return 'rgb(0,0,0)'
        }
    },

    /**
     * 获取文字间距
     * @param style
     */
    getLetterSpacing(layer: Layer) {
        if (layer.text.style.tracking) {
            const scale =textUtil.getAverageScale(layer.text.transform);
            let px = layer.text.style.fontSize * scale
            return layer.text.style.tracking / px
        }
        return 0;
    },

    /**
     * 获取缩放比
     * @param transform
     */
    getAverageScale(transform: number[]) {
        const scaleX = transform[0];
        const scaleY = transform[3];
        return (scaleX + scaleY) / 2;
    },

    /**
     * 转换文字对齐方式
     * @param justification
     */
    mapJustificationToTextAlign(justification: Justification): ITextAlign {
        const mapping = {
            left: 'left',
            right: 'right',
            center: 'center',
            'justify-left': 'left',
            'justify-right': 'right',
            'justify-center': 'center',
            'justify-all': 'justify',
        };
        if (mapping[justification]){
            return mapping[justification] as ITextAlign
        }else {
            throw new Error(`Unsupported justification value：${justification}`)
        }
    }
};

/**
 * 设置文本 style(样式) 属性
 * @param layer
 * @param text
 */
const setTxtStyle = (layer: Layer, text: Text) => {
    const style = layer.text.style;
    const scale = textUtil.getAverageScale(layer.text.transform);
    // 文字间距
    text.letterSpacing = {
        type: 'px',
        value: textUtil.getLetterSpacing(layer)
    };

    // 这里需要注意的是 leafer不支持同时存在删除线和下划线，两者都存在则只保留下划线
    if (style.strikethrough) {
        // 删除线
        text.textDecoration = 'delete';
    }
    if (style.underline) {
        // 下划线
        text.textDecoration = 'under';
    }

    if (style.leading) {
        text.lineHeight = {
            type: 'px',
            value: style.leading * scale,
        };
    }

    // TODO 处理水平缩放 props.text.style.horizontalScale
};

/**
 * 设置文本段落 paragraphStyle(样式) 属性
 * @param paragraphStyle
 * @param text
 */
const setTxtParagraphStyle = (paragraphStyle: ParagraphStyle, text: Text) => {
    if (paragraphStyle) {
        if (paragraphStyle.justification) {
            text.textAlign = textUtil.mapJustificationToTextAlign(paragraphStyle.justification);
        }
        // 默认都是垂直居中对齐
        text.verticalAlign = 'middle';
        text.paraIndent = paragraphStyle.firstLineIndent;
    }
};

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
