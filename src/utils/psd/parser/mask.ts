import {IUI} from "@leafer-ui/interface";
import imageParser from './image'
import {Group} from "leafer-ui";

/**
 * 蒙版
 */
const maskParser = {
    /**
     * 打组，创建蒙版数据
     * @param index 层级
     * @param groups 组数组
     * @param parent 上级元素
     */
    async addMask(index: number, groups: any, parent: IUI) {
        //  打组,每2张一个组。TODO 处理多个组剪切蒙版的效果
        // 反向执行，由下到上执行，下面作为蒙版页，上面依托下面剪切蒙版
        let layerMask = await imageParser.parseImage(groups[groups.length - 1])
        const group = new Group({
            zIndex: index,
        })
        group.name = '组' + group.innerId
        let layerMask2 = await imageParser.parseImage(groups[groups.length - 1])
        // editor.contentFrame.add(layerMask2)
        // canvas.contentFrame.add(group)
        parent.add(group)
        layerMask.isMask = true
        // layerMask.fill =  {
        //     type: 'solid',
        //     color: '#ffffff'
        // },
        group.add(layerMask2)
        group.add(layerMask)

        for (let i = groups.length - 2; i >= 0; i--) {
            let layer = groups[i]
            // console.log('group layer=',layer)
            // const group = new Group({zIndex:index})
            // if (prevImg.clipping) {
            //     mode = 'clip'
            // }

            // i-=1
            if (groups[i]) {
                let layerFill = await imageParser.parseImage(groups[i])
                group.add(layerFill)
            }
        }
        return group
    }
}


export default maskParser
