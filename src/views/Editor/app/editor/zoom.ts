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
      zoom = zoom < 0.1 && zoom * 2 > 0.1 ? 0.1 : zoom * 2
      this.zoomToInnerPoint(zoom)
    })

    keybindingService.bind('-', () => {
      let zoom = canvas.ref.zoom.value
      zoom = zoom > 0.1 && zoom / 2 < 0.1 ? 0.1 : zoom / 2
      this.zoomToInnerPoint(zoom)
    })

    // 100%
    keybindingService.bind('mod+0', () => {
      this.zoomToInnerPoint(1)
      return false
    })

    // keybindingService.bind('mod+1', () => {
    //   this.showAllContent()
    //   return false
    // })
    //
    // keybindingService.bind('mod+2', () => {
    //   this.showSelectedContent()
    //   return false
    // })
    this.canvas.contentLayer.on(ZoomEvent.ZOOM ,(arg:ZoomEvent) => {
      // this.canvas.zoom.value = {
      //   scale:this.canvas.contentLayer.scale
      // }
      this.canvas.ref.zoom.value = <number>this.canvas.contentLayer.scale
    })
  }

  public zoomToInnerPoint(zoom:number) {
    this.canvas.zoomToInnerPoint(zoom)
  }

}
