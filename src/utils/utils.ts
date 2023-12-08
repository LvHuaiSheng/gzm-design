
/**
 * 替换数组中的某个元素 并返回一个新数组
 * @param arr 数组
 * @param index 要替换的角标
 * @param newElement 新数据
 */
export function replaceElementToNewArr(arr:[], index:number, newElement:any) {
    return arr.slice(0, index).concat(newElement).concat(arr.slice(index + 1));
}
