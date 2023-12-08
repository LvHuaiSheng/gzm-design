import {Layer} from "ag-psd";
import {CommonFields} from "@/utils/psdUtil";

/**
 * 获取公共字
 */
const parser = {
    getCommonFields(layer: Layer): CommonFields {
        return {
            draggable: true,
            title: layer.name,
            name: layer.name,
            visible: !layer.hidden,
            x: layer.left,
            y: layer.top,
            opacity: layer.opacity,
            // opacity: layer.opacity? layer.opacity/ 255:1,
        }
    }
}
export default parser
