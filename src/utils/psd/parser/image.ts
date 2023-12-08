/**
 * 图片
 */
import {Layer} from "ag-psd";
import {toRGBColorStr} from "@/utils/color";
import {Image} from "leafer-ui";
import {getCommonFields} from "@/utils/psdUtil";

const imageParser = {
    parseImage(layer:Layer){
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
            // fill: fill,
            // isMask:isMask,
            ...options,
        })
        // image.set()
        return image
    }
}
export default imageParser
