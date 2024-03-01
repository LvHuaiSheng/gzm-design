import {MLeaferCanvas, IMLeaferCanvas} from '@/views/Editor/core/canvas/mLeaferCanvas'
import {Disposable} from '@/views/Editor/utils/lifecycle'
import {IKeybindingService, KeybindingService} from '@/views/Editor/core/keybinding/keybindingService'
import {ClipboardService, IClipboardService} from '@/views/Editor/core/clipboard/clipboardService'
import { IEditorUndoRedoService, EditorUndoRedoService } from '@/views/Editor/app/editor/undoRedo/undoRedoService'
import {clamp, clone} from 'lodash'
import {appInstance} from '@/views/Editor/app'
import {PointerEvent, Point, Group, LeafList} from 'leafer-ui'
import {IGroup, IUI} from '@leafer-ui/interface'
import {typeUtil} from "@/views/Editor/utils/utils";
import {EditorHelper} from "@leafer-in/editor/src/helper/EditorHelper";
import {MEditorHelper} from "@/views/Editor/utils/MEditorHelper";
import {Matrix} from "@leafer-ui/core";

export class Clipboard extends Disposable {

    private pointer = new Point()
    private activeObject: IUI
    private group: IGroup

    constructor(
        @IMLeaferCanvas private readonly canvas: MLeaferCanvas,
        @IKeybindingService readonly keybinding: KeybindingService,
        @IClipboardService private readonly clipboard: ClipboardService,
        @IEditorUndoRedoService private readonly undoRedo: EditorUndoRedoService,
    ) {
        super()

        keybinding.bind({
            'mod+x': this.clip.bind(this),
            'mod+c': this.copy.bind(this),
            'mod+v': this.paste.bind(this, false),
            'mod+shift+v': this.paste.bind(this, true),
        })
        canvas.app.tree.on(PointerEvent.MOVE, (arg: PointerEvent) => {
            this.pointer = new Point(arg.x, arg.y)
        })
    }

    private async copy() {
        const _activeObject = this.canvas.getActiveObject()
        if (!_activeObject || typeUtil.isBottomCanvas(_activeObject)) return
        this.activeObject = clone(_activeObject)

        // 不管怎样都进组，最后再拆
        if (typeUtil.isVirtualElement(this.activeObject)) {
            // 选中元素进组
            let list: IUI[] = []
            const objects = this.canvas.getActiveObjects()
            objects.forEach(value => {
                const clo = value.clone()
                clo.parent = value.parent
                list.push(clo)
            })
            this.group = MEditorHelper.group(list, objects[0])
        } else {
            const cloneObj = this.activeObject.clone()
            this.group = MEditorHelper.group([cloneObj], this.activeObject)
        }
        // 转json
        const json = JSON.stringify(this.group.toJSON())

        // 写剪贴板
        this.clipboard.writeText(json)
    }

    private paste(currentLocation = false) {
        this.clipboard.readBlob().then((blobs) => {
            if (!blobs) return
            blobs.forEach(async (blob) => {
                // 读取json
                const json = await blob.text()
                let serialized: any | undefined

                if (json) {
                    try {
                        serialized = JSON.parse(json)
                    } catch (error) {
                        //
                    }
                }
                // 插入元素到画板内
                const addObjects = (groupData: object) => {
                    const group = new Group(groupData)
                    // 粘贴到当前位置
                    if (currentLocation) {
                        // TODO 拖动、缩放画布后重新复制元素时坐标有问题需获取到正确的坐标
                        const {x, y} = appInstance.editor.contextMenu?.pointer || this.pointer
                        const point = this.activeObject.parent ? this.activeObject.parent.getInnerPoint({
                            x: x,
                            y: y
                        }) : this.canvas.contentFrame.getInnerPoint({x: x, y: y})
                        group.x = point.x
                        group.y = point.y
                    } else {
                        // 略微在原基础上偏移粘贴
                        group.x += 15
                        group.y += 15
                    }
                    this.canvas.add(group)
                    // 选中元素
                    this.canvas.setActiveObjects(group.children)
                    // 解组
                    MEditorHelper.ungroup([group])
                }
                addObjects(serialized)
                // this.undoRedo.saveState()
                currentLocation && (appInstance.editor.contextMenu!.pointer = undefined)
            })
        })
    }

    private clip() {
        this.copy()
        this.keybinding.trigger('del')
    }

    public dispose(): void {
        super.dispose()
        this.keybinding.unbind(['mod+x', 'mod+c', 'mod+v', 'mod+shift+v'])
    }
}
