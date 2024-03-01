// import { IFabricCanvas } from '@/views/Editor/core/canvas/fabricCanvas'
import { IEditorUndoRedoService } from '@/views/Editor/app/editor/undoRedo/undoRedoService'
import { IKeybindingService } from '@/views/Editor/core/keybinding/keybindingService'
// import { IEventbusService } from '@/views/Editor/core/eventbus/eventbusService'
// import { IWorkspacesService } from '@/views/Editor/core/workspaces/workspacesService'
import { EditorMain } from '@/views/Editor/app/editor'
import {IMLeaferCanvas} from "@/views/Editor/core/canvas/mLeaferCanvas";
import {IWorkspacesService} from "@/views/Editor/core/workspaces/workspacesService";
import {IEventbusService} from "@/views/Editor/core/eventbus/eventbusService";

export interface ICoreApp {
  editor: EditorMain
}

export const appInstance: ICoreApp = {
  editor: null!,
}

export const useEditor = () => {
  if (!appInstance.editor) {
    console.warn('app is not ready')
    return undefined!
  }
  return appInstance.editor.service.invokeFunction((accessor) => {
    return {
      editor: accessor.get(IMLeaferCanvas),
      canvas: accessor.get(IMLeaferCanvas),
      keybinding: accessor.get(IKeybindingService),
      undoRedo: accessor.get(IEditorUndoRedoService),
      event: accessor.get(IEventbusService),
      workspaces: accessor.get(IWorkspacesService),
    }
  })
}
