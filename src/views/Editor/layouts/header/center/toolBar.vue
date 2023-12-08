<template>
    <div>
        <a-tooltip effect="dark" content="创建分组" mini>
            <a-button class="icon-btn pd-5px"  @click="handleGroupBtnClick" :disabled="!isGroupBtnEnabled">
                <SvgIcon name="object-group"></SvgIcon>
            </a-button>
        </a-tooltip>
        <a-tooltip effect="dark" content="解除分组" mini>
            <a-button class="icon-btn pd-5px"  @click="handleUnGroupBtnClick" :disabled="!isUnGroupBtnEnabled">
                <SvgIcon name="object-ungroup"></SvgIcon>
            </a-button>
        </a-tooltip>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import { useEditor } from '@/views/Editor/app';
import { keybindMap } from '@/views/Editor/utils/constants';
import SvgIcon from '@/components/svgIcon';
import {Frame, Group} from "leafer-ui";

export default defineComponent({
    components: {
        SvgIcon,
    },
    setup() {
        const { canvas, keybinding } = useEditor();

        const isGroupBtnEnabled  = computed(() => {
            return !canvas.activeObjectIsType('Frame') && canvas.getActiveObjects().length > 1;
        })

        const isUnGroupBtnEnabled = computed(() => {
            return canvas.activeObjectIsType('Group')
        })

        const handleGroupBtnClick = () => {
            if (isGroupBtnEnabled) {
                keybinding.trigger(keybindMap.group);
            }
        };
        const handleUnGroupBtnClick = () => {
            if (isUnGroupBtnEnabled) {
                keybinding.trigger(keybindMap.ungroup);
            }
        };

        return {
            isGroupBtnEnabled,
            isUnGroupBtnEnabled,
            handleGroupBtnClick,
            handleUnGroupBtnClick,
        };
    },
});
</script>
