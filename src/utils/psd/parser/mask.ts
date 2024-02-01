import {IUI} from "@leafer-ui/interface";
import {parseImage} from './image'
import {Group} from "leafer-ui";

/**
 * 蒙版
 */

/**
 * 打组，创建蒙版数据
 * @param index 层级
 * @param groups 组数组
 * @param parent 上级元素
 */
export async function parseMask(index: number, groups: any, parent: IUI) {
    //  打组,每2张一个组。TODO 处理多个组剪切蒙版的效果
    // 反向执行，由下到上执行，下面作为蒙版页，上面依托下面剪切蒙版
    let layerMask = await parseImage(groups[groups.length - 1])
    const group = new Group({
        zIndex: index,
    })
    group.name = '组' + group.innerId
    let image = await parseImage(groups[groups.length - 1])
    parent.add(group)
    layerMask.mask = true
    group.add(layerMask)
    group.add(image)

    for (let i = groups.length - 2; i >= 0; i--) {
        let layer = groups[i]
        // i-=1
        if (groups[i]) {
            let layerFill = parseImage(groups[i])
            group.add(layerFill)
        }
    }
    return group
}

export const maskUtil = {}
