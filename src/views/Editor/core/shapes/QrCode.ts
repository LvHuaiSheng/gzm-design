import {registerUI, Rect, dataProcessor, UIData, PropertyEvent, surfaceType,UI} from "leafer-ui";
import {IUIData, IUIInputData} from "@leafer-ui/interface";

import {QRCodeSegment, QRCodeToDataURLOptions, toCanvas, toDataURL, toString} from 'qrcode';

// 定义数据

// 输入数据接口
interface ICustomInputData extends IUIInputData {
    text?: string
    size?: number
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
// class CustomData extends UIData implements ICustomData {
//     protected text: string
//     protected size: number
//     protected options?: QRCodeToDataURLOptions
//     protected logo?: string
//     protected logoSize?: number
//     protected logoPadding?: number
//     protected setText(value:string){
//         this.text = value
//     }
//     protected setSize(value:number){
//         this.size = value
//         this.setWidth(value);
//         this.setHeight(value);
//     }
// }
class CustomData extends UIData implements ICustomData {
    protected _text: string
    protected _size: number
    protected _options?: QRCodeToDataURLOptions
    protected _logo?: string
    protected _logoSize?: number
    protected _logoPadding?: number

    protected setSize(value:number){
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
    @surfaceType("文字")
    public text: string |QRCodeSegment[]
    @surfaceType("100")
    public size: number

    @surfaceType()
    public options?: QRCodeToDataURLOptions
    @surfaceType()
    public logo?: string
    @surfaceType()
    public logoSize?: number
    @surfaceType()
    public logoPadding?: number

    public get __tag() {
        return 'QrCode'
    }

    constructor(data: ICustomInputData) {
        super(data)
        watch(this.options,(value, oldValue, onCleanup) => {
            this.renderQr()
        },{
            deep:true
        })
    }

    // public __onUpdateSize(){
    //     // 锁定修改
    //     if (!this.lockChange && this.oldSize !== this.width){
    //         this.lockChange = true
    //         this.renderQr()
    //     }
    //     requestAnimationFrame(() => (
    //         this.lockChange = false
    //     ))
    //     super.__onUpdateSize()
    //     this.oldSize = this.width
    // }
    renderQr() {
        // console.log('this.proxyData=',this.proxyData.text)
        // console.log('this.text=',this.text)
        toDataURL(this.text, {...this.options,width:this.width}).then(value => {
            this.url = value
        })
    }
    //
    // set text(text: string) {
    //     this.__.text = text
    //     this.renderQr()
    // }

    get url(): string {
        return this._url;
    }

    set url(value: string) {
        this.fill = {type: 'image', url: value, opacity: 1}
        this._url = value;
    }
    // __draw(){
    //     console.log('111111')
    //     // this.renderQr()
    // }
}

export default QrCode
