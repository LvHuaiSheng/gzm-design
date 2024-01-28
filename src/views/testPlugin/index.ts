import { createEditorPlugin } from '@/views/Editor/core'
import { IMLeaferCanvas } from '@/views/Editor/core/canvas/mLeaferCanvas'
import { random } from 'lodash'
import TestSlot from './testSlot.vue'
// import TestSlot from './testSlot2.vue'
const myPlugin = createEditorPlugin((editor) => {
  const [canvas] = editor.service.invokeFunction((accessor) => {
    return [accessor.get(IMLeaferCanvas)]
  })
  return {
    setup() {
      console.log('myPlugin setup')
      console.log(editor)
      function getRandomColor() {
        return '#' + Math.random().toString(16).substring(2, 8)
      }

    },
    dispose() {
      console.log('myPlugin dispose')
    },
    slots: {
      rightPanel: [TestSlot],
    },
  }
})

export { myPlugin }
