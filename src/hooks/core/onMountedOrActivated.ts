import {nextTick, onMounted, onActivated} from 'vue'

export function onMountedOrActivated(hook: Function) {

    let mounted = false

    onMounted(() => {
        hook()
        nextTick(() => {
            mounted = true
        }).then(r => {
        })

    })

    onActivated(() => {
        if (mounted) {
            hook()
        }
    })
}
