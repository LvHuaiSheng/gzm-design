import {Layer, readPsd} from "ag-psd";


/**
 * 解析psd文件
 * @param file
 * @param onProcess
 */

export async function parsePsdFile(file: File, onProcess: Function) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const arrayBuffer = reader.result;
            try {
                // @ts-ignore
                const psd = readPsd(arrayBuffer);
                onProcess()
                // 更新图层列表
                const layers = psd.children;
                resolve({psd, layers})
            } catch (e) {
                console.error(e)
                // @ts-ignore
                if (e.message.indexOf('Color mode not supported: CMYK') > -1) {
                    reject({message: '暂不支持CMYK色彩模式的文件，请先使用PS转换为RGB'})
                } else {
                    // @ts-ignore
                    reject({message: e.message})
                }
            }
        };
        reader.readAsArrayBuffer(file);
    })
}
