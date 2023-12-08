<template>
    <a-popover v-model:popup-visible="showFileOper" position="bottom" trigger="click" content-class="down-list">
        <a-button class="icon-btn">
            文件
            <icon-down class="m-l-2px"/>
        </a-button>
        <template #content>
            <div>
                <div class="p-t-5px p-b-5px p-l-20px p-r-20px border-bottom">
                    <span class="font-bold">ID:123456789</span>
                    <div>
                        <span>未命名文件</span>
                    </div>
                </div>
                <ul class="">
                    <li @click="fileOper('insertImg')">
                        <icon-upload class="m-r-5px"/>
                        插入图片
                    </li>
                    <li @click="fileOper('importPsdFile')">
                        <icon-import class="m-r-5px"/>
                        导入PSD文件
                    </li>
                    <li @click="fileOper('importJsonFile')">
                        <icon-import class="m-r-5px"/>
                        导入JSON文件
                    </li>
                     <li @click="fileOper('copyFile')" ><icon-copy class="m-r-5px"/>创建副本</li>
                </ul>
            </div>
        </template>
    </a-popover>
    <a-modal v-model:visible="visible" :closable="false" :footer="false">
        <template #title> {{ processTitle }}</template>
        <div>
            <div style="width: max-content; margin: 0 auto">
                <a-spin dot/>
            </div>
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import {checkFileExt, getImgStr, selectFiles, toArrayBuffer} from "@/utils/designUtil";
import {Group, Image, Matrix, Rect, Text} from "leafer-ui";
import {HTMLText} from '@leafer-in/html'
import {getCommonFields, parsePsdFile, psdText} from "@/utils/psdUtil";
import {useEditor} from "@/views/Editor/app";
import {toRGBColorStr} from "@/utils/color";
import {IUI} from "@leafer-ui/interface";
import {Message} from "@arco-design/web-vue";
import {getDefaultName} from "@/views/Editor/utils/utils";

const {canvas, keybinding} = useEditor()

const showFileOper = ref(false)
const visible = ref(false)
const processTitle = ref('正在导入')

const fileOper = (type) => {
    showFileOper.value = false
    switch (type) {
        case 'insertImg':
            insertImg()
            break;
        case 'importPsdFile':
            importPsdFile()
            break;
        case 'importJsonFile':
            importJsonFile()
            break;
        case 'copyFile':
            copyFile()
            break;
    }
}

const copyFile = () => {

}

// 插入图片
const insertImg = async (clear = false) => {
    selectFiles({accept: '.jpg,.png,.jpeg,.svg', multiple: false}).then((fileList) => {
        if (clear) {
            // canvas.clear()
            // workspaces.removeAll()
        }
        Array.from(fileList).forEach(async (item) => {
            const {arrayBuffer} = await toArrayBuffer(item)
            const url = URL.createObjectURL(item);
            let image = new Image({
                name: getDefaultName(canvas.contentFrame),
                url: url,
                editable: true
            });
            canvas.add(image)
        })
    })
}

const importPsdFile = () => {
    selectFiles({accept: '.psd', multiple: false}).then(async (fileList) => {
        let oldAll = []
        for (const item of Array.from(fileList)) {
            if (checkFileExt(item, ['psd'])) {
                visible.value = true
                processTitle.value = '正在导入PSD文件'
                console.log('开始执行')
                const onProcess = (result) => {
                }
                // PSD文件
                parsePsdFile(item, onProcess).then(async value => {
                    const {psd, layers} = value
                    canvas.contentFrame.removeAll()
                    canvas.contentFrame.width = psd.width
                    canvas.contentFrame.height = psd.height
                    console.log('layers=', layers)
                    await parseLayers(layers)
                    visible.value = false
                    setTimeout(() => {
                        canvas.childrenEffect()
                    }, 200)
                }).catch(reason => {
                    visible.value = false
                    Message.warning({
                        content: reason,
                        duration: 4000
                    })
                })

            } else {
                // 非PSD文件
                getImgStr(item).then((file) => {
                    // insertImgFile(file)
                })
            }
        }
    })
};
const importJsonFile = () => {
    selectFiles({accept: '.json'}).then((files) => {
        visible.value = true
        processTitle.value = '正在导入JSON文件'
        console.log('开始执行')

        const [file] = files;
        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = () => {
            canvas.importJsonToCurrentPage(JSON.parse(reader.result), true)
            visible.value = false
        };
    });
}


const parseLayers = async (layers, parent: IUI = canvas.contentFrame) => {
    layers.reverse()
    let group = []
    for (let i = 0; i < layers.length; i++) {
        let layer = layers[i]
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
                await addMask(index, group, parent)
                group = []
                // addObj(index,layer)
            } else {
                addObj(layer, parent)
            }
        }
    }
}

const addObj = (layer, parent = canvas.contentFrame) => {
    let obj
    if (layer.text) {
        // 文字
        obj = addText(layer, parent)
    } else {
        // 图片
        obj = addImage(layer, parent)
        // editor.contentFrame.add(canvas)
    }
    return obj;
}
const addGroup = (layer, parent: IUI = canvas.contentFrame) => {
    //  打组
    const group = new Group({
        name: layer.name,
        zIndex: layer.zIndex,
        draggable: true,
        ...getCommonFields(layer)
    })
    if (layer.canvas) {
        group.width = layer.canvas.width
        group.height = layer.canvas.height
    }
    // canvas.contentFrame.add(group)
    parent.add(group)
    return group
}
const addMask = async (index, groups, parent: IUI = canvas.contentFrame) => {
    //  打组,每2张一个组。TODO 处理多个组剪切蒙版的效果
    // 反向执行，由下到上执行，下面作为蒙版页，上面依托下面剪切蒙版
    let layerMask = await parseImage(groups[groups.length - 1])
    const group = new Group({
        zIndex: index,
    })
    group.name = '组' + group.innerId
    let layerMask2 = await parseImage(groups[groups.length - 1])
    // editor.contentFrame.add(layerMask2)
    // canvas.contentFrame.add(group)
    parent.add(group)
    layerMask.isMask = true
    // layerMask.fill =  {
    //     type: 'solid',
    //     color: '#ffffff'
    // },
    group.add(layerMask2)
    group.add(layerMask)

    for (let i = groups.length - 2; i >= 0; i--) {
        let layer = groups[i]
        // console.log('group layer=',layer)
        // const group = new Group({zIndex:index})
        // if (prevImg.clipping) {
        //     mode = 'clip'
        // }

        // i-=1
        if (groups[i]) {
            let layerFill = await parseImage(groups[i])
            group.add(layerFill)
        }
    }
    return group
}
const addImage = async (layer, parent: IUI = canvas.contentFrame) => {

    let image = await parseImage(layer)
    image.zIndex = layer.zIndex
    parent.add(image)
    return image
}

const addText = async (layer, parent: IUI = canvas.contentFrame) => {
    /**
     * TODO 待处理效果
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
        })
        let textStr = layer.text.text
        // 去除换行符前面的空格
        textStr = textStr.replace(/([^\S\n]*)\n/g, '\n');
        let startLen = 0
        let prevRight = null
        let svgContent = ''
        for (let i = 0; i < layer.text.styleRuns.length; i++) {
            const text = new Text({
                ...getCommonFields(layer),
                draggable: false,
            })
            let item = layer.text.styleRuns[i]
            let endLen = startLen + item.length
            text.text = textStr.substring(startLen, endLen)
            startLen = endLen

            text.fill = psdText.getFill(layer)
            if (prevRight) {
                text.x = prevRight
            }
            console.log('item=', item)
            // 上个组件最右边的坐标 = 组件的x坐标+组件相对世界坐标的笔触边界
            prevRight = text.x + text.worldRenderBounds.width
            setTxtStyle(item.style, text)
            setTxtParagraphStyle(item.paragraphStyle, text)
            setTextEff(layer.effects, group)
            let appendStyles = ''
            let fontSize = item.style.fontSize ? item.style.fontSize : layer.text.style.fontSize
            if (layer.text.transform) {
                const [a, b, c, d, e, f] = layer.text.transform
                // 直接使用缩放
                appendStyles += `transform:matrix(${a},${b},${c},${d},0,0)`
            }
            svgContent += `<i style="font-size:${fontSize}px;color: ${psdText.getFill(layer)};">${text.text}</i>`

        }
        const htmlText = new HTMLText({
            ...getCommonFields(layer),
            text: svgContent,
            width: psdText.getWidth(layer),
            height: psdText.getHeight(layer),
        })
        setTextEff(layer.effects, htmlText)
        setTextLayerProp(layer, htmlText)
        // canvas.contentFrame.add(textSvg)
        parent.add(htmlText)
    } else {

        // 去除换行符前面的空格
        let textStr = layer.text.text.replace(/([^\S\n]*)\n/g, '\n');
        if (layer.text.text) {
            const text = new Text({
                ...getCommonFields(layer),
                text: textStr,
                width: psdText.getWidth(layer),
                height: psdText.getHeight(layer),
                fontFamily: psdText.getFontFamily(layer),
                fontSize: psdText.getFontSize(layer),
                fill: psdText.getFill(layer),
                zIndex: layer.zIndex,
            })
            console.log('text=', text)
            setTextLayerProp(layer, text)
            setTxtStyle(layer.text.style, text)
            setTxtParagraphStyle(layer.text.paragraphStyle, text)
            setTextEff(layer.effects, text)
            // canvas.contentFrame.add(text)
            parent.add(text)
            return text
        }
    }
}
/**
 * 设置文本通用属性
 * @param props
 * @param text
 */
const setTextLayerProp = (props, text) => {
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
const setTxtStyle = (style, text) => {
    // 设置文字样式
    // 文字间距
    text.letterSpacing = {
        type: 'px',
        // value: psdText2.getLetterSpacing(styleData) / 26 // TODO 搞不懂为什么要除26才正常，或许除26后也不是正常的
        value: psdText.getLetterSpacing(style)
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
const setTxtParagraphStyle = (paragraphStyle, text) => {
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
const setTextEff = (effects, text) => {
    // 下面开始设置文字效果
    if (effects) {
        // 描边
        if (effects.stroke && effects.stroke.length > 0) {
            let strokeArr = []
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

const parseImage = (layer) => {
    let options = {};
    if (layer.canvas) {
        const url = layer.canvas.toDataURL("image/png")
        options = {
            url: url,
            width: layer.canvas.width,
            height: layer.canvas.height,
        }
    }
    const image = new Image({
        ...getCommonFields(layer),
        ...options,
    })
    return image
}
</script>

<style scoped>

</style>
