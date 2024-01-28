import { useAppStore } from './modules/app/app'
import { useFontStore } from './modules/font/font'

const pinia = createPinia()

export default pinia

export {
    useAppStore,
    useFontStore,
}
