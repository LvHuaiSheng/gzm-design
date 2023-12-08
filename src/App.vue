<script setup lang="ts">
</script>

<template>
    <a-config-provider>
        <router-view v-slot="{ Component }">
            <component :is="Component" />
        </router-view>
    </a-config-provider>
</template>

<style scoped>

</style>
