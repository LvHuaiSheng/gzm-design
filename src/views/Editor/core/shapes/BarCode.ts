import {registerUI, Rect, dataProcessor, UIData, PropertyEvent} from "leafer-ui";
import {ILeaferCanvas, IUIData, IUIInputData} from "@leafer-ui/interface";

import {QRCodeToDataURLOptions, toCanvas, toDataURL, toString} from 'qrcode';
import JsBarcode from 'jsbarcode'
import {Canvas} from "@leafer-ui/core";

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
    text: string
    size: number
    options: QRCodeToDataURLOptions
    logo: string
    logoSize: number
    logoPadding: number
}

/*
 https://github.com/soldair/node-qrcode#qr-code-options
 */
class CustomData extends UIData implements ICustomData {
    // 元素数据，负责元素的数据处理
    text: string
    size: number
    options: QRCodeToDataURLOptions
    logo: string
    logoSize: number
    logoPadding: number
}

/**
 * 一维码
 */
@registerUI()
class BarCode extends Rect {
    private _url: string;
    private _size: number;
    private lockChange: boolean;
    private oldHeight: number;
    private oldWidth: number;

    public get __tag() {
        return 'BarCode'
    }

    // 使用自定义数据类，防止污染通用 UI 数据
    @dataProcessor(CustomData)
    declare public __: ICustomData

    constructor(data: ICustomInputData) {
        super(data)
    }

    public __onUpdateSize(){
        // 锁定修改
        // if (!this.lockChange && (this.oldWidth !== this.width || this.oldHeight !== this.height) ){
        //     this.lockChange = true
        //     this.renderQr()
        // }
        // requestAnimationFrame(() => (
        //     this.lockChange = false
        // ))
        super.__onUpdateSize()
        this.oldWidth = this.width
        this.oldHeight = this.height
    }
    renderQr() {

        const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        // var format = "CODE39";
        // var barcodeUnitWidth = this.calculateBarcodeWidth(this.__.text,this.width, format);
        // console.log("每个码的间隔：" + barcodeUnitWidth);

        JsBarcode(svgNode, this.__.text, {
            xmlDocument: document,
            // format: format,
            // width:barcodeUnitWidth,
            height:this.height,
            displayValue: true,
        });
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgNode);
        const blob = new Blob([svgString], {type: "image/svg+xml"});
        const url = URL.createObjectURL(blob);
        this.url = url
    }
    set text(text: string) {
        this.__.text = text
        this.renderQr()
    }

    get url(): string {
        return this._url;
    }

    set url(value: string) {
        this.fill = {type: 'image', url: value, opacity: 1,format:'svg',mode:'fit'}
        this._url = value;
    }
    get size(): number {
        return this._size;
    }

    set size(value: number) {
        this._size = value
        this.width = value;
        this.height = value;
    }
    // 定义函数来计算每个码的间隔
    public calculateBarcodeWidth(text:string,width:number, format:string) {
        // 设置静态参数
        var codeLength = text.length;
        var quietZone = 10;

        // 计算条形码宽度
        var barcodeWidth = (width - quietZone * 2);

        // 计算每个码的间隔
        var barcodeUnitWidth = barcodeWidth / codeLength;
        return barcodeUnitWidth;
    }
}

export default BarCode
