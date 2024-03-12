import { computed } from 'vue'
import { useColorMode, useCycleList, usePreferredDark } from '@vueuse/core'

const mode = useColorMode({
  selector: 'body',
  // attribute: 'arco-theme',
  emitAuto: true,
  storageKey: 'theme',
  initialValue: 'light',
  modes: {
    // custom colors
    // auto: 'auto',
    // dark: 'dark',
    // light: 'light',
    // dim: 'dim',
    // cafe: 'cafe',
  },
})

const preferredDark = usePreferredDark()

const { next } = useCycleList(['light', 'dark', 'auto'], {
  initialValue: mode,
})

const trueMode = computed(() => {
  if (mode.value === 'auto') {
    return preferredDark.value ? '' : 'dark'
  }
  return mode.value
})

const isDark = computed(() => {
  // return trueMode.value === 'dark'
  return false
})

export function useThemes() {
  return {
    isDark,
    mode,
    trueMode,
    next,
  }
}
