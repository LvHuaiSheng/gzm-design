<template>
    <div id="page-design" ref="designRef" class="page-design">
        <div
            ref='divRef'
            class="contentBox"
            id="divRef">
        </div>
    </div>
</template>
<script lang="ts">
import {useEditor} from "@/views/Editor/app";
import {useResizeObserver} from "@vueuse/core";

export default defineComponent({
    setup() {

        const divRef = ref()

        onMounted(() => {
            const {canvas} = useEditor()
            divRef.value.append(canvas.wrapperEl)
            /**
             * 解决在Firefox浏览器中canvas的display=none导致画布不显示的问题
             * TODO 待官方修复
             */
            canvas.wrapperEl.style.display = 'block'
            useResizeObserver(divRef, (entries) => {
                const [entry] = entries
                const { width, height } = entry.contentRect
                canvas.app.resize({ width, height })
            })
        })
        return {divRef}
    },
})
</script>
<style scoped lang="less">
@import "../../styles/layouts";
.page-design{
    position: relative;
    overflow: hidden;
}
.contentBox{
    /*box-shadow: 1px 1px 10px 3px rgba(0, 0, 0, 0.1);*/
}

.contentBox {
    width: 100%;
    /*解决画布宽度一直增加的问题*/
    display: flex;
    overflow: hidden;
    height: @contentBoxHeight;
    //background: url('../../../../assets/images/alpha-background.svg');
    //background-size: 10px 10px;
    //background-position-y: 4px;
    background-color: rgb(245, 247, 253);
    //background-color: #e7e7e7;
}
.ruler-pd{
    .contentBox{
        height: @contentBoxHeight;
    }
}
</style>
