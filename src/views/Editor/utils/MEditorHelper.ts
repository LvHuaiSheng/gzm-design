import { IGroup, ILeaf, IUI } from '@leafer-ui/interface'
import { Group, Matrix } from '@leafer-ui/core'


const order = (a: ILeaf, b: ILeaf) => a.parent.children.indexOf(a) - b.parent.children.indexOf(b)
const reverseOrder = (a: ILeaf, b: ILeaf) => b.parent.children.indexOf(b) - a.parent.children.indexOf(a)

export const MEditorHelper = {

    group(list: IUI[], element?: IUI, group?: IGroup): IGroup {
        list.sort(reverseOrder)
        // const { app, parent } = list[0]
        const { app, parent } = element
        if (!group) group = new Group()
        // parent.addAt(group, parent.children.indexOf(list[0]))
        list.sort(order)

        const matrx = new Matrix(element.worldTransform)
        matrx.divideParent(parent.worldTransform)
        group.setTransform(matrx)
        group.editable = true
        group.hitChildren = false

        app.lockLayout()
        list.forEach(child => child.dropTo(group))
        app.unlockLayout()

        return group
    },
    ungroup(list: IUI[]): IUI[] {
        const { app } = list[0]
        const ungroupList: IUI[] = []

        app.lockLayout()
        list.forEach(leaf => {
            if (leaf.isBranch) {
                const { parent, children } = leaf
                while (children.length) {
                    ungroupList.push(children[0])
                    children[0].dropTo(parent, parent.children.indexOf(leaf))
                }
                leaf.remove()
            } else {
                ungroupList.push(leaf)
            }
        })
        app.unlockLayout()

        return ungroupList
    },
}
