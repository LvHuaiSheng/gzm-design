import { useClipboard, useFileDialog, useBase64 } from '@vueuse/core';
import { Message } from '@arco-design/web-vue';
import {readPsd} from "ag-psd";
interface Font {
  type: string;
  fontFamily: string;
}

/**
 * @description: 图片文件转字符串
 * @param {Blob|File} file 文件
 * @return {String}
 */
export function getImgStr(file: File | Blob): Promise<FileReader['result']> {
  return useBase64(file).promise.value;
}
export function blobToBase64(blob:Blob) {
	return new Promise((resolve, reject) => {
		const fileReader = new FileReader();
		fileReader.onload = (e) => {
			// @ts-ignore
			resolve(e.target.result);
		};
		// readAsDataURL
		fileReader.readAsDataURL(blob);
		fileReader.onerror = () => {
			reject(new Error('blobToBase64 error'));
		};
	});
}

/**
 * @description: 选择文件
 * @param {Object} options accept = '', capture = '', multiple = false
 * @return {Promise}
 */
export function selectFiles(options: {
  accept?: string;
  capture?: string;
  multiple?: boolean;
}): Promise<FileList | null> {
  return new Promise((resolve) => {
    const { onChange, open } = useFileDialog(options);
    onChange((files) => {
      resolve(files);
    });
    open();
  });
}

/**
 * @description: 前端下载文件
 * @param {String} fileStr
 * @param fileName
 */
export function downFile(fileStr: string, fileName: string) {
  const anchorEl = document.createElement('a');
  anchorEl.href = fileStr;
  anchorEl.download = fileName;
  document.body.appendChild(anchorEl); // required for firefox
  anchorEl.click();
  anchorEl.remove();
}

/**
 * @description: 创建图片元素
 * @param {String} str 图片地址或者base64图片
 * @return {Promise} element 图片元素
 */
export function insertImgFile(str: string) {
  return new Promise((resolve) => {
    const imgEl = document.createElement('img');
    imgEl.src = str;
    // 插入页面
    document.body.appendChild(imgEl);
    imgEl.onload = () => {
      resolve(imgEl);
    };
  });
}

/**
 * Copying text to the clipboard
 * @param source Copy source
 * @param options Copy options
 * @returns Promise that resolves when the text is copied successfully, or rejects when the copy fails.
 */
export const clipboardText = async (
  source: string,
  options?: Parameters<typeof useClipboard>[0]
) => {
  try {
    await useClipboard({ source, ...options }).copy();
      Message.success('复制成功');
  } catch (error) {
      Message.error('复制失败');
    throw error;
  }
};

/**
 * 获取文件后缀
 * @param file 文件
 */
export function getFileExt(file: File | Blob) {
  let fileExtension = '';
  if (file.name.lastIndexOf('.') > -1) {
    fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1);
  }
  return fileExtension;
}

/**
 * 判断文件类型是否在列表内
 * @param file 文件
 * @param fileTypes 文件类型数组
 */
export function checkFileExt(file: File | Blob, fileTypes: any | []) {
  const ext = getFileExt(file);
  const isTypeOk = fileTypes.some((type: string) => {
    if (file.type.indexOf(type) > -1) return true;
    if (ext && ext.indexOf(type) > -1) return true;
    return false;
  });
  return isTypeOk;
}

export function base64toFile(data:string, fileName:string) {
	const dataArr = data.split(',')
	const byteString = atob(dataArr[1])
	const options = {
		type: 'image/jpeg',
		endings: 'native',
	}
	const u8Arr = new Uint8Array(byteString.length)
	for (let i = 0; i < byteString.length; i++) {
		u8Arr[i] = byteString.charCodeAt(i)
	}
	// @ts-ignore
	return new File([u8Arr], `${fileName}.jpg`, options) // 返回文件流
}

export function uint8ArraytoFile(u8Arr:Uint8Array, fileName:string) {
	const byteString = ''
	const options = {
		type: 'image/png',
		endings: 'native',
	}
	for (let i = 0; i < byteString.length; i++) {
		u8Arr[i] = byteString.charCodeAt(i)
	}
	// @ts-ignore
	return new File([u8Arr], `${fileName}.jpg`, options) // 返回文件流
}


export async function toArrayBuffer(file: File) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const arrayBuffer = reader.result;
            resolve({arrayBuffer})
        };
        reader.readAsArrayBuffer(file);
    })

}
