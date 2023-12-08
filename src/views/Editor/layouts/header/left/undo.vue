<template>
    <a-space >
        <a-tooltip effect="dark" content="撤销" mini>
            <a-button class="icon-btn pd-5px">
                <icon-undo :size="18"/>
            </a-button>
        </a-tooltip>
        <a-tooltip effect="dark" content="恢复" mini>
            <a-button class="icon-btn pd-5px" disabled>
                <icon-redo :size="18"/>
            </a-button>
        </a-tooltip>
    </a-space>
</template>

<script>
export default {
    name: "undo"
}
</script>

<style scoped>

</style>
