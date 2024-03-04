import {IKeybindingService, KeybindingService} from '@/views/Editor/core/keybinding/keybindingService'
import {Disposable} from '@/views/Editor/utils/lifecycle'
import {Group, Matrix, Point, ZoomEvent} from 'leafer-ui'
import {IMLeaferCanvas, MLeaferCanvas} from "@/views/Editor/core/canvas/mLeaferCanvas";

export class Zoom extends Disposable {
  private scalePadding = 0.9
  constructor(
      @IMLeaferCanvas private readonly canvas: MLeaferCanvas,
      @IKeybindingService private readonly keybindingService: KeybindingService,
  ) {
    super()
    keybindingService.bind('+', () => {
      let zoom = canvas.ref.zoom.value
      zoom *= 2;
      canvas.zoomToInnerPoint(zoom)
    })

      keybindingService.bind('-', () => {
          let zoom = canvas.ref.zoom.value;
          if (zoom <= 0.01) {
              canvas.zoomToInnerPoint(0.01); // 如果当前缩放比例小于等于 0.1，则保持为 0.1
          } else {
              zoom /= 2;
              canvas.zoomToInnerPoint(zoom);
          }
      });

    // 100%
    keybindingService.bind('mod+0', () => {
      canvas.zoomToInnerPoint(1)
      return false
    })

    this.canvas.contentLayer.on(ZoomEvent.ZOOM ,(arg:ZoomEvent) => {
      this.canvas.ref.zoom.value = <number>this.canvas.contentLayer.scale
    })
  }
}
