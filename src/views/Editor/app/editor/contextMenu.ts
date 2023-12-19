import {IMLeaferCanvas, MLeaferCanvas} from '@/views/Editor/core/canvas/mLeaferCanvas'
import {Disposable} from '@/views/Editor/utils/lifecycle'
import MenuComponent from '@/components/contextMenu'
import {layerItems, zoomItems} from '@/views/Editor/utils/contextMenu'
import {IKeybindingService, KeybindingService} from '@/views/Editor/core/keybinding/keybindingService'
import {Point, PointerEvent} from "leafer-ui";
import {typeUtil} from "@/views/Editor/utils/utils";

export class ContextMenu extends Disposable {

    public pointer: Point | undefined

    constructor(
        @IMLeaferCanvas private readonly canvas: MLeaferCanvas,
        @IKeybindingService private readonly keybindingService: KeybindingService,
    ) {
        super()
        canvas.contentFrame.on(PointerEvent.MENU, (arg: PointerEvent) => {
            this.pointer = new Point(arg.x, arg.y)
            this.showLayerContextMenu(arg)
        })
        canvas.app.editor.on(PointerEvent.MENU, (arg: PointerEvent) => {
            this.pointer = new Point(arg.x, arg.y)
            this.showLayerContextMenu(arg)
        })

    }


    private showBlankContextMenu(e: PointerEvent) {
        e.stopDefault()
        const event = e.origin
        const {mod} = this.keybindingService
        MenuComponent.showContextMenu({
            x: event.clientX,
            y: event.clientY - 5,
            preserveIconWidth: false,
            items: [
                {
                    label: '选择全部',
                    onClick: () => {
                        this.keybindingService.trigger('mod+a')
                    },
                    shortcut: `${mod} A`,
                },
                {
                    label: '粘贴到当前位置',
                    onClick: () => {
                        this.keybindingService.trigger('mod+shift+v')
                    },
                    shortcut: `${mod} ⇧ V`,
                },
                ...zoomItems(),
            ],
        })
    }

    private showLayerContextMenu(e: PointerEvent) {
        e.stopDefault()
        const event = e.origin
        const object = this.canvas.activeObject.value
        // 置空选项
        if (!object || typeUtil.isBottomCanvas(object)) {
            this.showBlankContextMenu(e)
            return
        }

        MenuComponent.showContextMenu({
            x: event.clientX,
            y: event.clientY - 5,
            preserveIconWidth: false,
            items: layerItems(),
        })
    }
}
