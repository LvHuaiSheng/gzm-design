import {IString, IImage, IImageData, IImageInputData} from '@leafer-ui/interface'
import { ImageData } from 'leafer-ui'
import {boundsType, dataProcessor, Rect, registerUI, UIData,Image} from "leafer-ui";
import {getBase64CustomFontsStyle} from "@/utils/fonts/utils";

interface IHTMLTextAttrData {
    text?: string;
    __htmlChanged?: boolean;
}
interface IHTMLTextData extends IHTMLTextAttrData, IImageData {
}
interface IHTMLTextInputData extends IHTMLTextAttrData, IImageInputData {
}


interface IHTMLTextData extends IHTMLTextAttrData, IImageData {
}

export class HTMLTextData extends ImageData implements IHTMLTextData {

    _text: string
    __htmlChanged: boolean

    setText(value: IString): void {
        this._text = value
        this.__htmlChanged = true
    }
}


@registerUI()
export class HTMLText extends Image implements IImage {

    public get __tag() { return 'HTMLText' }

    @dataProcessor(HTMLTextData)
    declare public __: IHTMLTextData

    @boundsType('')
    declare public text?: IString
    public fontStyle:string

    public get editInner(): string { return 'TextEditor' }

    constructor(data?: IHTMLTextInputData) {
        super(data)
    }
    public refreshFontStyle(){
        const fontStyle = getBase64CustomFontsStyle()
        this.fontStyle = fontStyle
    }
    public __updateBoxBounds(): void {

        const data = this.__
        if (data.__htmlChanged) {

            const div = document.createElement('div')
            const { style } = div

            style.all = 'initial'
            style.position = 'absolute'
            style.visibility = 'hidden'
            div.innerHTML = this.text
            document.body.appendChild(div)

            const { width, height } = div.getBoundingClientRect()
            const realWidth = width + 10 // add italic width
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${realWidth}" height="${height}">
                        <foreignObject width="${realWidth}" height="${height}">
                            <style>
                                * {
                                    margin: 0;
                                    padding: 0;
                                    box-sizing: border-box;
                                }
                                ${this.fontStyle}
                            </style>
                            <body xmlns="http://www.w3.org/1999/xhtml">
                                ${this.text}
                            </body>
                        </foreignObject>
                    </svg>`
            data.__setImageFill('data:image/svg+xml,' + encodeURIComponent(svg))

            data.__naturalWidth = realWidth / data.pixelRatio
            data.__naturalHeight = height / data.pixelRatio

            data.__htmlChanged = false

            div.remove()
        }

        super.__updateBoxBounds()
    }

}
export default HTMLText
