import {boundsType, dataProcessor, Rect, registerUI, UIData} from "leafer-ui";
import {IUIData, IUIInputData} from "@leafer-ui/interface";

import QRCode, {QRCodeSegment, QRCodeToDataURLOptions} from 'qrcode';

// 定义数据

// 输入数据接口
interface ICustomInputData extends IUIInputData {
    text: string
    size: number
    options?: QRCodeToDataURLOptions
    logo?: string
    logoSize?: number
    logoPadding?: number
}

// 元素数据接口
interface ICustomData extends IUIData {

}

/*
 https://github.com/soldair/node-qrcode#qr-code-options
 */

class CustomData extends UIData implements ICustomData {
    protected _text: string
    protected _size: number
    protected _options?: QRCodeToDataURLOptions
    protected _logo?: string
    protected _logoSize?: number
    protected _logoPadding?: number

    protected setSize(value: number) {
        this._size = value
        this.__leaf.width = value
        this.__leaf.height = value;
    }
}

/**
 * 二维码
 */
@registerUI()
class QrCode extends Rect {

    private _url: string;
    private lockChange: boolean;
    private oldSize: number;

    // 使用自定义数据类，防止污染通用 UI 数据
    @dataProcessor(CustomData)
    declare public __: ICustomData

    // 元素数据，负责元素的数据处理
    @boundsType("文字")
    declare public text: string | QRCodeSegment[]

    @boundsType(100)
    declare public size: number

    @boundsType({
        errorCorrectionLevel: "H",
        margin: 4,
        scale: 4,
        color: {
            dark: '#000000ff',
            light: '#ffffffff',
        },
    })
    declare public options?: QRCodeToDataURLOptions
    @boundsType()
    declare public logo?: string
    @boundsType()
    declare public logoSize?: number
    @boundsType()
    declare public logoPadding?: number


    public get __tag() {
        return 'QrCode'
    }

    constructor(data: ICustomInputData) {
        super(data)
    }

    public __onUpdateSize() {
        // 锁定修改
        if (!this.lockChange) {
            this.lockChange = true
            this.renderQr()
        }
        requestAnimationFrame(() => (
            this.lockChange = false
        ))
        super.__onUpdateSize()
    }

    renderQr() {
        try {
            // @ts-ignore
            QRCode.toString(this.text, {...this.options, width: this.width}, (err, value) => {
                if (err) throw err
                const blob = new Blob([value], {type: "image/svg+xml"});
                const url = URL.createObjectURL(blob);
                this.url = url
            })
        } catch (e: any) {
            if (e.message.indexOf('nvalid hex color') > -1) {
                // TODO 非标准的hex颜色格式
            } else {
                console.error(e)
            }
        }
    }

    get url(): string {
        return this._url;
    }

    set url(value: string) {
        this.fill = {type: 'image', url: value, opacity: 1, format: 'svg'}
        this._url = value;
    }
}

export default QrCode
