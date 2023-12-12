import {registerUI, Rect, dataProcessor, UIData} from "leafer-ui";
import {IUIData, IUIInputData} from "@leafer-ui/interface";

// 定义数据

// 输入数据接口
interface ICustomInputData extends IUIInputData {
}

// 元素数据接口
interface ICustomData extends IUIData {
}

class CustomData extends UIData implements ICustomData {
    // 元素数据，负责元素的数据处理
}

/**
 * 自定义元素实现图片功能
 * 自定义此元素的目的：解决官方Image元素不能在初始化时设置fill的opacity问题
 */
@registerUI()
class Image2 extends Rect {
    private _url: string;
    private _fillOpacity: number;

    public get __tag() {
        return 'Image2'
    }

    // 使用自定义数据类，防止污染通用 UI 数据
    @dataProcessor(CustomData)
    declare public __: ICustomData

    constructor(data: ICustomInputData) {
        super(data)
    }

    get url(): string {
        return this._url;
    }

    set url(value: string) {
        this.fill = {type: 'image', url: value, opacity: 1}
        this._url = value;
    }

    get fillOpacity(): number {
        return this._fillOpacity;
    }

    set fillOpacity(value: number) {
        this._fillOpacity = value;
        this.fill = {type: 'image', url: this._url, opacity: value}
    }
}

export default Image2
